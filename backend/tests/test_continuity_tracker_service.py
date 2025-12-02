"""
Tests for ContinuityTrackerService
"""
import pytest
from unittest.mock import MagicMock
from services.continuity_tracker_service import ContinuityTrackerService


class TestContinuityTrackerService:
    """Test suite for ContinuityTrackerService"""

    def test_check_continuity(self, mock_firestore, mock_gemini_model):
        """Test full continuity check"""
        service = ContinuityTrackerService()
        service.db = mock_firestore
        service.model = mock_gemini_model

        # Mock characters
        mock_char1 = MagicMock()
        mock_char1.id = 'char1'
        mock_char1.to_dict.return_value = {
            'name': 'Hero',
            'description': 'A brave warrior',
            'traits': ['brave', 'strong']
        }

        # Mock scenes
        mock_scene1 = MagicMock()
        mock_scene1.id = 'scene1'
        mock_scene1.to_dict.return_value = {
            'title': 'Scene 1',
            'content': 'The hero was brave and strong',
            'characters': ['char1']
        }

        mock_scene2 = MagicMock()
        mock_scene2.id = 'scene2'
        mock_scene2.to_dict.return_value = {
            'title': 'Scene 2',
            'content': 'The hero was cowardly',
            'characters': ['char1']
        }

        # Mock stream calls
        def mock_stream_factory():
            calls = [[mock_char1], [mock_scene1, mock_scene2]]
            call_count = [0]

            def mock_stream(*args, **kwargs):
                if call_count[0] < len(calls):
                    result = calls[call_count[0]]
                    call_count[0] += 1
                    return result
                return []

            return mock_stream

        mock_firestore.collection().document().collection().stream.side_effect = mock_stream_factory()

        # Mock AI response with issue detection
        mock_gemini_model.generate_content.return_value.text = "ISSUE: Character trait inconsistency - Hero described as cowardly in Scene 2 but defined as brave."

        result = service.check_continuity('test_project')

        assert result is not None
        assert 'issues' in result
        assert 'totalIssues' in result

    def test_check_character_consistency(self, mock_firestore, mock_gemini_model):
        """Test character consistency checking"""
        service = ContinuityTrackerService()
        service.db = mock_firestore
        service.model = mock_gemini_model

        character = {
            'name': 'Hero',
            'description': 'Blue eyes, tall',
            'traits': ['brave']
        }

        scenes = [
            {
                'id': 'scene1',
                'content': 'The hero had blue eyes',
                'characters': ['char1']
            },
            {
                'id': 'scene2',
                'content': 'The hero had green eyes',
                'characters': ['char1']
            }
        ]

        mock_gemini_model.generate_content.return_value.text = "ISSUE: Eye color changes from blue to green"

        issues = service._check_character_consistency('char1', character, scenes)

        assert len(issues) > 0
        assert issues[0]['type'] == 'character'

    def test_check_timeline_consistency(self, mock_gemini_model):
        """Test timeline consistency checking"""
        service = ContinuityTrackerService()
        service.model = mock_gemini_model

        scenes = [
            {
                'id': 'scene1',
                'title': 'Morning',
                'content': 'The sun rose',
                'order': 1
            },
            {
                'id': 'scene2',
                'title': 'Before sunrise',
                'content': 'It was dark',
                'order': 2
            }
        ]

        mock_gemini_model.generate_content.return_value.text = "ISSUE: Timeline inconsistency - Scene 2 happens before sunrise but comes after Scene 1 showing sunrise"

        issues = service._check_timeline_consistency(scenes)

        assert len(issues) > 0
        assert issues[0]['type'] == 'timeline'

    def test_check_location_consistency(self, mock_firestore, mock_gemini_model):
        """Test location consistency checking"""
        service = ContinuityTrackerService()
        service.db = mock_firestore
        service.model = mock_gemini_model

        location = {
            'name': 'Castle',
            'description': 'Stone walls, three towers'
        }

        scenes = [
            {
                'id': 'scene1',
                'content': 'The castle had three towers',
                'location': 'loc1'
            },
            {
                'id': 'scene2',
                'content': 'The castle had five towers',
                'location': 'loc1'
            }
        ]

        mock_gemini_model.generate_content.return_value.text = "ISSUE: Tower count inconsistency"

        issues = service._check_location_consistency('loc1', location, scenes)

        assert len(issues) > 0
        assert issues[0]['type'] == 'location'

    def test_parse_ai_response_with_issues(self):
        """Test parsing AI response containing issues"""
        service = ContinuityTrackerService()

        ai_text = """
        ISSUE: Character hair color changes from blonde to brown.
        Severity: MEDIUM
        Affected: scene1, scene2
        """

        issues = service._parse_ai_issues(ai_text, 'character', ['scene1'], ['char1'])

        assert len(issues) > 0
        assert issues[0]['severity'] in ['low', 'medium', 'high']

    def test_parse_ai_response_no_issues(self):
        """Test parsing AI response with no issues"""
        service = ContinuityTrackerService()

        ai_text = "No consistency issues found."

        issues = service._parse_ai_issues(ai_text, 'character', ['scene1'], ['char1'])

        assert len(issues) == 0

    def test_save_issues(self, mock_firestore):
        """Test saving continuity issues"""
        service = ContinuityTrackerService()
        service.db = mock_firestore

        mock_doc_ref = MagicMock()
        mock_doc_ref.set = MagicMock()

        mock_firestore.collection().document().collection().document.return_value = mock_doc_ref

        issues = [
            {
                'type': 'character',
                'severity': 'high',
                'description': 'Test issue',
                'affectedScenes': ['scene1'],
                'resolved': False
            }
        ]

        service._save_issues('test_project', issues)

        # Should call set for each issue
        assert mock_doc_ref.set.call_count == len(issues)

    def test_get_issues(self, mock_firestore):
        """Test retrieving continuity issues"""
        service = ContinuityTrackerService()
        service.db = mock_firestore

        mock_issue1 = MagicMock()
        mock_issue1.id = 'issue1'
        mock_issue1.to_dict.return_value = {
            'type': 'character',
            'severity': 'high',
            'description': 'Issue 1',
            'resolved': False
        }

        mock_issue2 = MagicMock()
        mock_issue2.id = 'issue2'
        mock_issue2.to_dict.return_value = {
            'type': 'timeline',
            'severity': 'low',
            'description': 'Issue 2',
            'resolved': True
        }

        mock_firestore.collection().document().collection().stream.return_value = [
            mock_issue1, mock_issue2
        ]

        result = service.get_issues('test_project')

        assert len(result) == 2

    def test_resolve_issue(self, mock_firestore):
        """Test resolving an issue"""
        service = ContinuityTrackerService()
        service.db = mock_firestore

        mock_doc_ref = MagicMock()
        mock_doc_ref.update = MagicMock()

        mock_firestore.collection().document().collection().document.return_value = mock_doc_ref

        service.resolve_issue('test_project', 'issue123')

        mock_doc_ref.update.assert_called_once_with({'resolved': True})

    def test_without_gemini_model(self, mock_firestore):
        """Test service without Gemini model"""
        service = ContinuityTrackerService()
        service.db = mock_firestore
        service.model = None

        # Should return empty result
        result = service.check_continuity('test_project')

        assert result is not None
        assert result['totalIssues'] == 0

    def test_severity_classification(self):
        """Test issue severity classification"""
        service = ContinuityTrackerService()

        # Test high severity keywords
        assert service._classify_severity("This is a critical error") == 'high'
        assert service._classify_severity("Major inconsistency found") == 'high'

        # Test medium severity
        assert service._classify_severity("Moderate issue detected") == 'medium'

        # Test low severity
        assert service._classify_severity("Minor discrepancy noted") == 'low'

        # Test default
        assert service._classify_severity("Something happened") == 'medium'

    def test_filter_issues_by_type(self, mock_firestore):
        """Test filtering issues by type"""
        service = ContinuityTrackerService()
        service.db = mock_firestore

        mock_issue1 = MagicMock()
        mock_issue1.id = 'issue1'
        mock_issue1.to_dict.return_value = {'type': 'character', 'severity': 'high'}

        mock_issue2 = MagicMock()
        mock_issue2.id = 'issue2'
        mock_issue2.to_dict.return_value = {'type': 'timeline', 'severity': 'low'}

        mock_query = MagicMock()
        mock_query.stream.return_value = [mock_issue1]

        mock_collection = MagicMock()
        mock_collection.where.return_value = mock_query

        mock_firestore.collection().document().collection.return_value = mock_collection

        result = service.get_issues('test_project', issue_type='character')

        assert len(result) == 1
        assert result[0]['type'] == 'character'
