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

    @patch('routes.story_bible.story_bible_service')
    def test_create_project(self, mock_service, client):
        """Test project creation"""
        mock_service.create_project.return_value = {
            'id': 'proj123',
            'title': 'Test Novel'
        }

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

    @patch('routes.story_bible.story_bible_service')
    def test_get_project(self, mock_service, client):
        """Test getting a project"""
        mock_service.get_project.return_value = {
            'id': 'proj123',
            'title': 'Test Novel'
        }

        response = client.get('/api/story-bible/projects/proj123')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['title'] == 'Test Novel'

    @patch('routes.story_bible.story_bible_service')
    def test_create_character(self, mock_service, client):
        """Test character creation"""
        mock_service.create_character.return_value = {
            'id': 'char123',
            'name': 'Hero'
        }

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

    @patch('routes.story_bible.story_bible_service')
    def test_list_characters(self, mock_service, client):
        """Test listing characters"""
        mock_service.list_characters.return_value = [
            {'id': 'char1', 'name': 'Hero'},
            {'id': 'char2', 'name': 'Villain'}
        ]

        response = client.get('/api/story-bible/projects/proj123/characters')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) == 2


class TestEditorRoutes:
    """Test Editor API routes"""

    @patch('routes.editor.ai_editor_service')
    @patch('routes.editor.story_bible_service')
    def test_generate_scene(self, mock_bible_service, mock_editor_service, client):
        """Test scene generation"""
        mock_editor_service.generate_scene.return_value = {
            'text': 'Generated scene content',
            'word_count': 250
        }

        scene_data = {
            'characters': ['char1'],
            'location': 'loc1',
            'prompt': 'Hero discovers power',
            'tone': 'dramatic',
            'length': 'medium'
        }

        response = client.post('/api/editor/generate-scene',
                               data=json.dumps({**scene_data, 'project_id': 'proj123'}),
                               content_type='application/json')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'text' in data

    @patch('routes.editor.ai_editor_service')
    def test_generate_dialogue(self, mock_service, client):
        """Test dialogue generation"""
        mock_service.generate_dialogue.return_value = {
            'dialogue': 'Character conversation'
        }

        dialogue_data = {
            'characters': ['char1', 'char2'],
            'situation': 'Meeting for first time',
            'project_id': 'proj123',
            'context': 'Meeting for first time',
            'tone': 'friendly'
        }

        response = client.post('/api/editor/generate-dialogue',
                               data=json.dumps(dialogue_data),
                               content_type='application/json')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'dialogue' in data

    @patch('routes.editor.ai_editor_service')
    def test_rewrite_text(self, mock_service, client):
        """Test text rewriting"""
        mock_service.rewrite_text.return_value = {
            'text': 'Rewritten text'
        }

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

    @patch('routes.visual_planning.planning_service')
    def test_get_corkboard(self, mock_service, client):
        """Test getting corkboard"""
        mock_service.get_corkboard.return_value = {
            'items': []
        }

        response = client.get('/api/planning/corkboard/proj123')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'items' in data

    @patch('routes.visual_planning.planning_service')
    def test_save_corkboard(self, mock_service, client):
        """Test saving corkboard"""
        mock_service.save_corkboard.return_value = None

        corkboard_data = {
            'items': [
                {'id': 'item1', 'type': 'note', 'title': 'Test'}
            ]
        }

        response = client.post('/api/planning/corkboard/proj123',
                               data=json.dumps(corkboard_data),
                               content_type='application/json')

        assert response.status_code == 200

    @patch('routes.visual_planning.planning_service')
    def test_generate_matrix(self, mock_service, client):
        """Test matrix generation"""
        mock_service.create_matrix_from_scenes.return_value = {
            'rows': ['Act 1', 'Act 2'],
            'cols': ['Thread A', 'Thread B'],
            'cells': []
        }

        response = client.post('/api/planning/matrix/proj123/generate')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'rows' in data
        assert 'cols' in data

    @patch('routes.visual_planning.planning_service')
    def test_generate_outline(self, mock_service, client):
        """Test outline generation"""
        mock_service.generate_outline_from_plot.return_value = {
            'outline': [{'id': 'node1', 'title': 'Chapter 1', 'level': 0}],
            'view_type': 'outline'
        }

        response = client.post('/api/planning/outline/proj123/generate')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'outline' in data


class TestContinuityRoutes:
    """Test Continuity Tracker API routes"""

    @patch('routes.continuity.continuity_service')
    @patch('routes.continuity.story_bible_service')
    def test_check_continuity(self, mock_bible_service, mock_continuity_service, client):
        """Test continuity check"""
        mock_continuity_service.perform_full_check.return_value = {
            'totalIssues': 2,
            'issues': [
                {'type': 'character', 'severity': 'high', 'description': 'Issue 1'},
                {'type': 'timeline', 'severity': 'low', 'description': 'Issue 2'}
            ]
        }

        response = client.post('/api/continuity/check/proj123')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'totalIssues' in data
        assert data['totalIssues'] == 2

    @patch('routes.continuity.continuity_service')
    def test_get_issues(self, mock_service, client):
        """Test getting continuity issues"""
        mock_service.get_issues.return_value = [
            {'id': 'issue1', 'type': 'character', 'severity': 'high'}
        ]

        response = client.get('/api/continuity/issues/proj123')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'issues' in data

    @patch('routes.continuity.continuity_service')
    def test_resolve_issue(self, mock_service, client):
        """Test resolving an issue"""
        mock_service.resolve_issue.return_value = True

        response = client.post('/api/continuity/resolve/proj123/issue123')

        assert response.status_code == 200


class TestErrorHandling:
    """Test error handling in routes"""

    @patch('routes.story_bible.story_bible_service')
    def test_invalid_project_id(self, mock_service, client):
        """Test handling of invalid project ID"""
        mock_service.get_project.return_value = None

        response = client.get('/api/story-bible/projects/invalid')

        assert response.status_code == 404

    def test_invalid_json(self, client):
        """Test handling of invalid JSON"""
        response = client.post('/api/story-bible/projects',
                               data='invalid json',
                               content_type='application/json')

        assert response.status_code == 400

    @patch('routes.story_bible.story_bible_service')
    def test_missing_required_fields(self, mock_service, client):
        """Test handling of missing required fields"""
        # Missing required 'name' field
        character_data = {
            'role': 'Protagonist'
        }

        response = client.post('/api/story-bible/projects/proj123/characters',
                               data=json.dumps(character_data),
                               content_type='application/json')

        assert response.status_code == 400
