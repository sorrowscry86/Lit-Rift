import sqlite3
from datetime import datetime
from typing import Optional, List, Dict
from .schema import DatabaseSchema, DB_PATH

class DatabaseManager:
    """High-level database operations for offline-first sync"""

    def __init__(self):
        DatabaseSchema.init_database()

    def _get_conn(self):
        """Get database connection"""
        return DatabaseSchema.get_connection()

    # === Document Operations ===

    async def save_document(self, user_id: str, doc_id: str, content: str,
                           device_id: str, title: str = None) -> Dict:
        """
        Save document locally. Auto-increments version, sets is_synced=False.
        Returns: { version, timestamp, ... }
        """
        conn = self._get_conn()
        cursor = conn.cursor()
        now = datetime.utcnow().isoformat()

        try:
            # Get current version
            cursor.execute(
                'SELECT version FROM documents WHERE id = ? AND user_id = ?',
                (doc_id, user_id)
            )
            row = cursor.fetchone()
            new_version = (row['version'] + 1) if row else 1

            # Insert or update
            cursor.execute('''
                INSERT OR REPLACE INTO documents
                (id, user_id, content, title, version, last_edited, device_id, is_synced, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
            ''', (doc_id, user_id, content, title, new_version, now, device_id, now, now))

            # Add to sync queue
            cursor.execute('''
                INSERT INTO sync_queue
                (document_id, user_id, action, content, device_id, version, timestamp)
                VALUES (?, ?, 'update', ?, ?, ?, ?)
            ''', (doc_id, user_id, content, device_id, new_version, now))

            conn.commit()

            return {
                'version': new_version,
                'last_edited': now,
                'is_synced': False,
                'device_id': device_id
            }
        finally:
            conn.close()

    async def get_document(self, user_id: str, doc_id: str) -> Optional[Dict]:
        """Fetch latest version of document"""
        conn = self._get_conn()
        cursor = conn.cursor()

        cursor.execute(
            'SELECT * FROM documents WHERE id = ? AND user_id = ? LIMIT 1',
            (doc_id, user_id)
        )
        row = cursor.fetchone()
        conn.close()

        return dict(row) if row else None

    async def get_all_documents(self, user_id: str) -> List[Dict]:
        """Get all documents for user"""
        conn = self._get_conn()
        cursor = conn.cursor()

        cursor.execute('SELECT * FROM documents WHERE user_id = ?', (user_id,))
        rows = cursor.fetchall()
        conn.close()

        return [dict(row) for row in rows]

    # === Sync Queue Operations ===

    async def get_sync_queue(self, user_id: str) -> List[Dict]:
        """Get all pending changes for syncing"""
        conn = self._get_conn()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT * FROM sync_queue WHERE user_id = ? ORDER BY timestamp ASC
        ''', (user_id,))
        rows = cursor.fetchall()
        conn.close()

        return [dict(row) for row in rows]

    async def clear_sync_queue_for_doc(self, user_id: str, doc_id: str):
        """Remove document from sync queue after successful push"""
        conn = self._get_conn()
        cursor = conn.cursor()

        cursor.execute(
            'DELETE FROM sync_queue WHERE user_id = ? AND document_id = ?',
            (user_id, doc_id)
        )
        cursor.execute(
            'UPDATE documents SET is_synced = 1 WHERE user_id = ? AND id = ?',
            (user_id, doc_id)
        )

        conn.commit()
        conn.close()

    # === Conflict Operations ===

    async def record_conflict(self, user_id: str, doc_id: str,
                             local_version: int, cloud_version: int,
                             local_device: str, cloud_device: str,
                             local_timestamp: str, cloud_timestamp: str) -> Dict:
        """Record detected conflict for UI resolution"""
        conn = self._get_conn()
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO sync_conflicts
            (document_id, user_id, local_version, cloud_version, local_device_id,
             cloud_device_id, local_timestamp, cloud_timestamp, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        ''', (doc_id, user_id, local_version, cloud_version, local_device,
              cloud_device, local_timestamp, cloud_timestamp))

        conflict_id = cursor.lastrowid
        conn.commit()
        conn.close()

        return {'conflict_id': conflict_id}

    async def get_pending_conflicts(self, user_id: str) -> List[Dict]:
        """Get all unresolved conflicts for user"""
        conn = self._get_conn()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT * FROM sync_conflicts
            WHERE user_id = ? AND status = 'pending'
            ORDER BY id DESC
        ''', (user_id,))
        rows = cursor.fetchall()
        conn.close()

        return [dict(row) for row in rows]

    async def resolve_conflict(self, conflict_id: int, choice: str) -> bool:
        """Mark conflict as resolved with user's choice (local or cloud)"""
        conn = self._get_conn()
        cursor = conn.cursor()
        now = datetime.utcnow().isoformat()

        cursor.execute('''
            UPDATE sync_conflicts
            SET status = 'resolved', resolution_choice = ?, resolved_at = ?
            WHERE id = ?
        ''', (choice, now, conflict_id))

        conn.commit()
        affected = cursor.rowcount
        conn.close()

        return affected > 0

    # === Device Operations ===

    async def register_device(self, device_id: str, device_name: str, app_version: str):
        """Register or update device in database"""
        conn = self._get_conn()
        cursor = conn.cursor()
        now = datetime.utcnow().isoformat()

        cursor.execute('''
            INSERT OR REPLACE INTO device_info
            (device_id, device_name, app_version, last_sync, created_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (device_id, device_name, app_version, now, now))

        conn.commit()
        conn.close()
