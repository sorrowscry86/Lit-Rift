from datetime import datetime
from typing import Dict, Optional, List
from enum import Enum

class ConflictType(Enum):
    NO_CONFLICT = "no_conflict"
    READY_TO_PUSH = "ready_to_push"
    NEEDS_PULL = "needs_pull"
    CONFLICT = "conflict"

class SyncService:
    """Core sync logic with multi-device conflict detection"""

    def __init__(self, db_manager, device_id: str):
        self.db = db_manager
        self.device_id = device_id

    def detect_conflict(self, local_doc: Dict, cloud_doc: Dict) -> Dict:
        """
        Detect if local and cloud versions conflict.

        Logic:
        - Same version? → Already synced, no conflict
        - Cloud newer but same device? → Accept cloud (restart scenario)
        - Cloud newer but different device? → CONFLICT (user needs to choose)
        - Local newer? → Ready to push
        """
        local_version = local_doc.get('version', 0)
        cloud_version = cloud_doc.get('version', 0)
        local_device = local_doc.get('device_id')
        cloud_device = cloud_doc.get('device_id')

        if local_version == cloud_version:
            return {
                'conflict_type': ConflictType.NO_CONFLICT,
                'reason': 'Versions match, already synced'
            }

        if cloud_version > local_version:
            if cloud_device == local_device:
                return {
                    'conflict_type': ConflictType.NO_CONFLICT,
                    'reason': 'Cloud version newer but same device (restart case)',
                    'should_accept_cloud': True
                }
            else:
                return {
                    'conflict_type': ConflictType.CONFLICT,
                    'reason': 'Cloud version newer AND different device',
                    'local_version': local_version,
                    'cloud_version': cloud_version,
                    'local_device': local_device,
                    'cloud_device': cloud_device,
                    'local_timestamp': local_doc.get('last_edited'),
                    'cloud_timestamp': cloud_doc.get('last_edited')
                }

        if local_version > cloud_version:
            return {
                'conflict_type': ConflictType.READY_TO_PUSH,
                'reason': 'Local version is newer'
            }

        return {
            'conflict_type': ConflictType.NO_CONFLICT,
            'reason': 'No conflict detected'
        }

    async def sync_document(self, user_id: str, doc_id: str,
                           local_doc: Dict, cloud_doc: Dict,
                           firebase_adapter) -> Dict:
        """
        Sync a single document.
        Returns: { status: 'synced' | 'conflict' | 'error', ... }
        """
        conflict_info = self.detect_conflict(local_doc, cloud_doc)

        if conflict_info['conflict_type'] == ConflictType.NO_CONFLICT:
            if conflict_info.get('should_accept_cloud'):
                # Update local to match cloud
                await self.db.save_document(
                    user_id, doc_id, cloud_doc['content'],
                    self.device_id, cloud_doc.get('title')
                )
                await self.db.clear_sync_queue_for_doc(user_id, doc_id)
                return {'status': 'synced', 'action': 'accepted_cloud'}
            else:
                # Already synced
                await self.db.clear_sync_queue_for_doc(user_id, doc_id)
                return {'status': 'synced', 'action': 'already_synced'}

        elif conflict_info['conflict_type'] == ConflictType.READY_TO_PUSH:
            # Push local to cloud
            try:
                await firebase_adapter.push_document(
                    user_id, doc_id, local_doc['content'],
                    local_doc['version'], self.device_id
                )
                await self.db.clear_sync_queue_for_doc(user_id, doc_id)
                return {'status': 'synced', 'action': 'pushed_to_cloud'}
            except Exception as e:
                return {'status': 'error', 'message': str(e)}

        elif conflict_info['conflict_type'] == ConflictType.CONFLICT:
            # Record conflict, let UI handle it
            await self.db.record_conflict(
                user_id, doc_id,
                conflict_info['local_version'],
                conflict_info['cloud_version'],
                conflict_info['local_device'],
                conflict_info['cloud_device'],
                conflict_info['local_timestamp'],
                conflict_info['cloud_timestamp']
            )
            return {'status': 'conflict', 'needs_resolution': True}

        return {'status': 'unknown', 'error': 'Unknown state'}

    async def auto_sync(self, user_id: str, firebase_adapter) -> Dict:
        """
        Auto-sync all documents:
        1. Get sync queue (pending changes)
        2. For each, fetch cloud version
        3. Detect conflicts
        4. Sync or emit conflict event
        Returns: { synced_count, conflict_count, errors }
        """
        sync_queue = await self.db.get_sync_queue(user_id)
        synced = 0
        conflicts = 0
        errors = 0

        for item in sync_queue:
            doc_id = item['document_id']
            local_doc = await self.db.get_document(user_id, doc_id)

            try:
                cloud_doc = await firebase_adapter.fetch_document(user_id, doc_id)
                result = await self.sync_document(user_id, doc_id, local_doc, cloud_doc, firebase_adapter)

                if result['status'] == 'synced':
                    synced += 1
                elif result['status'] == 'conflict':
                    conflicts += 1
                elif result['status'] == 'error':
                    errors += 1
            except Exception as e:
                errors += 1

        return {
            'synced_count': synced,
            'conflict_count': conflicts,
            'error_count': errors,
            'total_processed': len(sync_queue)
        }

    async def handle_conflict_resolution(self, user_id: str, conflict_id: int,
                                        choice: str, firebase_adapter) -> bool:
        """
        User resolved conflict by choosing 'local' or 'cloud'.
        Update DB and push/pull accordingly.
        """
        conflicts = await self.db.get_pending_conflicts(user_id)
        conflict = next((c for c in conflicts if c['id'] == conflict_id), None)

        if not conflict:
            return False

        doc_id = conflict['document_id']
        local_doc = await self.db.get_document(user_id, doc_id)

        if choice == 'local':
            # Push local version to Firebase
            try:
                await firebase_adapter.push_document(
                    user_id, doc_id, local_doc['content'],
                    local_doc['version'], self.device_id
                )
                await self.db.clear_sync_queue_for_doc(user_id, doc_id)
                await self.db.resolve_conflict(conflict_id, 'local')
                return True
            except Exception as e:
                return False

        elif choice == 'cloud':
            # Pull cloud version, overwrite local
            try:
                cloud_doc = await firebase_adapter.fetch_document(user_id, doc_id)
                await self.db.save_document(
                    user_id, doc_id, cloud_doc['content'],
                    self.device_id, cloud_doc.get('title')
                )
                await self.db.clear_sync_queue_for_doc(user_id, doc_id)
                await self.db.resolve_conflict(conflict_id, 'cloud')
                return True
            except Exception as e:
                return False

        return False
