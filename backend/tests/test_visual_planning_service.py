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

        items = [
            {'id': 'item1', 'type': 'note', 'title': 'Test', 'position': {'x': 0, 'y': 0}}
        ]

        service.save_corkboard('test_project', items)

        mock_doc_ref.set.assert_called_once()

    def test_generate_matrix(self, mock_firestore):
        """Test matrix generation from plot points"""
        service = VisualPlanningService(mock_firestore)

        # Mock plot points
        mock_plot1 = MagicMock()
        mock_plot1.to_dict.return_value = {'title': 'Plot 1', 'act': 1, 'order': 1}

        mock_plot2 = MagicMock()
        mock_plot2.to_dict.return_value = {'title': 'Plot 2', 'act': 2, 'order': 2}

        mock_firestore.collection().document().collection().stream.return_value = [
            mock_plot1, mock_plot2
        ]

        result = service.generate_matrix('test_project')

        assert result is not None
        assert 'rows' in result
        assert 'cols' in result
        assert 'cells' in result
        assert len(result['rows']) > 0

    def test_update_matrix_cell(self, mock_firestore):
        """Test updating a matrix cell"""
        service = VisualPlanningService(mock_firestore)

        # Mock existing matrix
        mock_doc = MagicMock()
        mock_doc.exists = True
        mock_doc.to_dict.return_value = {
            'cells': [{'row': 0, 'col': 0, 'content': 'Old content'}]
        }

        mock_doc_ref = MagicMock()
        mock_doc_ref.get.return_value = mock_doc
        mock_doc_ref.update = MagicMock()

        mock_firestore.collection().document().collection().document.return_value = mock_doc_ref

        service.update_matrix_cell('test_project', 0, 0, 'New content')

        mock_doc_ref.update.assert_called_once()

    def test_generate_outline(self, mock_firestore):
        """Test outline generation from plot points"""
        service = VisualPlanningService(mock_firestore)

        # Mock plot points
        plots = [
            MagicMock(to_dict=lambda: {'title': 'Act 1 Opening', 'act': 1, 'order': 1}),
            MagicMock(to_dict=lambda: {'title': 'Act 1 Climax', 'act': 1, 'order': 2}),
            MagicMock(to_dict=lambda: {'title': 'Act 2 Opening', 'act': 2, 'order': 1}),
        ]

        mock_firestore.collection().document().collection().stream.return_value = plots

        result = service.generate_outline('test_project')

        assert result is not None
        assert len(result) > 0
        assert 'id' in result[0]
        assert 'title' in result[0]
        assert 'level' in result[0]

    def test_save_outline(self, mock_firestore):
        """Test saving outline"""
        service = VisualPlanningService(mock_firestore)

        mock_doc_ref = MagicMock()
        mock_doc_ref.set = MagicMock()

        mock_firestore.collection().document().collection().document.return_value = mock_doc_ref

        outline = [
            {'id': 'node1', 'title': 'Chapter 1', 'level': 0, 'children': []}
        ]

        service.save_outline('test_project', outline)

        mock_doc_ref.set.assert_called_once()

    def test_export_outline_to_markdown(self):
        """Test outline markdown export"""
        service = VisualPlanningService(None)

        outline = [
            {
                'id': '1',
                'title': 'Chapter 1',
                'content': 'Introduction',
                'level': 0,
                'children': [
                    {
                        'id': '2',
                        'title': 'Scene 1',
                        'content': 'Opening scene',
                        'level': 1,
                        'children': []
                    }
                ]
            }
        ]

        markdown = service.export_outline_to_markdown(outline)

        assert markdown is not None
        assert '# Chapter 1' in markdown
        assert '## Scene 1' in markdown
        assert 'Introduction' in markdown

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

    def test_matrix_with_no_plot_points(self, mock_firestore):
        """Test matrix generation with no plot points"""
        service = VisualPlanningService(mock_firestore)

        mock_firestore.collection().document().collection().stream.return_value = []

        result = service.generate_matrix('test_project')

        assert result is not None
        assert 'rows' in result
        assert 'cols' in result
        # Should have default structure
        assert len(result['rows']) > 0

    def test_nested_outline_structure(self):
        """Test outline with deep nesting"""
        service = VisualPlanningService(None)

        outline = [
            {
                'id': '1',
                'title': 'Part 1',
                'level': 0,
                'children': [
                    {
                        'id': '2',
                        'title': 'Chapter 1',
                        'level': 1,
                        'children': [
                            {
                                'id': '3',
                                'title': 'Scene 1',
                                'level': 2,
                                'children': []
                            }
                        ]
                    }
                ]
            }
        ]

        markdown = service.export_outline_to_markdown(outline)

        assert '# Part 1' in markdown
        assert '## Chapter 1' in markdown
        assert '### Scene 1' in markdown
