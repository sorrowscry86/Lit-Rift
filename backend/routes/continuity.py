"""
Continuity Tracker Routes
API endpoints for AI-powered continuity checking
"""

from flask import Blueprint, request, jsonify
from services.continuity_tracker_service import ContinuityTrackerService
from services.story_bible_service import StoryBibleService
from firebase_admin import firestore

bp = Blueprint('continuity', __name__)

# Initialize services
try:
    db = firestore.client()
    continuity_service = ContinuityTrackerService(db)
    story_bible_service = StoryBibleService(db)
except:
    db = None
    continuity_service = ContinuityTrackerService(None)
    story_bible_service = StoryBibleService(None)

@bp.route('/check/<project_id>', methods=['POST'])
def check_continuity(project_id):
    """Check for continuity issues in the manuscript"""
    result = continuity_service.perform_full_check(project_id, story_bible_service)
    return jsonify(result)

@bp.route('/issues/<project_id>', methods=['GET'])
def get_issues(project_id):
    """Get list of continuity issues"""
    issues = continuity_service.get_issues(project_id)
    return jsonify({
        'project_id': project_id,
        'issues': issues,
        'total': len(issues)
    })

@bp.route('/resolve/<project_id>/<issue_id>', methods=['POST'])
def resolve_issue(project_id, issue_id):
    """Mark a continuity issue as resolved"""
    success = continuity_service.resolve_issue(project_id, issue_id)
    if success:
        return jsonify({
            'issue_id': issue_id,
            'resolved': True
        })
    return jsonify({'error': 'Failed to resolve issue'}), 500
