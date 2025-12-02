"""
Pytest configuration and fixtures for backend tests
"""
import pytest
import sys
import os
from unittest.mock import Mock, MagicMock, patch

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Mock external dependencies before imports
# We only mock services that require external connection or credentials
sys.modules['google.generativeai'] = MagicMock()
sys.modules['firebase_admin'] = MagicMock()
sys.modules['firebase_admin.credentials'] = MagicMock()
sys.modules['firebase_admin.firestore'] = MagicMock()
# Do NOT mock flask or flask_cors as we want to test the app structure

@pytest.fixture
def mock_firestore():
    """Mock Firestore client"""
    mock_db = MagicMock()
    # Ensure nested collections work recursively and return consistent mocks
    # This allows: db.collection('a').document('b').collection('c').stream()
    return mock_db


@pytest.fixture
def mock_gemini_model():
    """Mock Gemini AI model"""
    mock_model = MagicMock()
    mock_response = MagicMock()
    mock_response.text = "Generated text from AI"
    mock_model.generate_content = MagicMock(return_value=mock_response)
    return mock_model


@pytest.fixture
def sample_project_data():
    """Sample project data for testing"""
    return {
        'title': 'Test Novel',
        'author': 'Test Author',
        'genre': 'Fantasy',
        'description': 'A test novel description',
        'target_word_count': 50000,
        'current_word_count': 0,
        'created_at': '2025-01-01T00:00:00Z',
        'updated_at': '2025-01-01T00:00:00Z'
    }


@pytest.fixture
def sample_character_data():
    """Sample character data for testing"""
    return {
        'name': 'Test Hero',
        'role': 'Protagonist',
        'description': 'A brave hero',
        'traits': ['brave', 'clever', 'loyal'],
        'backstory': 'Born in a small village',
        'notes': 'Main character of the story'
    }


@pytest.fixture
def sample_location_data():
    """Sample location data for testing"""
    return {
        'name': 'Test Kingdom',
        'type': 'Kingdom',
        'description': 'A vast kingdom',
        'attributes': {'population': 'large', 'climate': 'temperate'},
        'notes': 'Primary setting'
    }


@pytest.fixture
def sample_lore_data():
    """Sample lore data for testing"""
    return {
        'title': 'Magic System',
        'category': 'magic',
        'content': 'Magic is powered by emotions',
        'tags': ['magic', 'system']
    }


@pytest.fixture
def sample_plot_data():
    """Sample plot point data for testing"""
    return {
        'title': 'The Awakening',
        'description': 'Hero discovers their power',
        'act': 1,
        'order': 1,
        'notes': 'Opening scene'
    }


@pytest.fixture
def sample_scene_data():
    """Sample scene data for testing"""
    return {
        'title': 'Opening Scene',
        'content': 'The hero wakes up...',
        'characters': ['char1', 'char2'],
        'location': 'loc1',
        'plot_points': ['plot1'],
        'word_count': 500,
        'order': 1
    }


@pytest.fixture
def mock_story_bible_service(mock_firestore):
    """Mock StoryBibleService with Firestore"""
    from services.story_bible_service import StoryBibleService
    service = StoryBibleService(mock_firestore)
    return service


@pytest.fixture
def mock_ai_editor_service(mock_firestore, mock_gemini_model):
    """Mock AIEditorService"""
    from services.ai_editor_service import AIEditorService
    service = AIEditorService()
    service.db = mock_firestore
    service.model = mock_gemini_model
    return service


@pytest.fixture
def flask_app():
    """Create Flask app for testing"""
    import app as flask_app_module
    app = flask_app_module.app
    app.config['TESTING'] = True
    return app


@pytest.fixture
def client(flask_app):
    """Flask test client"""
    return flask_app.test_client()


# Mock environment variables
@pytest.fixture(autouse=True)
def mock_env_vars(monkeypatch):
    """Mock environment variables for all tests"""
    monkeypatch.setenv('FLASK_ENV', 'testing')
    monkeypatch.setenv('GOOGLE_API_KEY', 'test_api_key')
    monkeypatch.setenv('MOCK_AUTH', 'true')
