import asyncio
import logging
from datetime import datetime
from typing import Callable, Optional

logger = logging.getLogger(__name__)

class BackgroundSyncWorker:
    """
    Run continuous background sync every 30 seconds when online.
    Syncs all unsync'd documents, emits conflict events to frontend.
    """

    def __init__(self, db_manager, sync_service, firebase_adapter,
                 user_id: str, device_id: str,
                 on_conflict_callback: Optional[Callable] = None,
                 sync_interval: int = 30):
        self.db = db_manager
        self.sync_service = sync_service
        self.firebase = firebase_adapter
        self.user_id = user_id
        self.device_id = device_id
        self.on_conflict_callback = on_conflict_callback
        self.sync_interval = sync_interval
        self.is_running = False
        self.last_sync_time = None
        self.is_online = True

    async def check_online(self) -> bool:
        """
        Check if Firebase is reachable.
        Returns: True if online, False if offline
        """
        try:
            # Check if firebase adapter is available
            if not self.firebase or not self.firebase.check_connection():
                self.is_online = False
                return False

            # Try a lightweight check (fetch a non-existent doc is fast)
            doc = await self.firebase.fetch_document(self.user_id, '__health_check__')
            self.is_online = True
            return True
        except Exception as e:
            logger.debug(f"Offline check failed: {e}")
            self.is_online = False
            return False

    async def sync_all_documents(self) -> dict:
        """
        Sync all unsync'd documents.
        Returns: {
            'synced_count': int,
            'conflict_count': int,
            'conflicts': [{ doc_id, local_version, cloud_version, ... }],
            'error_count': int,
            'timestamp': str
        }
        """
        result = {
            'synced_count': 0,
            'conflict_count': 0,
            'conflicts': [],
            'error_count': 0,
            'timestamp': datetime.utcnow().isoformat()
        }

        try:
            # Get all pending documents in sync queue
            sync_queue = await self.db.get_sync_queue(self.user_id)

            if not sync_queue:
                return result  # Nothing to sync

            logger.info(f"Starting background sync: {len(sync_queue)} pending documents")

            # Process each document
            for item in sync_queue:
                doc_id = item['document_id']

                try:
                    # Fetch local and cloud versions
                    local_doc = await self.db.get_document(self.user_id, doc_id)
                    cloud_doc = await self.firebase.fetch_document(self.user_id, doc_id)

                    # Skip if local doc doesn't exist
                    if not local_doc:
                        logger.warning(f"Local document missing: {doc_id}")
                        result['error_count'] += 1
                        continue

                    # If cloud doesn't exist, create it
                    if not cloud_doc:
                        await self.firebase.push_document(
                            self.user_id, doc_id, local_doc['content'],
                            local_doc['version'], self.device_id, local_doc.get('title')
                        )
                        await self.db.clear_sync_queue_for_doc(self.user_id, doc_id)
                        result['synced_count'] += 1
                        logger.info(f"Pushed new document: {doc_id}")
                        continue

                    # Detect conflict
                    sync_result = await self.sync_service.sync_document(
                        self.user_id, doc_id, local_doc, cloud_doc, self.firebase
                    )

                    if sync_result['status'] == 'synced':
                        result['synced_count'] += 1
                        logger.debug(f"Synced document: {doc_id} ({sync_result['action']})")

                    elif sync_result['status'] == 'conflict':
                        result['conflict_count'] += 1

                        # Get conflict details for callback
                        conflicts = await self.db.get_pending_conflicts(self.user_id)
                        conflict = next((c for c in conflicts if c['document_id'] == doc_id), None)

                        if conflict:
                            result['conflicts'].append({
                                'id': conflict['id'],
                                'doc_id': doc_id,
                                'local_version': conflict['local_version'],
                                'cloud_version': conflict['cloud_version'],
                                'local_device': conflict['local_device_id'],
                                'cloud_device': conflict['cloud_device_id'],
                                'local_timestamp': conflict['local_timestamp'],
                                'cloud_timestamp': conflict['cloud_timestamp']
                            })
                            logger.warning(f"Conflict detected: {doc_id}")

                            # Emit callback if registered
                            if self.on_conflict_callback:
                                try:
                                    await self.on_conflict_callback(conflict)
                                except Exception as cb_error:
                                    logger.error(f"Conflict callback failed: {cb_error}")

                    elif sync_result['status'] == 'error':
                        result['error_count'] += 1
                        logger.error(f"Sync error for {doc_id}: {sync_result.get('message')}")

                except Exception as e:
                    result['error_count'] += 1
                    logger.error(f"Failed to sync {doc_id}: {e}")

        except Exception as e:
            logger.error(f"Background sync failed: {e}")
            result['error_count'] += 1

        self.last_sync_time = result['timestamp']
        logger.info(f"Background sync complete: {result['synced_count']} synced, "
                   f"{result['conflict_count']} conflicts, {result['error_count']} errors")

        return result

    async def run(self):
        """
        Main loop: sync every 30 seconds while online.
        Gracefully handles offline periods.
        """
        self.is_running = True
        logger.info(f"Background sync worker started (interval: {self.sync_interval}s)")

        while self.is_running:
            try:
                # Check if online
                if await self.check_online():
                    # Sync documents
                    await self.sync_all_documents()
                else:
                    logger.debug("Offline, skipping sync")

                # Wait before next sync
                await asyncio.sleep(self.sync_interval)

            except Exception as e:
                logger.error(f"Background sync worker error: {e}")
                await asyncio.sleep(self.sync_interval)

    async def stop(self):
        """Stop the background worker"""
        self.is_running = False
        logger.info("Background sync worker stopped")

    def get_status(self) -> dict:
        """Get current worker status"""
        return {
            'is_running': self.is_running,
            'is_online': self.is_online,
            'last_sync_time': self.last_sync_time,
            'sync_interval': self.sync_interval
        }
