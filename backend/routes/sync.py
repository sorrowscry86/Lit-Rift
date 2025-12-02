"""
Sync Routes
API endpoints for offline-first multi-device sync
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
import firebase_admin
from firebase_admin import firestore
import uuid
import platform

from utils.auth import require_auth
from db.connection import DatabaseManager
from services.sync_service import SyncService
from services.firebase_sync import FirebaseSyncAdapter

bp = Blueprint('sync', __name__)

# Initialize services
db_manager = None
firebase_adapter = None

try:
    if firebase_admin._apps:
        db = firestore.client()
        firebase_adapter = FirebaseSyncAdapter(db)
        db_manager = DatabaseManager()
        print("Sync services initialized successfully")
    else:
        print("Warning: Firebase not initialized in sync.py")
except Exception as e:
    print(f"Warning: Failed to initialize sync services: {e}")

def get_device_id():
    """Get or generate device ID"""
    # In production, this would be stored persistently
    # For now, generate a device ID based on platform
    return f"{platform.node()}-{uuid.uuid4().hex[:8]}"

def get_sync_service():
    """Get sync service instance with device ID"""
    device_id = get_device_id()
    return SyncService(db_manager, device_id)

@bp.route('/push', methods=['POST'])
@require_auth
async def push_changes(current_user):
    """
    Frontend sends unsync'd documents.
    Input: { documents: [{ doc_id, content, version, device_id }, ...] }
    Returns: { synced: [...], conflicts: [...], errors: [...] }
    """
    if not db_manager or not firebase_adapter:
        return jsonify({'error': 'Sync services not available'}), 503

    data = request.json
    user_id = current_user['uid']

    if not data.get('documents'):
        return jsonify({'error': 'Missing documents'}), 400

    sync_service = get_sync_service()
    results = {'synced': [], 'conflicts': [], 'errors': []}

    for doc in data['documents']:
        doc_id = doc.get('doc_id')
        if not doc_id:
            continue

        try:
            local_doc = await db_manager.get_document(user_id, doc_id)

            if not local_doc:
                results['errors'].append({'doc_id': doc_id, 'error': 'Document not found locally'})
                continue

            cloud_doc = await firebase_adapter.fetch_document(user_id, doc_id)

            if not cloud_doc:
                # Document doesn't exist in cloud, push it
                await firebase_adapter.push_document(
                    user_id, doc_id, local_doc['content'],
                    local_doc['version'], local_doc['device_id'],
                    local_doc.get('title')
                )
                await db_manager.clear_sync_queue_for_doc(user_id, doc_id)
                results['synced'].append({'doc_id': doc_id})
                continue

            sync_result = await sync_service.sync_document(
                user_id, doc_id, local_doc, cloud_doc, firebase_adapter
            )

            if sync_result['status'] == 'synced':
                results['synced'].append({'doc_id': doc_id})
            elif sync_result['status'] == 'conflict':
                results['conflicts'].append({'doc_id': doc_id})
            else:
                results['errors'].append({'doc_id': doc_id, 'error': sync_result.get('message', 'Unknown error')})
        except Exception as e:
            results['errors'].append({'doc_id': doc_id, 'error': str(e)})

    return jsonify(results), 200


@bp.route('/resolve-conflict', methods=['POST'])
@require_auth
async def resolve_conflict(current_user):
    """
    User resolved conflict by choosing local or cloud version.
    Input: { conflict_id, choice: 'local' | 'cloud' }
    """
    if not db_manager or not firebase_adapter:
        return jsonify({'error': 'Sync services not available'}), 503

    data = request.json
    user_id = current_user['uid']

    conflict_id = data.get('conflict_id')
    choice = data.get('choice')

    if not conflict_id or choice not in ['local', 'cloud']:
        return jsonify({'error': 'Invalid conflict_id or choice'}), 400

    sync_service = get_sync_service()

    try:
        success = await sync_service.handle_conflict_resolution(
            user_id, conflict_id, choice, firebase_adapter
        )

        if success:
            return jsonify({'status': 'resolved', 'choice': choice}), 200
        else:
            return jsonify({'error': 'Failed to resolve conflict'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/status', methods=['GET'])
@require_auth
async def get_sync_status(current_user):
    """Get current sync status for user"""
    if not db_manager:
        return jsonify({'error': 'Sync services not available'}), 503

    user_id = current_user['uid']

    try:
        sync_queue = await db_manager.get_sync_queue(user_id)
        conflicts = await db_manager.get_pending_conflicts(user_id)

        return jsonify({
            'unsync_count': len(sync_queue),
            'conflict_count': len(conflicts),
            'conflicts': conflicts,
            'last_sync': datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/full-sync', methods=['POST'])
@require_auth
async def full_sync(current_user):
    """
    Emergency/startup full sync.
    Fetch all cloud documents, detect conflicts, return what needs resolution.
    """
    if not db_manager or not firebase_adapter:
        return jsonify({'error': 'Sync services not available'}), 503

    user_id = current_user['uid']
    device_id = get_device_id()
    sync_service = get_sync_service()

    try:
        cloud_docs = await firebase_adapter.get_all_documents(user_id)
        local_docs = await db_manager.get_all_documents(user_id)

        conflicts_detected = []
        synced_count = 0

        # Sync cloud documents to local
        for cloud_doc in cloud_docs:
            doc_id = cloud_doc['id']
            local_doc = next((d for d in local_docs if d['id'] == doc_id), None)

            if local_doc:
                sync_result = await sync_service.sync_document(
                    user_id, doc_id, local_doc, cloud_doc, firebase_adapter
                )

                if sync_result['status'] == 'conflict':
                    conflicts_detected.append({
                        'doc_id': doc_id,
                        'local_version': local_doc.get('version'),
                        'cloud_version': cloud_doc.get('version')
                    })
                elif sync_result['status'] == 'synced':
                    synced_count += 1
            else:
                # Cloud-only document, pull it locally
                await db_manager.save_document(
                    user_id, doc_id, cloud_doc['content'],
                    device_id, cloud_doc.get('title')
                )
                await db_manager.clear_sync_queue_for_doc(user_id, doc_id)
                synced_count += 1

        # Push local-only documents to cloud
        for local_doc in local_docs:
            doc_id = local_doc['id']
            cloud_doc = next((d for d in cloud_docs if d['id'] == doc_id), None)

            if not cloud_doc:
                # Local-only document, push to cloud
                await firebase_adapter.push_document(
                    user_id, doc_id, local_doc['content'],
                    local_doc['version'], local_doc['device_id'],
                    local_doc.get('title')
                )
                await db_manager.clear_sync_queue_for_doc(user_id, doc_id)
                synced_count += 1

        return jsonify({
            'synced_count': synced_count,
            'conflict_count': len(conflicts_detected),
            'conflicts': conflicts_detected
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/conflicts', methods=['GET'])
@require_auth
async def get_conflicts(current_user):
    """Get all pending conflicts with document previews"""
    if not db_manager or not firebase_adapter:
        return jsonify({'error': 'Sync services not available'}), 503

    user_id = current_user['uid']

    try:
        conflicts = await db_manager.get_pending_conflicts(user_id)

        # Enrich conflicts with document previews
        enriched_conflicts = []
        for conflict in conflicts:
            doc_id = conflict['document_id']

            # Get local and cloud versions
            local_doc = await db_manager.get_document(user_id, doc_id)
            cloud_doc = await firebase_adapter.fetch_document(user_id, doc_id)

            enriched_conflict = dict(conflict)
            enriched_conflict['local_preview'] = local_doc['content'][:200] if local_doc else None
            enriched_conflict['cloud_preview'] = cloud_doc['content'][:200] if cloud_doc else None

            enriched_conflicts.append(enriched_conflict)

        return jsonify({
            'conflicts': enriched_conflicts,
            'count': len(enriched_conflicts)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
