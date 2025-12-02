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

        context = {
            'project': {
                'title': 'Test Story',
                'genre': 'Fantasy',
                'description': 'A fantasy adventure'
            },
            'characters': [
                {'name': 'Hero', 'description': 'A brave warrior', 'traits': ['brave', 'clever']}
            ],
            'location': {'name': 'Kingdom', 'description': 'A vast kingdom'}
        }
        prompt = 'Hero discovers their power'
        tone = 'dramatic'
        length = 'medium'

        result = service.generate_scene(context, prompt, tone, length)

        assert result is not None
        assert result['success'] is True
        assert 'content' in result
        mock_gemini_model.generate_content.assert_called_once()

    def test_generate_dialogue(self, mock_firestore, mock_gemini_model):
        """Test dialogue generation"""
        service = AIEditorService()
        service.db = mock_firestore
        service.model = mock_gemini_model

        context = {
            'characters': [
                {'name': 'Hero', 'traits': ['friendly']},
                {'name': 'Mentor', 'traits': ['wise']}
            ]
        }
        characters = ['Hero', 'Mentor']
        situation = 'Characters meeting for the first time'

        result = service.generate_dialogue(context, characters, situation)

        assert result is not None
        assert 'content' in result
        mock_gemini_model.generate_content.assert_called_once()

    def test_rewrite_text(self, mock_gemini_model):
        """Test text rewriting"""
        service = AIEditorService()
        service.model = mock_gemini_model

        text = 'Original text here'
        instruction = 'Make it more dramatic'

        result = service.rewrite_text(text, instruction)

        assert result is not None
        assert 'content' in result
        mock_gemini_model.generate_content.assert_called_once()

    def test_expand_text(self, mock_gemini_model):
        """Test text expansion"""
        service = AIEditorService()
        service.model = mock_gemini_model

        result = service.expand_text('Short text')

        assert result is not None
        assert 'content' in result
        mock_gemini_model.generate_content.assert_called_once()

    def test_summarize_text(self, mock_gemini_model):
        """Test text summarization"""
        service = AIEditorService()
        service.model = mock_gemini_model

        long_text = "This is a very long text " * 100
        result = service.summarize_text(long_text)

        assert result is not None
        assert 'content' in result
        mock_gemini_model.generate_content.assert_called_once()

    def test_continue_writing(self, mock_gemini_model):
        """Test writing continuation"""
        service = AIEditorService()
        service.model = mock_gemini_model

        context = {
            'project': {'title': 'Test', 'genre': 'Fantasy'}
        }
        result = service.continue_writing('The hero walked into', context, 'a suspenseful encounter')

        assert result is not None
        assert 'content' in result
        mock_gemini_model.generate_content.assert_called_once()

    def test_build_context_prompt(self, mock_firestore):
        """Test building context prompt"""
        service = AIEditorService()
        service.db = mock_firestore

        context = {
            'project': {
                'title': 'Test Story',
                'genre': 'Fantasy',
                'description': 'A test adventure'
            },
            'characters': [
                {'name': 'Hero', 'description': 'A warrior', 'traits': ['brave', 'clever']}
            ],
            'location': {'name': 'Kingdom', 'description': 'A vast kingdom'}
        }

        prompt = service._build_context_prompt(context, 'scene')

        assert prompt is not None
        assert 'Test Story' in prompt
        assert 'Hero' in prompt
        assert 'brave' in prompt

    def test_without_gemini_model(self, mock_firestore):
        """Test service behavior without Gemini model"""
        service = AIEditorService()
        service.db = mock_firestore
        service.model = None

        context = {}
        prompt = 'Test prompt'

        result = service.generate_scene(context, prompt)

        # Should return error response when model not initialized
        assert result is not None
        assert result['success'] is False
        assert 'error' in result

    def test_generate_with_empty_context(self, mock_gemini_model):
        """Test generation with empty context"""
        service = AIEditorService()
        service.model = mock_gemini_model
        service.db = None

        context = {}
        prompt = 'A mysterious event occurs'

        result = service.generate_scene(context, prompt, 'mysterious')

        assert result is not None
        assert result['success'] is True
        assert 'content' in result

    def test_api_error_handling(self, mock_gemini_model):
        """Test handling of API errors"""
        service = AIEditorService()
        service.model = mock_gemini_model

        # Simulate API error
        mock_gemini_model.generate_content.side_effect = Exception("API Error")

        context = {}
        prompt = 'Test'

        # Should handle gracefully and return error dict
        result = service.generate_scene(context, prompt)
        assert result is not None
        assert result['success'] is False
        assert 'error' in result

    def test_prompt_formatting(self, mock_gemini_model):
        """Test that prompts are formatted correctly"""
        service = AIEditorService()
        service.model = mock_gemini_model

        context = {
            'project': {'title': 'Test', 'genre': 'Drama'}
        }
        prompt = 'Test scene'
        tone = 'dramatic'

        service.generate_scene(context, prompt, tone)

        # Verify generate_content was called with a string containing the tone
        call_args = mock_gemini_model.generate_content.call_args
        assert call_args is not None
        assert isinstance(call_args[0][0], str)
        assert 'dramatic' in call_args[0][0].lower()
