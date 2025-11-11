"""
Tests for API routes
"""
import pytest
import json
from unittest.mock import MagicMock, patch


class TestHealthRoutes:
    """Test health check routes"""

    def test_home_route(self, client):
        """Test home route"""
        response = client.get('/')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'message' in data
        assert data['message'] == 'Lit-Rift API'

    def test_health_route(self, client):
        """Test health check route"""
        response = client.get('/api/health')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'status' in data
        assert data['status'] == 'healthy'


class TestStoryBibleRoutes:
    """Test Story Bible API routes"""

    @patch('routes.story_bible.StoryBibleService')
    def test_create_project(self, mock_service_class, client):
        """Test project creation"""
        mock_service = MagicMock()
        mock_service.create_project.return_value = {
            'id': 'proj123',
            'title': 'Test Novel'
        }
        mock_service_class.return_value = mock_service

        project_data = {
            'title': 'Test Novel',
            'author': 'Test Author',
            'genre': 'Fantasy',
            'description': 'A test novel',
            'target_word_count': 50000
        }

        response = client.post('/api/story-bible/projects',
                               data=json.dumps(project_data),
                               content_type='application/json')

        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['id'] == 'proj123'

    @patch('routes.story_bible.StoryBibleService')
    def test_get_project(self, mock_service_class, client):
        """Test getting a project"""
        mock_service = MagicMock()
        mock_service.get_project.return_value = {
            'id': 'proj123',
            'title': 'Test Novel'
        }
        mock_service_class.return_value = mock_service

        response = client.get('/api/story-bible/projects/proj123')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['title'] == 'Test Novel'

    @patch('routes.story_bible.StoryBibleService')
    def test_create_character(self, mock_service_class, client):
        """Test character creation"""
        mock_service = MagicMock()
        mock_service.create_character.return_value = {
            'id': 'char123',
            'name': 'Hero'
        }
        mock_service_class.return_value = mock_service

        character_data = {
            'name': 'Hero',
            'role': 'Protagonist',
            'traits': ['brave', 'clever']
        }

        response = client.post('/api/story-bible/projects/proj123/characters',
                               data=json.dumps(character_data),
                               content_type='application/json')

        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['name'] == 'Hero'

    @patch('routes.story_bible.StoryBibleService')
    def test_list_characters(self, mock_service_class, client):
        """Test listing characters"""
        mock_service = MagicMock()
        mock_service.list_characters.return_value = [
            {'id': 'char1', 'name': 'Hero'},
            {'id': 'char2', 'name': 'Villain'}
        ]
        mock_service_class.return_value = mock_service

        response = client.get('/api/story-bible/projects/proj123/characters')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) == 2


class TestEditorRoutes:
    """Test Editor API routes"""

    @patch('routes.editor.AIEditorService')
    @patch('routes.editor.StoryBibleService')
    def test_generate_scene(self, mock_bible_service, mock_editor_service, client):
        """Test scene generation"""
        mock_editor = MagicMock()
        mock_editor.generate_scene.return_value = {
            'text': 'Generated scene content',
            'word_count': 250
        }
        mock_editor_service.return_value = mock_editor

        scene_data = {
            'characters': ['char1'],
            'location': 'loc1',
            'prompt': 'Hero discovers power',
            'tone': 'dramatic',
            'length': 'medium'
        }

        response = client.post('/api/editor/generate-scene/proj123',
                               data=json.dumps(scene_data),
                               content_type='application/json')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'text' in data

    @patch('routes.editor.AIEditorService')
    def test_generate_dialogue(self, mock_service_class, client):
        """Test dialogue generation"""
        mock_service = MagicMock()
        mock_service.generate_dialogue.return_value = {
            'dialogue': 'Character conversation'
        }
        mock_service_class.return_value = mock_service

        dialogue_data = {
            'characters': ['char1', 'char2'],
            'context': 'Meeting for first time',
            'tone': 'friendly'
        }

        response = client.post('/api/editor/generate-dialogue/proj123',
                               data=json.dumps(dialogue_data),
                               content_type='application/json')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'dialogue' in data

    @patch('routes.editor.AIEditorService')
    def test_rewrite_text(self, mock_service_class, client):
        """Test text rewriting"""
        mock_service = MagicMock()
        mock_service.rewrite_text.return_value = {
            'text': 'Rewritten text'
        }
        mock_service_class.return_value = mock_service

        rewrite_data = {
            'text': 'Original text',
            'instruction': 'Make more dramatic',
            'tone': 'dramatic'
        }

        response = client.post('/api/editor/rewrite',
                               data=json.dumps(rewrite_data),
                               content_type='application/json')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'text' in data


class TestVisualPlanningRoutes:
    """Test Visual Planning API routes"""

    @patch('routes.visual_planning.VisualPlanningService')
    def test_get_corkboard(self, mock_service_class, client):
        """Test getting corkboard"""
        mock_service = MagicMock()
        mock_service.get_corkboard.return_value = {
            'items': []
        }
        mock_service_class.return_value = mock_service

        response = client.get('/api/planning/corkboard/proj123')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'items' in data

    @patch('routes.visual_planning.VisualPlanningService')
    def test_save_corkboard(self, mock_service_class, client):
        """Test saving corkboard"""
        mock_service = MagicMock()
        mock_service.save_corkboard.return_value = None
        mock_service_class.return_value = mock_service

        corkboard_data = {
            'items': [
                {'id': 'item1', 'type': 'note', 'title': 'Test'}
            ]
        }

        response = client.post('/api/planning/corkboard/proj123',
                               data=json.dumps(corkboard_data),
                               content_type='application/json')

        assert response.status_code == 200

    @patch('routes.visual_planning.VisualPlanningService')
    def test_generate_matrix(self, mock_service_class, client):
        """Test matrix generation"""
        mock_service = MagicMock()
        mock_service.generate_matrix.return_value = {
            'rows': ['Act 1', 'Act 2'],
            'cols': ['Thread A', 'Thread B'],
            'cells': []
        }
        mock_service_class.return_value = mock_service

        response = client.post('/api/planning/matrix/proj123/generate')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'rows' in data
        assert 'cols' in data

    @patch('routes.visual_planning.VisualPlanningService')
    def test_generate_outline(self, mock_service_class, client):
        """Test outline generation"""
        mock_service = MagicMock()
        mock_service.generate_outline.return_value = [
            {'id': 'node1', 'title': 'Chapter 1', 'level': 0}
        ]
        mock_service_class.return_value = mock_service

        response = client.post('/api/planning/outline/proj123/generate')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'outline' in data


class TestContinuityRoutes:
    """Test Continuity Tracker API routes"""

    @patch('routes.continuity.ContinuityTrackerService')
    @patch('routes.continuity.StoryBibleService')
    def test_check_continuity(self, mock_bible_service, mock_continuity_service, client):
        """Test continuity check"""
        mock_service = MagicMock()
        mock_service.check_continuity.return_value = {
            'totalIssues': 2,
            'issues': [
                {'type': 'character', 'severity': 'high', 'description': 'Issue 1'},
                {'type': 'timeline', 'severity': 'low', 'description': 'Issue 2'}
            ]
        }
        mock_continuity_service.return_value = mock_service

        response = client.post('/api/continuity/check/proj123')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'totalIssues' in data
        assert data['totalIssues'] == 2

    @patch('routes.continuity.ContinuityTrackerService')
    def test_get_issues(self, mock_service_class, client):
        """Test getting continuity issues"""
        mock_service = MagicMock()
        mock_service.get_issues.return_value = [
            {'id': 'issue1', 'type': 'character', 'severity': 'high'}
        ]
        mock_service_class.return_value = mock_service

        response = client.get('/api/continuity/issues/proj123')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'issues' in data

    @patch('routes.continuity.ContinuityTrackerService')
    def test_resolve_issue(self, mock_service_class, client):
        """Test resolving an issue"""
        mock_service = MagicMock()
        mock_service.resolve_issue.return_value = None
        mock_service_class.return_value = mock_service

        response = client.patch('/api/continuity/issues/proj123/issue123/resolve')

        assert response.status_code == 200


class TestErrorHandling:
    """Test error handling in routes"""

    @patch('routes.story_bible.StoryBibleService')
    def test_invalid_project_id(self, mock_service_class, client):
        """Test handling of invalid project ID"""
        mock_service = MagicMock()
        mock_service.get_project.return_value = None
        mock_service_class.return_value = mock_service

        response = client.get('/api/story-bible/projects/invalid')

        assert response.status_code == 404

    def test_invalid_json(self, client):
        """Test handling of invalid JSON"""
        response = client.post('/api/story-bible/projects',
                               data='invalid json',
                               content_type='application/json')

        assert response.status_code == 400

    @patch('routes.story_bible.StoryBibleService')
    def test_missing_required_fields(self, mock_service_class, client):
        """Test handling of missing required fields"""
        mock_service = MagicMock()
        mock_service_class.return_value = mock_service

        # Missing required 'name' field
        character_data = {
            'role': 'Protagonist'
        }

        response = client.post('/api/story-bible/projects/proj123/characters',
                               data=json.dumps(character_data),
                               content_type='application/json')

        assert response.status_code == 400
