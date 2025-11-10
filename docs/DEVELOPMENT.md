# Development Guide

## Architecture Overview

Lit-Rift follows a modern web application architecture with clear separation between frontend and backend:

### Backend (Python/Flask)
- **Framework**: Flask with Flask-CORS for API endpoints
- **AI Integration**: Google Gemini API for text generation
- **Database**: Firebase Firestore for real-time, document-based storage
- **Structure**:
  - `app.py`: Main application entry point
  - `routes/`: API endpoint definitions
  - `services/`: Business logic layer
  - `models/`: Data models and schemas
  - `utils/`: Utility functions

### Frontend (React/TypeScript)
- **Framework**: React 19 with TypeScript
- **UI Library**: Material-UI (MUI) for components
- **Routing**: React Router for navigation
- **State Management**: React hooks (useState, useEffect)
- **Structure**:
  - `pages/`: Main page components
  - `components/`: Reusable UI components
  - `services/`: API client services
  - `contexts/`: React context providers
  - `utils/`: Utility functions

## Key Features Implementation

### 1. Story Bible (Priority 1)
**Status**: ✅ Implemented

The Story Bible is the central data structure that tracks all story elements:
- **Models**: Character, Location, LoreEntry, PlotPoint, Scene, Project
- **Service**: `story_bible_service.py` handles all CRUD operations
- **API**: RESTful endpoints for each entity type
- **Frontend**: `StoryBiblePage.tsx` provides UI for managing all entities

Key implementation detail: All Story Bible data is scoped to projects, with relationships tracked via IDs.

### 2. Context-Aware Editor (Priority 2)
**Status**: ✅ Implemented

The AI-powered editor pulls Story Bible context for consistent generation:
- **Service**: `ai_editor_service.py` uses Gemini API with context-aware prompts
- **Context Building**: Automatically includes characters, locations, lore, and plot points
- **Features**:
  - Scene generation with tone and length control
  - Dialogue generation between characters
  - Text rewriting, expansion, summarization
  - Continuation from existing text
- **Frontend**: `EditorPage.tsx` with split-pane layout (scenes, editor, AI panel)

### 3. Visual Planning (Priority 3)
**Status**: 🔄 Placeholder Implemented

Planned views for visual story planning:
- **Corkboard**: Free-form canvas for arranging story elements
- **Matrix/Grid**: Structured view for organizing scenes
- **Outline**: Traditional hierarchical outline view

Current implementation provides API endpoints; frontend UI needs full implementation.

### 4. Continuity Tracker (Priority 4)
**Status**: 🔄 Placeholder Implemented

AI agent that scans for inconsistencies:
- Planned features: Character detail tracking, location logic, timeline validation
- Current: API structure in place, needs AI logic implementation

### 5. Inspiration Module (Priority 5)
**Status**: 🔄 Placeholder Implemented

Generate creative ideas from various inputs:
- Planned: Image/text/audio input analysis
- Output: Ideas, prompts, "what if" scenarios
- Current: API structure ready for AI integration

### 6. Asset Generation (Priority 6)
**Status**: 🔄 Placeholder Implemented

Generate multimedia assets:
- Images from Story Bible descriptions
- Text-to-speech audiobook generation
- Current: API endpoints defined, needs integration with Gemini image/audio APIs

### 7. Multi-Format Export (Priority 7)
**Status**: 🔄 Placeholder Implemented

Export to various formats:
- PDF, EPUB, MOBI for ebooks
- MP3 for audiobooks
- Current: API structure in place, needs format conversion libraries

## Development Workflow

### Setting Up Development Environment

1. **Backend Setup**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
python app.py
```

2. **Frontend Setup**:
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```

### Making Changes

1. **Backend Changes**:
   - Models: Add/modify in `models/`
   - Business Logic: Implement in `services/`
   - API Endpoints: Define in `routes/`
   - Test: Use `pytest` or manual API testing

2. **Frontend Changes**:
   - Components: Create in `components/`
   - Pages: Add in `pages/`
   - API Integration: Update `services/`
   - Styling: Use MUI's `sx` prop or theme

### Testing

Backend:
```bash
cd backend
pytest
```

Frontend:
```bash
cd frontend
npm test
```

## Code Style

### Python (Backend)
- Follow PEP 8
- Use type hints where appropriate
- Docstrings for functions and classes
- Keep functions focused and small

### TypeScript (Frontend)
- Use TypeScript strict mode
- Interface definitions for data types
- Functional components with hooks
- Descriptive variable names

## Database Schema

### Firestore Structure
```
projects/
  {project_id}/
    - Project data (title, author, etc.)
    characters/
      {character_id}/
        - Character data
    locations/
      {location_id}/
        - Location data
    lore/
      {lore_id}/
        - Lore entry data
    plot_points/
      {plot_id}/
        - Plot point data
    scenes/
      {scene_id}/
        - Scene data
```

## AI Integration

### Gemini API Usage

The AI Editor Service builds context-aware prompts:
```python
def _build_context_prompt(self, context: Dict, request_type: str) -> str:
    # Combines project metadata, characters, locations, lore, and plot
    # Creates a rich context for AI generation
```

Key points:
- Context is pulled from Story Bible for every generation
- Prompts are structured to maintain consistency
- Tone and length parameters control output style

## Next Steps for Development

1. **Complete Visual Planning UI**: Implement drag-and-drop corkboard and matrix views
2. **Enhance Continuity Tracker**: Add AI logic to detect inconsistencies
3. **Implement Asset Generation**: Integrate Gemini image/audio APIs
4. **Build Export Functionality**: Add PDF, EPUB, MOBI generation
5. **Add Authentication**: Implement user accounts and project ownership
6. **Real-time Collaboration**: Use Firestore's real-time features for multi-user editing
7. **Testing**: Add comprehensive unit and integration tests
8. **Performance**: Optimize AI requests and database queries

## Deployment

### Backend Deployment
- Use Gunicorn as WSGI server
- Deploy to cloud platforms (Heroku, Google Cloud Run, AWS)
- Set environment variables for production
- Enable HTTPS

### Frontend Deployment
- Build: `npm run build`
- Deploy static files to CDN or hosting service
- Configure API URL for production
- Enable compression and caching

## Contributing

When contributing:
1. Follow the established code structure
2. Maintain type safety (TypeScript, Python type hints)
3. Document new features
4. Test your changes
5. Keep commits focused and descriptive
