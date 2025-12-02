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
        service = StoryBibleService(mock_firestore)

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
        service = StoryBibleService(mock_firestore)

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
        service = StoryBibleService(mock_firestore)

        mock_doc = MagicMock()
        mock_doc.exists = False

        mock_firestore.collection().document().collection().document().get.return_value = mock_doc

        result = service.get_character('test_project', 'nonexistent')

        assert result is None

    def test_list_characters(self, mock_firestore):
        """Test listing all characters"""
        service = StoryBibleService(mock_firestore)

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
        service = StoryBibleService(mock_firestore)

        mock_doc_ref = MagicMock()
        mock_doc_ref.update = MagicMock()

        mock_firestore.collection().document().collection().document.return_value = mock_doc_ref

        updates = {'role': 'Hero'}
        service.update_character('test_project', 'char123', updates)

        mock_doc_ref.update.assert_called_once()

    def test_delete_character(self, mock_firestore):
        """Test deleting a character"""
        service = StoryBibleService(mock_firestore)

        mock_doc_ref = MagicMock()
        mock_doc_ref.delete = MagicMock()

        mock_firestore.collection().document().collection().document.return_value = mock_doc_ref

        service.delete_character('test_project', 'char123')

        mock_doc_ref.delete.assert_called_once()

    def test_create_location(self, mock_firestore, sample_location_data):
        """Test creating a location"""
        service = StoryBibleService(mock_firestore)

        mock_doc_ref = MagicMock()
        mock_doc_ref.id = 'loc123'
        mock_doc_ref.set = MagicMock()

        mock_firestore.collection().document().collection().document.return_value = mock_doc_ref

        result = service.create_location('test_project', sample_location_data)

        assert result is not None
        assert 'id' in result

    def test_create_lore_entry(self, mock_firestore, sample_lore_data):
        """Test creating a lore entry"""
        service = StoryBibleService(mock_firestore)

        mock_doc_ref = MagicMock()
        mock_doc_ref.id = 'lore123'
        mock_doc_ref.set = MagicMock()

        mock_firestore.collection().document().collection().document.return_value = mock_doc_ref

        result = service.create_lore('test_project', sample_lore_data)

        assert result is not None
        assert 'id' in result

    def test_create_plot_point(self, mock_firestore, sample_plot_data):
        """Test creating a plot point"""
        service = StoryBibleService(mock_firestore)

        mock_doc_ref = MagicMock()
        mock_doc_ref.id = 'plot123'
        mock_doc_ref.set = MagicMock()

        mock_firestore.collection().document().collection().document.return_value = mock_doc_ref

        result = service.create_plot_point('test_project', sample_plot_data)

        assert result is not None
        assert 'id' in result

    def test_create_scene(self, mock_firestore, sample_scene_data):
        """Test creating a scene"""
        service = StoryBibleService(mock_firestore)

        mock_doc_ref = MagicMock()
        mock_doc_ref.id = 'scene123'
        mock_doc_ref.set = MagicMock()

        mock_firestore.collection().document().collection().document.return_value = mock_doc_ref

        result = service.create_scene('test_project', sample_scene_data)

        assert result is not None
        assert 'id' in result

    def test_get_scene_context(self, mock_firestore):
        """Test getting scene context for AI generation"""
        service = StoryBibleService(mock_firestore)

        # Mock scene - we need to mock the sequence of calls correctly
        # This test is tricky because get_scene_context calls get_scene, get_location, etc.
        # which all make DB calls.

        # Simpler approach: mock the service methods that call DB,
        # or properly mock all DB calls.

        # Let's mock the internal methods to simplify DB mocking complexity
        service.get_scene = MagicMock(return_value={
            'title': 'Test Scene',
            'characters': ['char1'],
            'location_id': 'loc1',
            'plot_points': ['plot1']
        })

        service.list_characters = MagicMock(return_value=[
            {'id': 'char1', 'name': 'Hero', 'traits': ['brave']},
            {'id': 'char2', 'name': 'Villain'}
        ])

        service.get_location = MagicMock(return_value={
            'id': 'loc1',
            'name': 'Kingdom',
            'description': 'A vast kingdom'
        })

        service.list_plot_points = MagicMock(return_value=[
            {'id': 'plot1', 'title': 'Plot Point 1'},
            {'id': 'plot2', 'title': 'Plot Point 2'}
        ])

        service.list_lore = MagicMock(return_value=[])

        result = service.get_context_for_scene('test_project', 'scene123')

        assert result is not None
        assert 'scene' in result
        assert 'characters' in result
        assert 'location' in result
        assert len(result['characters']) == 1
        assert result['location']['name'] == 'Kingdom'

    def test_create_project(self, mock_firestore, sample_project_data):
        """Test creating a project"""
        service = StoryBibleService(mock_firestore)

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
        service = StoryBibleService(None)

        # Should handle gracefully
        result = service.list_characters('test_project')
        assert result == []
