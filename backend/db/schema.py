import sqlite3
import os
from datetime import datetime
from typing import Optional, List, Dict
import platform

# Cross-platform database path
def get_db_path():
    """Get database path based on OS"""
    if platform.system() == 'Windows':
        base_path = os.path.join(os.getenv('APPDATA'), 'LitRift')
    else:
        # Linux/Mac: use XDG_DATA_HOME or ~/.local/share
        base_path = os.path.join(
            os.getenv('XDG_DATA_HOME', os.path.expanduser('~/.local/share')),
            'LitRift'
        )
    return os.path.join(base_path, 'litrift.db')

DB_PATH = get_db_path()

class DatabaseSchema:
    """Initialize and manage SQLite schema for offline-first storage"""

    @staticmethod
    def init_database():
        """Create database file and all tables if they don't exist"""
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Table 1: Documents (source of truth)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                content TEXT NOT NULL,
                title TEXT,
                type TEXT DEFAULT 'manuscript',
                version INTEGER DEFAULT 1,
                last_edited TEXT NOT NULL,
                device_id TEXT NOT NULL,
                is_synced BOOLEAN DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                UNIQUE(user_id, id)
            )
        ''')

        # Table 2: Sync Queue (pending changes)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sync_queue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                document_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                action TEXT,
                content TEXT,
                device_id TEXT NOT NULL,
                version INTEGER,
                timestamp TEXT NOT NULL,
                FOREIGN KEY (document_id) REFERENCES documents(id)
            )
        ''')

        # Table 3: Conflicts (detected mismatches)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sync_conflicts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                document_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                local_version INTEGER,
                cloud_version INTEGER,
                local_device_id TEXT,
                cloud_device_id TEXT,
                local_timestamp TEXT,
                cloud_timestamp TEXT,
                status TEXT DEFAULT 'pending',
                resolution_choice TEXT,
                resolved_at TEXT,
                FOREIGN KEY (document_id) REFERENCES documents(id)
            )
        ''')

        # Table 4: Device Info
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS device_info (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                device_id TEXT UNIQUE NOT NULL,
                device_name TEXT,
                app_version TEXT,
                last_sync TEXT,
                created_at TEXT NOT NULL
            )
        ''')

        # Create indexes for performance
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_user_documents ON documents(user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_document_synced ON documents(is_synced)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_sync_queue_user ON sync_queue(user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_conflicts_user ON sync_conflicts(user_id, status)')

        conn.commit()
        conn.close()

    @staticmethod
    def get_connection():
        """Get SQLite connection with row factory for dict access"""
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn
