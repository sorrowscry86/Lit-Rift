"""
Continuity Tracker Routes
API endpoints for AI-powered continuity checking
"""

from flask import Blueprint, request, jsonify
from services.continuity_tracker_service import ContinuityTrackerService
from services.story_bible_service import StoryBibleService
from firebase_admin import firestore
from utils.auth import require_project_access
from utils.rate_limiter import ai_rate_limit

bp = Blueprint('continuity', __name__)

# Initialize services
try:
    db = firestore.client()
    continuity_service = ContinuityTrackerService(db)
    story_bible_service = StoryBibleService(db)
except Exception as e:
    print(f"Warning: Failed to initialize Firestore client: {e}")
    db = None
    continuity_service = ContinuityTrackerService(None)
    story_bible_service = StoryBibleService(None)

@bp.route('/check/<project_id>', methods=['POST'])
@require_project_access
@ai_rate_limit
def check_continuity(current_user, project_id):
    """Check for continuity issues in the manuscript"""
    result = continuity_service.perform_full_check(project_id, story_bible_service)
    return jsonify(result)

@bp.route('/issues/<project_id>', methods=['GET'])
@require_project_access
def get_issues(current_user, project_id):
    """Get list of continuity issues"""
    issues = continuity_service.get_issues(project_id)
    return jsonify({
        'project_id': project_id,
        'issues': issues,
        'total': len(issues)
    })

@bp.route('/resolve/<project_id>/<issue_id>', methods=['POST'])
@require_project_access
def resolve_issue(current_user, project_id, issue_id):
    """Mark a continuity issue as resolved"""
    success = continuity_service.resolve_issue(project_id, issue_id)
    if success:
        return jsonify({
            'issue_id': issue_id,
            'resolved': True
        })
    return jsonify({'error': 'Failed to resolve issue'}), 500
