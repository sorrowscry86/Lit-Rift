"""
Story Bible Service
Handles CRUD operations for story elements
"""

from datetime import datetime
from typing import List, Dict, Optional
import uuid

class StoryBibleService:
    """Service for managing Story Bible entities"""
    
    def __init__(self, db):
        self.db = db
    
    def _get_collection(self, project_id: str, collection_name: str):
        """Get a collection reference for a project"""
        if self.db:
            return self.db.collection('projects').document(project_id).collection(collection_name)
        return None
    
    # Character operations
    def create_character(self, project_id: str, character_data: Dict) -> Dict:
        """Create a new character"""
        character_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        
        character = {
            'id': character_id,
            'name': character_data.get('name', ''),
            'description': character_data.get('description', ''),
            'traits': character_data.get('traits', []),
            'backstory': character_data.get('backstory', ''),
            'relationships': character_data.get('relationships', {}),
            'appearances': character_data.get('appearances', []),
            'notes': character_data.get('notes', ''),
            'created_at': timestamp,
            'updated_at': timestamp
        }
        
        collection = self._get_collection(project_id, 'characters')
        if collection:
            collection.document(character_id).set(character)
        
        return character
    
    def get_character(self, project_id: str, character_id: str) -> Optional[Dict]:
        """Get a character by ID"""
        collection = self._get_collection(project_id, 'characters')
        if collection:
            doc = collection.document(character_id).get()
            if doc.exists:
                return doc.to_dict()
        return None
    
    def list_characters(self, project_id: str) -> List[Dict]:
        """List all characters in a project"""
        collection = self._get_collection(project_id, 'characters')
        if collection:
            docs = collection.stream()
            return [doc.to_dict() for doc in docs]
        return []
    
    def update_character(self, project_id: str, character_id: str, updates: Dict) -> Dict:
        """Update a character"""
        updates['updated_at'] = datetime.utcnow().isoformat()
        collection = self._get_collection(project_id, 'characters')
        if collection:
            collection.document(character_id).update(updates)
            return self.get_character(project_id, character_id)
        return updates
    
    def delete_character(self, project_id: str, character_id: str) -> bool:
        """Delete a character"""
        collection = self._get_collection(project_id, 'characters')
        if collection:
            collection.document(character_id).delete()
            return True
        return False
    
    # Location operations
    def create_location(self, project_id: str, location_data: Dict) -> Dict:
        """Create a new location"""
        location_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        
        location = {
            'id': location_id,
            'name': location_data.get('name', ''),
            'description': location_data.get('description', ''),
            'type': location_data.get('type', ''),
            'parent_location_id': location_data.get('parent_location_id'),
            'attributes': location_data.get('attributes', {}),
            'scenes': location_data.get('scenes', []),
            'notes': location_data.get('notes', ''),
            'created_at': timestamp,
            'updated_at': timestamp
        }
        
        collection = self._get_collection(project_id, 'locations')
        if collection:
            collection.document(location_id).set(location)
        
        return location
    
    def get_location(self, project_id: str, location_id: str) -> Optional[Dict]:
        """Get a location by ID"""
        collection = self._get_collection(project_id, 'locations')
        if collection:
            doc = collection.document(location_id).get()
            if doc.exists:
                return doc.to_dict()
        return None
    
    def list_locations(self, project_id: str) -> List[Dict]:
        """List all locations in a project"""
        collection = self._get_collection(project_id, 'locations')
        if collection:
            docs = collection.stream()
            return [doc.to_dict() for doc in docs]
        return []
    
    def update_location(self, project_id: str, location_id: str, updates: Dict) -> Dict:
        """Update a location"""
        updates['updated_at'] = datetime.utcnow().isoformat()
        collection = self._get_collection(project_id, 'locations')
        if collection:
            collection.document(location_id).update(updates)
            return self.get_location(project_id, location_id)
        return updates
    
    # Lore operations
    def create_lore(self, project_id: str, lore_data: Dict) -> Dict:
        """Create a new lore entry"""
        lore_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        
        lore = {
            'id': lore_id,
            'title': lore_data.get('title', ''),
            'category': lore_data.get('category', ''),
            'content': lore_data.get('content', ''),
            'related_entries': lore_data.get('related_entries', []),
            'related_characters': lore_data.get('related_characters', []),
            'related_locations': lore_data.get('related_locations', []),
            'tags': lore_data.get('tags', []),
            'created_at': timestamp,
            'updated_at': timestamp
        }
        
        collection = self._get_collection(project_id, 'lore')
        if collection:
            collection.document(lore_id).set(lore)
        
        return lore
    
    def list_lore(self, project_id: str) -> List[Dict]:
        """List all lore entries in a project"""
        collection = self._get_collection(project_id, 'lore')
        if collection:
            docs = collection.stream()
            return [doc.to_dict() for doc in docs]
        return []
    
    # Plot operations
    def create_plot_point(self, project_id: str, plot_data: Dict) -> Dict:
        """Create a new plot point"""
        plot_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        
        plot_point = {
            'id': plot_id,
            'title': plot_data.get('title', ''),
            'description': plot_data.get('description', ''),
            'act': plot_data.get('act', 1),
            'sequence': plot_data.get('sequence', 0),
            'status': plot_data.get('status', 'planned'),
            'related_characters': plot_data.get('related_characters', []),
            'related_locations': plot_data.get('related_locations', []),
            'related_lore': plot_data.get('related_lore', []),
            'notes': plot_data.get('notes', ''),
            'created_at': timestamp,
            'updated_at': timestamp
        }
        
        collection = self._get_collection(project_id, 'plot_points')
        if collection:
            collection.document(plot_id).set(plot_point)
        
        return plot_point
    
    def list_plot_points(self, project_id: str) -> List[Dict]:
        """List all plot points in a project"""
        collection = self._get_collection(project_id, 'plot_points')
        if collection:
            docs = collection.stream()
            return [doc.to_dict() for doc in docs]
        return []
    
    # Scene operations
    def create_scene(self, project_id: str, scene_data: Dict) -> Dict:
        """Create a new scene"""
        scene_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        content = scene_data.get('content', '')
        
        scene = {
            'id': scene_id,
            'title': scene_data.get('title', ''),
            'content': content,
            'chapter_id': scene_data.get('chapter_id'),
            'sequence': scene_data.get('sequence', 0),
            'characters': scene_data.get('characters', []),
            'location_id': scene_data.get('location_id'),
            'plot_points': scene_data.get('plot_points', []),
            'word_count': len(content.split()),
            'status': scene_data.get('status', 'draft'),
            'notes': scene_data.get('notes', ''),
            'created_at': timestamp,
            'updated_at': timestamp
        }
        
        collection = self._get_collection(project_id, 'scenes')
        if collection:
            collection.document(scene_id).set(scene)
        
        return scene
    
    def get_scene(self, project_id: str, scene_id: str) -> Optional[Dict]:
        """Get a scene by ID"""
        collection = self._get_collection(project_id, 'scenes')
        if collection:
            doc = collection.document(scene_id).get()
            if doc.exists:
                return doc.to_dict()
        return None
    
    def list_scenes(self, project_id: str) -> List[Dict]:
        """List all scenes in a project"""
        collection = self._get_collection(project_id, 'scenes')
        if collection:
            docs = collection.stream()
            return [doc.to_dict() for doc in docs]
        return []
    
    def update_scene(self, project_id: str, scene_id: str, updates: Dict) -> Dict:
        """Update a scene"""
        updates['updated_at'] = datetime.utcnow().isoformat()
        if 'content' in updates:
            updates['word_count'] = len(updates['content'].split())
        
        collection = self._get_collection(project_id, 'scenes')
        if collection:
            collection.document(scene_id).update(updates)
            return self.get_scene(project_id, scene_id)
        return updates
    
    # Project operations
    def create_project(self, project_data: Dict) -> Dict:
        """Create a new project"""
        project_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        
        project = {
            'id': project_id,
            'title': project_data.get('title', 'Untitled Project'),
            'author': project_data.get('author', ''),
            'genre': project_data.get('genre', ''),
            'description': project_data.get('description', ''),
            'status': project_data.get('status', 'planning'),
            'target_word_count': project_data.get('target_word_count', 50000),
            'current_word_count': 0,
            'created_at': timestamp,
            'updated_at': timestamp
        }
        
        if self.db:
            self.db.collection('projects').document(project_id).set(project)
        
        return project
    
    def get_project(self, project_id: str) -> Optional[Dict]:
        """Get a project by ID"""
        if self.db:
            doc = self.db.collection('projects').document(project_id).get()
            if doc.exists:
                return doc.to_dict()
        return None
    
    def list_projects(self) -> List[Dict]:
        """List all projects"""
        if self.db:
            docs = self.db.collection('projects').stream()
            return [doc.to_dict() for doc in docs]
        return []
    
    def get_context_for_scene(self, project_id: str, scene_id: str) -> Dict:
        """Get all Story Bible context relevant to a scene"""
        scene = self.get_scene(project_id, scene_id)
        if not scene:
            return {}
        
        context = {
            'scene': scene,
            'characters': [],
            'location': None,
            'plot_points': [],
            'related_lore': []
        }
        
        # Get characters
        for char_id in scene.get('characters', []):
            char = self.get_character(project_id, char_id)
            if char:
                context['characters'].append(char)
        
        # Get location
        location_id = scene.get('location_id')
        if location_id:
            context['location'] = self.get_location(project_id, location_id)
        
        # Get plot points
        all_plot_points = self.list_plot_points(project_id)
        context['plot_points'] = [
            pp for pp in all_plot_points 
            if pp['id'] in scene.get('plot_points', [])
        ]
        
        # Get related lore
        all_lore = self.list_lore(project_id)
        # Simple relevance: lore that mentions any character or location in scene
        context['related_lore'] = [
            lore for lore in all_lore
            if any(char_id in lore.get('related_characters', []) 
                   for char_id in scene.get('characters', []))
            or location_id in lore.get('related_locations', [])
        ]
        
        return context
