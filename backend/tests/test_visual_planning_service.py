"""
Tests for VisualPlanningService
"""
import pytest
from unittest.mock import MagicMock
from services.visual_planning_service import VisualPlanningService


class TestVisualPlanningService:
    """Test suite for VisualPlanningService"""

    def test_get_corkboard(self, mock_firestore):
        """Test getting corkboard layout"""
        service = VisualPlanningService(mock_firestore)

        # Mock corkboard document
        mock_doc = MagicMock()
        mock_doc.exists = True
        mock_doc.to_dict.return_value = {
            'items': [
                {'id': 'item1', 'type': 'note', 'title': 'Test Note', 'position': {'x': 10, 'y': 10}}
            ]
        }

        mock_firestore.collection().document().collection().document().get.return_value = mock_doc

        result = service.get_corkboard('test_project')

        assert result is not None
        assert 'items' in result
        assert len(result['items']) == 1

    def test_save_corkboard(self, mock_firestore):
        """Test saving corkboard layout"""
        service = VisualPlanningService(mock_firestore)

        mock_doc_ref = MagicMock()
        mock_doc_ref.set = MagicMock()

        mock_firestore.collection().document().collection().document.return_value = mock_doc_ref

        # Pass a dict with items, not a list
        data = {
            'items': [
                {'id': 'item1', 'type': 'note', 'title': 'Test', 'position': {'x': 0, 'y': 0}}
            ],
            'connections': []
        }

        service.save_corkboard('test_project', data)

        mock_doc_ref.set.assert_called_once()

    def test_get_matrix(self, mock_firestore):
        """Test getting matrix layout"""
        service = VisualPlanningService(mock_firestore)

        # Mock matrix document
        mock_doc = MagicMock()
        mock_doc.exists = True
        mock_doc.to_dict.return_value = {
            'rows': ['Row 1'],
            'columns': ['Col 1'],
            'cells': {}
        }

        mock_firestore.collection().document().collection().document().get.return_value = mock_doc

        result = service.get_matrix('test_project')

        assert result is not None
        assert 'rows' in result
        assert 'columns' in result
        assert 'cells' in result

    def test_save_matrix(self, mock_firestore):
        """Test saving matrix layout"""
        service = VisualPlanningService(mock_firestore)

        mock_doc_ref = MagicMock()
        mock_doc_ref.set = MagicMock()

        mock_firestore.collection().document().collection().document.return_value = mock_doc_ref

        data = {
            'rows': ['Row 1'],
            'columns': ['Col 1'],
            'cells': {}
        }

        service.save_matrix('test_project', data)

        mock_doc_ref.set.assert_called_once()

    def test_get_outline(self, mock_firestore):
        """Test getting outline"""
        service = VisualPlanningService(mock_firestore)

        # Mock outline document
        mock_doc = MagicMock()
        mock_doc.exists = True
        mock_doc.to_dict.return_value = {
            'view_type': 'outline',
            'structure': [
                {'id': 'node1', 'title': 'Chapter 1', 'children': []}
            ]
        }

        mock_firestore.collection().document().collection().document().get.return_value = mock_doc

        result = service.get_outline('test_project')

        assert result is not None
        assert 'structure' in result
        assert len(result['structure']) == 1

    def test_save_outline(self, mock_firestore):
        """Test saving outline"""
        service = VisualPlanningService(mock_firestore)

        mock_doc_ref = MagicMock()
        mock_doc_ref.set = MagicMock()

        mock_firestore.collection().document().collection().document.return_value = mock_doc_ref

        data = {
            'structure': [
                {'id': 'node1', 'title': 'Chapter 1', 'children': []}
            ]
        }

        service.save_outline('test_project', data)

        mock_doc_ref.set.assert_called_once()

    def test_add_corkboard_item(self, mock_firestore):
        """Test adding an item to the corkboard"""
        service = VisualPlanningService(mock_firestore)

        # Mock get_corkboard
        mock_get_doc = MagicMock()
        mock_get_doc.exists = True
        mock_get_doc.to_dict.return_value = {
            'items': [],
            'connections': []
        }
        mock_firestore.collection().document().collection().document().get.return_value = mock_get_doc

        # Mock save_corkboard
        mock_doc_ref = MagicMock()
        mock_doc_ref.set = MagicMock()
        mock_firestore.collection().document().collection().document.return_value = mock_doc_ref

        item_data = {
            'type': 'note',
            'title': 'New Note',
            'content': 'Some content'
        }

        result = service.add_corkboard_item('test_project', item_data)

        assert result is not None
        assert 'id' in result
        assert result['title'] == 'New Note'

    def test_empty_corkboard(self, mock_firestore):
        """Test getting empty corkboard"""
        service = VisualPlanningService(mock_firestore)

        mock_doc = MagicMock()
        mock_doc.exists = False

        mock_firestore.collection().document().collection().document().get.return_value = mock_doc

        result = service.get_corkboard('test_project')

        assert result is not None
        assert 'items' in result
        assert len(result['items']) == 0

    def test_without_firestore(self):
        """Test service without Firestore"""
        service = VisualPlanningService(None)

        result = service.get_corkboard('test_project')

        assert result is not None
        assert 'items' in result
        assert len(result['items']) == 0

    def test_empty_matrix(self, mock_firestore):
        """Test getting empty matrix"""
        service = VisualPlanningService(mock_firestore)

        mock_doc = MagicMock()
        mock_doc.exists = False

        mock_firestore.collection().document().collection().document().get.return_value = mock_doc

        result = service.get_matrix('test_project')

        assert result is not None
        assert 'rows' in result
        assert 'columns' in result
        assert 'cells' in result

    def test_empty_outline(self, mock_firestore):
        """Test getting empty outline"""
        service = VisualPlanningService(mock_firestore)

        mock_doc = MagicMock()
        mock_doc.exists = False

        mock_firestore.collection().document().collection().document().get.return_value = mock_doc

        result = service.get_outline('test_project')

        assert result is not None
        assert 'structure' in result
        assert len(result['structure']) == 0
