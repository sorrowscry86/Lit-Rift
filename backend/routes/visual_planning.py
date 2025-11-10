"""
Visual Planning Routes
API endpoints for visual planning tools (Corkboard, Matrix, Outlines)
"""

from flask import Blueprint, request, jsonify
from services.visual_planning_service import VisualPlanningService
from services.story_bible_service import StoryBibleService
from firebase_admin import firestore

bp = Blueprint('visual_planning', __name__)

# Initialize services
try:
    db = firestore.client()
    planning_service = VisualPlanningService(db)
    story_bible_service = StoryBibleService(db)
except:
    db = None
    planning_service = VisualPlanningService(None)
    story_bible_service = StoryBibleService(None)

@bp.route('/corkboard/<project_id>', methods=['GET'])
def get_corkboard(project_id):
    """Get corkboard layout for a project"""
    corkboard = planning_service.get_corkboard(project_id)
    return jsonify(corkboard)

@bp.route('/corkboard/<project_id>', methods=['POST'])
def save_corkboard(project_id):
    """Save corkboard layout"""
    data = request.json
    result = planning_service.save_corkboard(project_id, data)
    return jsonify(result)

@bp.route('/corkboard/<project_id>/items', methods=['POST'])
def add_corkboard_item(project_id):
    """Add an item to the corkboard"""
    data = request.json
    item = planning_service.add_corkboard_item(project_id, data)
    return jsonify(item), 201

@bp.route('/matrix/<project_id>', methods=['GET'])
def get_matrix(project_id):
    """Get matrix/grid layout for a project"""
    matrix = planning_service.get_matrix(project_id)
    return jsonify(matrix)

@bp.route('/matrix/<project_id>', methods=['POST'])
def save_matrix(project_id):
    """Save matrix layout"""
    data = request.json
    result = planning_service.save_matrix(project_id, data)
    return jsonify(result)

@bp.route('/matrix/<project_id>/generate', methods=['POST'])
def generate_matrix(project_id):
    """Generate matrix from scenes and plot points"""
    matrix = planning_service.create_matrix_from_scenes(project_id, story_bible_service)
    return jsonify(matrix)

@bp.route('/outline/<project_id>', methods=['GET'])
def get_outline(project_id):
    """Get outline for a project"""
    outline = planning_service.get_outline(project_id)
    return jsonify(outline)

@bp.route('/outline/<project_id>', methods=['POST'])
def save_outline(project_id):
    """Save outline"""
    data = request.json
    result = planning_service.save_outline(project_id, data)
    return jsonify(result)

@bp.route('/outline/<project_id>/generate', methods=['POST'])
def generate_outline(project_id):
    """Generate outline from plot points and scenes"""
    outline = planning_service.generate_outline_from_plot(project_id, story_bible_service)
    return jsonify(outline)
