"""
Tests for AIEditorService
"""
import pytest
from unittest.mock import MagicMock, patch
from services.ai_editor_service import AIEditorService


class TestAIEditorService:
    """Test suite for AIEditorService"""

    def test_generate_scene_success(self, mock_firestore, mock_gemini_model):
        """Test successful scene generation"""
        service = AIEditorService()
        service.db = mock_firestore
        service.model = mock_gemini_model

        scene_data = {
            'characters': ['char1'],
            'location': 'loc1',
            'prompt': 'Hero discovers their power',
            'tone': 'dramatic',
            'length': 'medium'
        }

        # Mock character and location data
        mock_char = MagicMock()
        mock_char.exists = True
        mock_char.to_dict.return_value = {
            'name': 'Hero',
            'traits': ['brave', 'clever'],
            'backstory': 'Born in a village'
        }

        mock_loc = MagicMock()
        mock_loc.exists = True
        mock_loc.to_dict.return_value = {
            'name': 'Kingdom',
            'description': 'A vast kingdom'
        }

        mock_firestore.collection().document().collection().document().get.side_effect = [
            mock_char, mock_loc
        ]

        result = service.generate_scene('test_project', scene_data)

        assert result is not None
        assert 'text' in result
        assert result['text'] == "Generated text from AI"
        mock_gemini_model.generate_content.assert_called_once()

    def test_generate_dialogue(self, mock_firestore, mock_gemini_model):
        """Test dialogue generation"""
        service = AIEditorService()
        service.db = mock_firestore
        service.model = mock_gemini_model

        dialogue_data = {
            'characters': ['char1', 'char2'],
            'context': 'Characters meeting for the first time',
            'tone': 'friendly'
        }

        # Mock characters
        mock_char1 = MagicMock()
        mock_char1.exists = True
        mock_char1.to_dict.return_value = {'name': 'Hero', 'traits': ['friendly']}

        mock_char2 = MagicMock()
        mock_char2.exists = True
        mock_char2.to_dict.return_value = {'name': 'Mentor', 'traits': ['wise']}

        mock_firestore.collection().document().collection().document().get.side_effect = [
            mock_char1, mock_char2
        ]

        result = service.generate_dialogue('test_project', dialogue_data)

        assert result is not None
        assert 'dialogue' in result
        mock_gemini_model.generate_content.assert_called_once()

    def test_rewrite_text(self, mock_gemini_model):
        """Test text rewriting"""
        service = AIEditorService()
        service.model = mock_gemini_model

        rewrite_data = {
            'text': 'Original text here',
            'instruction': 'Make it more dramatic',
            'tone': 'dramatic'
        }

        result = service.rewrite_text(rewrite_data)

        assert result is not None
        assert 'text' in result
        mock_gemini_model.generate_content.assert_called_once()

    def test_expand_text(self, mock_gemini_model):
        """Test text expansion"""
        service = AIEditorService()
        service.model = mock_gemini_model

        result = service.expand_text('Short text', length='long')

        assert result is not None
        assert 'text' in result
        mock_gemini_model.generate_content.assert_called_once()

    def test_summarize_text(self, mock_gemini_model):
        """Test text summarization"""
        service = AIEditorService()
        service.model = mock_gemini_model

        long_text = "This is a very long text " * 100
        result = service.summarize_text(long_text, length='short')

        assert result is not None
        assert 'summary' in result
        mock_gemini_model.generate_content.assert_called_once()

    def test_continue_writing(self, mock_gemini_model):
        """Test writing continuation"""
        service = AIEditorService()
        service.model = mock_gemini_model

        result = service.continue_writing('The hero walked into', tone='suspenseful')

        assert result is not None
        assert 'continuation' in result
        mock_gemini_model.generate_content.assert_called_once()

    def test_build_character_context(self, mock_firestore):
        """Test building character context"""
        service = AIEditorService()
        service.db = mock_firestore

        mock_char = MagicMock()
        mock_char.exists = True
        mock_char.to_dict.return_value = {
            'name': 'Hero',
            'role': 'Protagonist',
            'traits': ['brave', 'clever'],
            'backstory': 'Born in a small village',
            'description': 'A young warrior'
        }

        mock_firestore.collection().document().collection().document().get.return_value = mock_char

        context = service._build_character_context('test_project', 'char1')

        assert context is not None
        assert 'Hero' in context
        assert 'brave' in context
        assert 'clever' in context

    def test_without_gemini_model(self, mock_firestore):
        """Test service behavior without Gemini model"""
        service = AIEditorService()
        service.db = mock_firestore
        service.model = None

        scene_data = {
            'characters': [],
            'prompt': 'Test prompt'
        }

        result = service.generate_scene('test_project', scene_data)

        # Should return mock data
        assert result is not None
        assert 'text' in result

    def test_generate_with_no_characters(self, mock_gemini_model):
        """Test generation without character context"""
        service = AIEditorService()
        service.model = mock_gemini_model
        service.db = None

        scene_data = {
            'characters': [],
            'prompt': 'A mysterious event occurs',
            'tone': 'mysterious'
        }

        result = service.generate_scene('test_project', scene_data)

        assert result is not None
        assert 'text' in result

    def test_api_error_handling(self, mock_gemini_model):
        """Test handling of API errors"""
        service = AIEditorService()
        service.model = mock_gemini_model

        # Simulate API error
        mock_gemini_model.generate_content.side_effect = Exception("API Error")

        scene_data = {'prompt': 'Test', 'characters': []}

        # Should handle gracefully
        with pytest.raises(Exception):
            service.generate_scene('test_project', scene_data)

    def test_prompt_formatting(self, mock_gemini_model):
        """Test that prompts are formatted correctly"""
        service = AIEditorService()
        service.model = mock_gemini_model

        scene_data = {
            'prompt': 'Test scene',
            'tone': 'dramatic',
            'length': 'long',
            'characters': []
        }

        service.generate_scene('test_project', scene_data)

        # Verify generate_content was called with a string
        call_args = mock_gemini_model.generate_content.call_args
        assert call_args is not None
        assert isinstance(call_args[0][0], str)
        assert 'dramatic' in call_args[0][0].lower()
