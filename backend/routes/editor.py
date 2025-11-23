"""
AI Editor Routes
API endpoints for AI-powered text generation
"""

from flask import Blueprint, request, jsonify
from services.ai_editor_service import AIEditorService
from services.story_bible_service import StoryBibleService
from firebase_admin import firestore
import firebase_admin
from utils.rate_limiter import ai_rate_limit
from utils.auth import require_auth
from utils.validation import validate_request
from schemas.editor_schemas import (
    GenerateSceneRequest,
    GenerateDialogueRequest,
    RewriteTextRequest,
    ExpandTextRequest,
    SummarizeTextRequest,
    ContinueWritingRequest
)

bp = Blueprint('editor', __name__)

# Initialize services
ai_editor_service = AIEditorService()

try:
    if firebase_admin._apps:
        db = firestore.client()
        story_bible_service = StoryBibleService(db)
    else:
        print("Warning: Firebase not initialized in editor.py")
        story_bible_service = StoryBibleService(None)
except Exception as e:
    print(f"Warning: Failed to initialize Firestore client in editor.py: {e}")
    db = None
    story_bible_service = StoryBibleService(None)

@bp.route('/generate-scene', methods=['POST'])
@require_auth
@ai_rate_limit
@validate_request(GenerateSceneRequest)
def generate_scene(current_user):
    """Generate a new scene with AI"""
    data = request.validated_data
    project_id = data.project_id
    scene_id = data.scene_id
    prompt = data.prompt
    tone = data.tone
    length = data.length
    
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
    if data.characters:
        context['characters'] = [
            story_bible_service.get_character(project_id, char_id)
            for char_id in data.characters
        ]

    if data.location_id:
        context['location'] = story_bible_service.get_location(
            project_id, data.location_id
        )
    
    result = ai_editor_service.generate_scene(context, prompt, tone, length)
    return jsonify(result)

@bp.route('/generate-dialogue', methods=['POST'])
@require_auth
@ai_rate_limit
@validate_request(GenerateDialogueRequest)
def generate_dialogue(current_user):
    """Generate dialogue between characters"""
    data = request.validated_data
    project_id = data.project_id
    character_names = data.characters
    situation = data.situation

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
@validate_request(RewriteTextRequest)
def rewrite_text(current_user):
    """Rewrite text with specific instructions"""
    data = request.validated_data
    text = data.text
    instruction = data.instruction
    project_id = data.project_id

    context = None
    if project_id:
        context = {'project': story_bible_service.get_project(project_id)}

    result = ai_editor_service.rewrite_text(text, instruction, context)
    return jsonify(result)

@bp.route('/expand', methods=['POST'])
@require_auth
@ai_rate_limit
@validate_request(ExpandTextRequest)
def expand_text(current_user):
    """Expand text with more detail"""
    data = request.validated_data
    text = data.text
    project_id = data.project_id

    context = None
    if project_id:
        context = {'project': story_bible_service.get_project(project_id)}

    result = ai_editor_service.expand_text(text, context)
    return jsonify(result)

@bp.route('/summarize', methods=['POST'])
@require_auth
@ai_rate_limit
@validate_request(SummarizeTextRequest)
def summarize_text(current_user):
    """Summarize text"""
    data = request.validated_data
    text = data.text

    result = ai_editor_service.summarize_text(text)
    return jsonify(result)

@bp.route('/continue', methods=['POST'])
@require_auth
@ai_rate_limit
@validate_request(ContinueWritingRequest)
def continue_writing(current_user):
    """Continue writing from existing text"""
    data = request.validated_data
    text = data.text
    direction = data.direction or ''
    project_id = data.project_id
    scene_id = data.scene_id

    # Get context
    context = {}
    if scene_id:
        context = story_bible_service.get_context_for_scene(project_id, scene_id)
    elif project_id:
        context = {'project': story_bible_service.get_project(project_id)}

    result = ai_editor_service.continue_writing(text, context, direction)
    return jsonify(result)
