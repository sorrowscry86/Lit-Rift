"""
Story Bible Routes
API endpoints for managing story elements
"""

from flask import Blueprint, request, jsonify
from services.story_bible_service import StoryBibleService
from firebase_admin import firestore

bp = Blueprint('story_bible', __name__)

# Initialize service
try:
    db = firestore.client()
    story_bible_service = StoryBibleService(db)
except:
    db = None
    story_bible_service = StoryBibleService(None)

# Project routes
@bp.route('/projects', methods=['GET'])
def list_projects():
    """List all projects"""
    projects = story_bible_service.list_projects()
    return jsonify(projects)

@bp.route('/projects', methods=['POST'])
def create_project():
    """Create a new project"""
    data = request.json
    project = story_bible_service.create_project(data)
    return jsonify(project), 201

@bp.route('/projects/<project_id>', methods=['GET'])
def get_project(project_id):
    """Get a project by ID"""
    project = story_bible_service.get_project(project_id)
    if project:
        return jsonify(project)
    return jsonify({'error': 'Project not found'}), 404

# Character routes
@bp.route('/projects/<project_id>/characters', methods=['GET'])
def list_characters(project_id):
    """List all characters in a project"""
    characters = story_bible_service.list_characters(project_id)
    return jsonify(characters)

@bp.route('/projects/<project_id>/characters', methods=['POST'])
def create_character(project_id):
    """Create a new character"""
    data = request.json
    character = story_bible_service.create_character(project_id, data)
    return jsonify(character), 201

@bp.route('/projects/<project_id>/characters/<character_id>', methods=['GET'])
def get_character(project_id, character_id):
    """Get a character by ID"""
    character = story_bible_service.get_character(project_id, character_id)
    if character:
        return jsonify(character)
    return jsonify({'error': 'Character not found'}), 404

@bp.route('/projects/<project_id>/characters/<character_id>', methods=['PUT'])
def update_character(project_id, character_id):
    """Update a character"""
    data = request.json
    character = story_bible_service.update_character(project_id, character_id, data)
    return jsonify(character)

@bp.route('/projects/<project_id>/characters/<character_id>', methods=['DELETE'])
def delete_character(project_id, character_id):
    """Delete a character"""
    success = story_bible_service.delete_character(project_id, character_id)
    if success:
        return '', 204
    return jsonify({'error': 'Failed to delete character'}), 500

# Location routes
@bp.route('/projects/<project_id>/locations', methods=['GET'])
def list_locations(project_id):
    """List all locations in a project"""
    locations = story_bible_service.list_locations(project_id)
    return jsonify(locations)

@bp.route('/projects/<project_id>/locations', methods=['POST'])
def create_location(project_id):
    """Create a new location"""
    data = request.json
    location = story_bible_service.create_location(project_id, data)
    return jsonify(location), 201

@bp.route('/projects/<project_id>/locations/<location_id>', methods=['GET'])
def get_location(project_id, location_id):
    """Get a location by ID"""
    location = story_bible_service.get_location(project_id, location_id)
    if location:
        return jsonify(location)
    return jsonify({'error': 'Location not found'}), 404

@bp.route('/projects/<project_id>/locations/<location_id>', methods=['PUT'])
def update_location(project_id, location_id):
    """Update a location"""
    data = request.json
    location = story_bible_service.update_location(project_id, location_id, data)
    return jsonify(location)

# Lore routes
@bp.route('/projects/<project_id>/lore', methods=['GET'])
def list_lore(project_id):
    """List all lore entries in a project"""
    lore = story_bible_service.list_lore(project_id)
    return jsonify(lore)

@bp.route('/projects/<project_id>/lore', methods=['POST'])
def create_lore(project_id):
    """Create a new lore entry"""
    data = request.json
    lore = story_bible_service.create_lore(project_id, data)
    return jsonify(lore), 201

# Plot routes
@bp.route('/projects/<project_id>/plot-points', methods=['GET'])
def list_plot_points(project_id):
    """List all plot points in a project"""
    plot_points = story_bible_service.list_plot_points(project_id)
    return jsonify(plot_points)

@bp.route('/projects/<project_id>/plot-points', methods=['POST'])
def create_plot_point(project_id):
    """Create a new plot point"""
    data = request.json
    plot_point = story_bible_service.create_plot_point(project_id, data)
    return jsonify(plot_point), 201

# Scene routes
@bp.route('/projects/<project_id>/scenes', methods=['GET'])
def list_scenes(project_id):
    """List all scenes in a project"""
    scenes = story_bible_service.list_scenes(project_id)
    return jsonify(scenes)

@bp.route('/projects/<project_id>/scenes', methods=['POST'])
def create_scene(project_id):
    """Create a new scene"""
    data = request.json
    scene = story_bible_service.create_scene(project_id, data)
    return jsonify(scene), 201

@bp.route('/projects/<project_id>/scenes/<scene_id>', methods=['GET'])
def get_scene(project_id, scene_id):
    """Get a scene by ID"""
    scene = story_bible_service.get_scene(project_id, scene_id)
    if scene:
        return jsonify(scene)
    return jsonify({'error': 'Scene not found'}), 404

@bp.route('/projects/<project_id>/scenes/<scene_id>', methods=['PUT'])
def update_scene(project_id, scene_id):
    """Update a scene"""
    data = request.json
    scene = story_bible_service.update_scene(project_id, scene_id, data)
    return jsonify(scene)

@bp.route('/projects/<project_id>/scenes/<scene_id>/context', methods=['GET'])
def get_scene_context(project_id, scene_id):
    """Get all Story Bible context for a scene"""
    context = story_bible_service.get_context_for_scene(project_id, scene_id)
    return jsonify(context)
