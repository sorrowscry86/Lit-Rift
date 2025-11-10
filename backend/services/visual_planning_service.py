"""
Visual Planning Service
Handles corkboard, matrix, and outline views for story planning
"""

from typing import List, Dict, Optional
from datetime import datetime
import uuid

class VisualPlanningService:
    """Service for managing visual planning views"""
    
    def __init__(self, db):
        self.db = db
    
    def _get_collection(self, project_id: str, collection_name: str):
        """Get a collection reference for a project"""
        if self.db:
            return self.db.collection('projects').document(project_id).collection(collection_name)
        return None
    
    # Corkboard operations
    def get_corkboard(self, project_id: str) -> Dict:
        """Get corkboard layout for a project"""
        collection = self._get_collection(project_id, 'planning_views')
        if collection:
            doc = collection.document('corkboard').get()
            if doc.exists:
                return doc.to_dict()
        
        # Return empty corkboard structure
        return {
            'view_type': 'corkboard',
            'items': [],
            'connections': []
        }
    
    def save_corkboard(self, project_id: str, data: Dict) -> Dict:
        """Save corkboard layout"""
        timestamp = datetime.utcnow().isoformat()
        
        corkboard_data = {
            'view_type': 'corkboard',
            'items': data.get('items', []),
            'connections': data.get('connections', []),
            'updated_at': timestamp
        }
        
        collection = self._get_collection(project_id, 'planning_views')
        if collection:
            collection.document('corkboard').set(corkboard_data)
        
        return corkboard_data
    
    def add_corkboard_item(self, project_id: str, item_data: Dict) -> Dict:
        """Add an item to the corkboard"""
        item_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        
        item = {
            'id': item_id,
            'type': item_data.get('type', 'note'),  # note, scene, character, plot_point
            'title': item_data.get('title', ''),
            'content': item_data.get('content', ''),
            'position': item_data.get('position', {'x': 0, 'y': 0}),
            'size': item_data.get('size', {'width': 200, 'height': 150}),
            'color': item_data.get('color', '#FFD700'),
            'reference_id': item_data.get('reference_id'),  # Link to actual entity
            'created_at': timestamp,
            'updated_at': timestamp
        }
        
        corkboard = self.get_corkboard(project_id)
        corkboard['items'].append(item)
        self.save_corkboard(project_id, corkboard)
        
        return item
    
    # Matrix operations
    def get_matrix(self, project_id: str) -> Dict:
        """Get matrix/grid layout for a project"""
        collection = self._get_collection(project_id, 'planning_views')
        if collection:
            doc = collection.document('matrix').get()
            if doc.exists:
                return doc.to_dict()
        
        # Return empty matrix structure
        return {
            'view_type': 'matrix',
            'rows': [],
            'columns': [],
            'cells': {}
        }
    
    def save_matrix(self, project_id: str, data: Dict) -> Dict:
        """Save matrix layout"""
        timestamp = datetime.utcnow().isoformat()
        
        matrix_data = {
            'view_type': 'matrix',
            'rows': data.get('rows', []),
            'columns': data.get('columns', []),
            'cells': data.get('cells', {}),
            'updated_at': timestamp
        }
        
        collection = self._get_collection(project_id, 'planning_views')
        if collection:
            collection.document('matrix').set(matrix_data)
        
        return matrix_data
    
    def create_matrix_from_scenes(self, project_id: str, story_bible_service) -> Dict:
        """Create a matrix view from scenes and plot points"""
        scenes = story_bible_service.list_scenes(project_id)
        plot_points = story_bible_service.list_plot_points(project_id)
        characters = story_bible_service.list_characters(project_id)
        
        # Create rows for acts/chapters
        acts = set()
        for pp in plot_points:
            acts.add(pp.get('act', 1))
        
        rows = [{'id': f'act_{act}', 'label': f'Act {act}'} for act in sorted(acts)]
        
        # Create columns for key plot points
        columns = [
            {'id': pp['id'], 'label': pp['title']} 
            for pp in plot_points[:10]  # Limit to first 10
        ]
        
        # Create cells mapping scenes to plot points
        cells = {}
        for scene in scenes:
            scene_plot_points = scene.get('plot_points', [])
            for pp_id in scene_plot_points:
                # Find which act this plot point belongs to
                pp = next((p for p in plot_points if p['id'] == pp_id), None)
                if pp:
                    act = pp.get('act', 1)
                    row_id = f'act_{act}'
                    cell_key = f'{row_id}_{pp_id}'
                    
                    if cell_key not in cells:
                        cells[cell_key] = []
                    
                    cells[cell_key].append({
                        'scene_id': scene['id'],
                        'title': scene['title'],
                        'word_count': scene['word_count']
                    })
        
        matrix_data = {
            'view_type': 'matrix',
            'rows': rows,
            'columns': columns,
            'cells': cells
        }
        
        self.save_matrix(project_id, matrix_data)
        return matrix_data
    
    # Outline operations
    def get_outline(self, project_id: str) -> Dict:
        """Get outline for a project"""
        collection = self._get_collection(project_id, 'planning_views')
        if collection:
            doc = collection.document('outline').get()
            if doc.exists:
                return doc.to_dict()
        
        # Return empty outline structure
        return {
            'view_type': 'outline',
            'structure': []
        }
    
    def save_outline(self, project_id: str, data: Dict) -> Dict:
        """Save outline"""
        timestamp = datetime.utcnow().isoformat()
        
        outline_data = {
            'view_type': 'outline',
            'structure': data.get('structure', []),
            'updated_at': timestamp
        }
        
        collection = self._get_collection(project_id, 'planning_views')
        if collection:
            collection.document('outline').set(outline_data)
        
        return outline_data
    
    def generate_outline_from_plot(self, project_id: str, story_bible_service) -> Dict:
        """Generate an outline from plot points and scenes"""
        plot_points = story_bible_service.list_plot_points(project_id)
        scenes = story_bible_service.list_scenes(project_id)
        
        # Group by act
        acts = {}
        for pp in plot_points:
            act = pp.get('act', 1)
            if act not in acts:
                acts[act] = {
                    'id': f'act_{act}',
                    'title': f'Act {act}',
                    'type': 'act',
                    'children': []
                }
            
            acts[act]['children'].append({
                'id': pp['id'],
                'title': pp['title'],
                'type': 'plot_point',
                'description': pp.get('description', ''),
                'status': pp.get('status', 'planned'),
                'children': []
            })
        
        # Add scenes to plot points
        for scene in scenes:
            scene_plot_points = scene.get('plot_points', [])
            for pp_id in scene_plot_points:
                # Find the plot point in the structure
                for act_data in acts.values():
                    for pp in act_data['children']:
                        if pp['id'] == pp_id:
                            pp['children'].append({
                                'id': scene['id'],
                                'title': scene['title'],
                                'type': 'scene',
                                'word_count': scene.get('word_count', 0),
                                'status': scene.get('status', 'draft')
                            })
        
        structure = list(acts.values())
        outline_data = {
            'view_type': 'outline',
            'structure': structure
        }
        
        self.save_outline(project_id, outline_data)
        return outline_data
