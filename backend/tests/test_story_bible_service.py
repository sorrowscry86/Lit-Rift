"""
Tests for StoryBibleService
"""
import pytest
from unittest.mock import MagicMock, patch
from services.story_bible_service import StoryBibleService


class TestStoryBibleService:
    """Test suite for StoryBibleService"""

    def test_create_character(self, mock_firestore, sample_character_data):
        """Test creating a character"""
        service = StoryBibleService()
        service.db = mock_firestore

        project_id = 'test_project'

        # Mock document reference
        mock_doc_ref = MagicMock()
        mock_doc_ref.id = 'char123'
        mock_doc_ref.set = MagicMock()

        mock_firestore.collection().document().collection().document.return_value = mock_doc_ref

        result = service.create_character(project_id, sample_character_data)

        assert result is not None
        assert 'id' in result
        mock_doc_ref.set.assert_called_once()

    def test_get_character(self, mock_firestore):
        """Test retrieving a character"""
        service = StoryBibleService()
        service.db = mock_firestore

        project_id = 'test_project'
        character_id = 'char123'

        # Mock document snapshot
        mock_doc = MagicMock()
        mock_doc.exists = True
        mock_doc.to_dict.return_value = {
            'name': 'Test Hero',
            'role': 'Protagonist'
        }

        mock_firestore.collection().document().collection().document().get.return_value = mock_doc

        result = service.get_character(project_id, character_id)

        assert result is not None
        assert result['name'] == 'Test Hero'

    def test_get_character_not_found(self, mock_firestore):
        """Test retrieving non-existent character"""
        service = StoryBibleService()
        service.db = mock_firestore

        mock_doc = MagicMock()
        mock_doc.exists = False

        mock_firestore.collection().document().collection().document().get.return_value = mock_doc

        result = service.get_character('test_project', 'nonexistent')

        assert result is None

    def test_list_characters(self, mock_firestore):
        """Test listing all characters"""
        service = StoryBibleService()
        service.db = mock_firestore

        # Mock character documents
        mock_char1 = MagicMock()
        mock_char1.id = 'char1'
        mock_char1.to_dict.return_value = {'name': 'Hero'}

        mock_char2 = MagicMock()
        mock_char2.id = 'char2'
        mock_char2.to_dict.return_value = {'name': 'Villain'}

        mock_firestore.collection().document().collection().stream.return_value = [
            mock_char1, mock_char2
        ]

        result = service.list_characters('test_project')

        assert len(result) == 2
        assert result[0]['name'] == 'Hero'
        assert result[1]['name'] == 'Villain'

    def test_update_character(self, mock_firestore):
        """Test updating a character"""
        service = StoryBibleService()
        service.db = mock_firestore

        mock_doc_ref = MagicMock()
        mock_doc_ref.update = MagicMock()

        mock_firestore.collection().document().collection().document.return_value = mock_doc_ref

        updates = {'role': 'Hero'}
        service.update_character('test_project', 'char123', updates)

        mock_doc_ref.update.assert_called_once()

    def test_delete_character(self, mock_firestore):
        """Test deleting a character"""
        service = StoryBibleService()
        service.db = mock_firestore

        mock_doc_ref = MagicMock()
        mock_doc_ref.delete = MagicMock()

        mock_firestore.collection().document().collection().document.return_value = mock_doc_ref

        service.delete_character('test_project', 'char123')

        mock_doc_ref.delete.assert_called_once()

    def test_create_location(self, mock_firestore, sample_location_data):
        """Test creating a location"""
        service = StoryBibleService()
        service.db = mock_firestore

        mock_doc_ref = MagicMock()
        mock_doc_ref.id = 'loc123'
        mock_doc_ref.set = MagicMock()

        mock_firestore.collection().document().collection().document.return_value = mock_doc_ref

        result = service.create_location('test_project', sample_location_data)

        assert result is not None
        assert 'id' in result

    def test_create_lore_entry(self, mock_firestore, sample_lore_data):
        """Test creating a lore entry"""
        service = StoryBibleService()
        service.db = mock_firestore

        mock_doc_ref = MagicMock()
        mock_doc_ref.id = 'lore123'
        mock_doc_ref.set = MagicMock()

        mock_firestore.collection().document().collection().document.return_value = mock_doc_ref

        result = service.create_lore('test_project', sample_lore_data)

        assert result is not None
        assert 'id' in result

    def test_create_plot_point(self, mock_firestore, sample_plot_data):
        """Test creating a plot point"""
        service = StoryBibleService()
        service.db = mock_firestore

        mock_doc_ref = MagicMock()
        mock_doc_ref.id = 'plot123'
        mock_doc_ref.set = MagicMock()

        mock_firestore.collection().document().collection().document.return_value = mock_doc_ref

        result = service.create_plot_point('test_project', sample_plot_data)

        assert result is not None
        assert 'id' in result

    def test_create_scene(self, mock_firestore, sample_scene_data):
        """Test creating a scene"""
        service = StoryBibleService()
        service.db = mock_firestore

        mock_doc_ref = MagicMock()
        mock_doc_ref.id = 'scene123'
        mock_doc_ref.set = MagicMock()

        mock_firestore.collection().document().collection().document.return_value = mock_doc_ref

        result = service.create_scene('test_project', sample_scene_data)

        assert result is not None
        assert 'id' in result

    def test_get_scene_context(self, mock_firestore):
        """Test getting scene context for AI generation"""
        service = StoryBibleService()
        service.db = mock_firestore

        # Mock scene
        mock_scene = MagicMock()
        mock_scene.exists = True
        mock_scene.to_dict.return_value = {
            'title': 'Test Scene',
            'characters': ['char1'],
            'location': 'loc1',
            'plot_points': ['plot1']
        }

        # Mock character
        mock_char = MagicMock()
        mock_char.exists = True
        mock_char.to_dict.return_value = {'name': 'Hero', 'traits': ['brave']}

        # Mock location
        mock_loc = MagicMock()
        mock_loc.exists = True
        mock_loc.to_dict.return_value = {'name': 'Kingdom', 'description': 'A vast kingdom'}

        mock_firestore.collection().document().collection().document().get.side_effect = [
            mock_scene, mock_char, mock_loc
        ]

        result = service.get_scene_context('test_project', 'scene123')

        assert result is not None
        assert 'scene' in result
        assert 'characters' in result
        assert 'location' in result

    def test_create_project(self, mock_firestore, sample_project_data):
        """Test creating a project"""
        service = StoryBibleService()
        service.db = mock_firestore

        mock_doc_ref = MagicMock()
        mock_doc_ref.id = 'project123'
        mock_doc_ref.set = MagicMock()

        mock_firestore.collection().document.return_value = mock_doc_ref

        result = service.create_project(sample_project_data)

        assert result is not None
        assert 'id' in result
        mock_doc_ref.set.assert_called_once()

    def test_without_firestore(self):
        """Test service behavior without Firestore"""
        service = StoryBibleService()
        service.db = None

        # Should handle gracefully
        result = service.list_characters('test_project')
        assert result == []
