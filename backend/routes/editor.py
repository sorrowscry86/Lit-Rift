"""
AI Editor Routes
API endpoints for AI-powered text generation
"""

from flask import Blueprint, request, jsonify
from services.ai_editor_service import AIEditorService
from services.story_bible_service import StoryBibleService
from firebase_admin import firestore
from utils.rate_limiter import ai_rate_limit
from utils.auth import require_auth

bp = Blueprint('editor', __name__)

# Initialize services
ai_editor_service = AIEditorService()

try:
    db = firestore.client()
    story_bible_service = StoryBibleService(db)
except Exception as e:
    print(f"Warning: Failed to initialize Firestore client: {e}")
    db = None
    story_bible_service = StoryBibleService(None)

@bp.route('/generate-scene', methods=['POST'])
@require_auth
@ai_rate_limit
def generate_scene(current_user):
    """Generate a new scene with AI"""
    data = request.json
    project_id = data.get('project_id')
    scene_id = data.get('scene_id')
    prompt = data.get('prompt', '')
    tone = data.get('tone', 'neutral')
    length = data.get('length', 'medium')
    
    # Get Story Bible context
    context = {}
    if scene_id:
        context = story_bible_service.get_context_for_scene(project_id, scene_id)
    elif project_id:
        # Get basic project context
        project = story_bible_service.get_project(project_id)
        if project:
            context['project'] = project
    
    # Add any additional context from request
    if data.get('characters'):
        context['characters'] = [
            story_bible_service.get_character(project_id, char_id)
            for char_id in data['characters']
        ]
    
    if data.get('location_id'):
        context['location'] = story_bible_service.get_location(
            project_id, data['location_id']
        )
    
    result = ai_editor_service.generate_scene(context, prompt, tone, length)
    return jsonify(result)

@bp.route('/generate-dialogue', methods=['POST'])
@require_auth
@ai_rate_limit
def generate_dialogue(current_user):
    """Generate dialogue between characters"""
    data = request.json
    project_id = data.get('project_id')
    character_names = data.get('characters', [])
    situation = data.get('situation', '')

    # Get Story Bible context
    context = {'project': story_bible_service.get_project(project_id)}

    # Get character details
    all_characters = story_bible_service.list_characters(project_id)
    context['characters'] = [
        char for char in all_characters
        if char['name'] in character_names
    ]

    result = ai_editor_service.generate_dialogue(
        context, character_names, situation
    )
    return jsonify(result)

@bp.route('/rewrite', methods=['POST'])
@require_auth
@ai_rate_limit
def rewrite_text(current_user):
    """Rewrite text with specific instructions"""
    data = request.json
    text = data.get('text', '')
    instruction = data.get('instruction', '')
    project_id = data.get('project_id')

    context = None
    if project_id:
        context = {'project': story_bible_service.get_project(project_id)}

    result = ai_editor_service.rewrite_text(text, instruction, context)
    return jsonify(result)

@bp.route('/expand', methods=['POST'])
@require_auth
@ai_rate_limit
def expand_text(current_user):
    """Expand text with more detail"""
    data = request.json
    text = data.get('text', '')
    project_id = data.get('project_id')

    context = None
    if project_id:
        context = {'project': story_bible_service.get_project(project_id)}

    result = ai_editor_service.expand_text(text, context)
    return jsonify(result)

@bp.route('/summarize', methods=['POST'])
@require_auth
@ai_rate_limit
def summarize_text(current_user):
    """Summarize text"""
    data = request.json
    text = data.get('text', '')

    result = ai_editor_service.summarize_text(text)
    return jsonify(result)

@bp.route('/continue', methods=['POST'])
@require_auth
@ai_rate_limit
def continue_writing(current_user):
    """Continue writing from existing text"""
    data = request.json
    text = data.get('text', '')
    direction = data.get('direction', '')
    project_id = data.get('project_id')
    scene_id = data.get('scene_id')

    # Get context
    context = {}
    if scene_id:
        context = story_bible_service.get_context_for_scene(project_id, scene_id)
    elif project_id:
        context = {'project': story_bible_service.get_project(project_id)}

    result = ai_editor_service.continue_writing(text, context, direction)
    return jsonify(result)
