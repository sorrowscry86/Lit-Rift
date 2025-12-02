from datetime import datetime
from typing import Dict, Optional, List

class FirebaseSyncAdapter:
    """Handle all Firebase push/pull operations"""

    def __init__(self, firebase_client):
        """
        Initialize with Firestore client
        Args:
            firebase_client: firestore.client() instance from firebase_admin
        """
        self.db = firebase_client

    async def push_document(self, user_id: str, doc_id: str, content: str,
                           version: int, device_id: str, title: str = None) -> Dict:
        """
        Push document to Firebase.
        Overwrites remote version (user has resolved conflicts, this is final).
        """
        doc_ref = self.db.collection('users').document(user_id).collection('documents').document(doc_id)

        doc_data = {
            'content': content,
            'version': version,
            'device_id': device_id,
            'last_edited': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }

        if title is not None:
            doc_data['title'] = title

        doc_ref.set(doc_data, merge=True)

        return {'success': True, 'synced_at': datetime.utcnow().isoformat()}

    async def fetch_document(self, user_id: str, doc_id: str) -> Optional[Dict]:
        """Fetch document from Firebase"""
        doc_ref = self.db.collection('users').document(user_id).collection('documents').document(doc_id)
        doc = doc_ref.get()

        if doc.exists:
            data = doc.to_dict()
            data['id'] = doc_id
            return data

        return None

    async def get_all_documents(self, user_id: str) -> List[Dict]:
        """Batch fetch all user documents from Firebase"""
        docs_ref = self.db.collection('users').document(user_id).collection('documents')
        docs = docs_ref.stream()

        result = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            result.append(data)

        return result

    async def delete_document(self, user_id: str, doc_id: str) -> bool:
        """Delete document from Firebase"""
        try:
            doc_ref = self.db.collection('users').document(user_id).collection('documents').document(doc_id)
            doc_ref.delete()
            return True
        except Exception as e:
            return False

    def check_connection(self) -> bool:
        """Check if Firebase connection is available"""
        return self.db is not None
