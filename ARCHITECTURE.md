# System Architecture

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  HomePage   │  │ ProjectPage │  │ EditorPage  │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                 │                 │                     │
│  ┌──────┴─────────────────┴─────────────────┴──────┐            │
│  │           StoryBiblePage                         │            │
│  │  ┌─────────┐  ┌──────────┐  ┌────────┐         │            │
│  │  │Characters│  │Locations│  │  Lore  │         │            │
│  │  └─────────┘  └──────────┘  └────────┘         │            │
│  └──────────────────────────────────────────────────┘            │
│                          │                                        │
│  ┌───────────────────────┴──────────────────────────┐            │
│  │         API Services (TypeScript)                 │            │
│  │  • storyBibleService  • editorService            │            │
│  └───────────────────────┬──────────────────────────┘            │
└────────────────────────────┼──────────────────────────────────────┘
                             │
                             │ REST API (HTTP/JSON)
                             │
┌────────────────────────────┼──────────────────────────────────────┐
│                            ▼                                       │
│                    BACKEND (Python/Flask)                         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐        │
│  │                   API Routes                         │        │
│  │  • /api/story-bible/*  • /api/editor/*              │        │
│  │  • /api/planning/*     • /api/continuity/*          │        │
│  │  • /api/inspiration/*  • /api/assets/*              │        │
│  │  • /api/export/*                                    │        │
│  └──────────────┬───────────────────────────────────────┘        │
│                 │                                                 │
│  ┌──────────────┴───────────────────────────────────────┐        │
│  │                  Business Logic Services             │        │
│  │  ┌────────────────────┐  ┌────────────────────┐     │        │
│  │  │StoryBibleService   │  │AIEditorService     │     │        │
│  │  │  • CRUD operations │  │  • Context building│     │        │
│  │  │  • Relationships   │  │  • AI prompts      │     │        │
│  │  │  • Context query   │  │  • Generation      │     │        │
│  │  └────────────────────┘  └────────────────────┘     │        │
│  │                                                       │        │
│  │  ┌────────────────────┐  ┌────────────────────┐     │        │
│  │  │VisualPlanningServ  │  │ContinuityTracker   │     │        │
│  │  │  • Corkboard       │  │  • Character check │     │        │
│  │  │  • Matrix          │  │  • Timeline check  │     │        │
│  │  │  • Outline         │  │  • Location check  │     │        │
│  │  └────────────────────┘  └────────────────────┘     │        │
│  └──────────────┬───────────────────┬───────────────────┘        │
│                 │                   │                             │
└─────────────────┼───────────────────┼─────────────────────────────┘
                  │                   │
        ┌─────────┴─────────┐   ┌────┴────────┐
        │                   │   │             │
        ▼                   ▼   ▼             │
┌──────────────┐    ┌──────────────────┐     │
│   Firebase   │    │   Google Gemini  │     │
│   Firestore  │    │      AI API      │     │
│              │    │                  │     │
│  • Projects  │    │  • Text Gen      │     │
│  • Characters│    │  • Continuity    │     │
│  • Locations │    │  • Analysis      │     │
│  • Lore      │    └──────────────────┘     │
│  • Plots     │                              │
│  • Scenes    │                              │
└──────────────┘                              │
                                              │
                                              │
                                    ┌─────────┴─────────┐
                                    │  Data Models      │
                                    │  • Character      │
                                    │  • Location       │
                                    │  • LoreEntry      │
                                    │  • PlotPoint      │
                                    │  • Scene          │
                                    │  • Project        │
                                    └───────────────────┘
```

## Data Flow Examples

### 1. AI Scene Generation Flow
```
User Input (EditorPage)
    ↓
    ├─→ Prompt: "Hero discovers powers"
    ├─→ Tone: Dramatic
    └─→ Characters: [hero_id]
    
    ↓ (HTTP POST /api/editor/generate-scene)
    
AIEditorService
    ↓
    ├─→ Query StoryBibleService for character details
    ├─→ Build context with traits, backstory, location
    └─→ Format prompt for Gemini AI
    
    ↓
    
Gemini API
    ↓
    └─→ Generate scene text with character consistency
    
    ↓ (Response)
    
EditorPage
    └─→ Display generated text in editor
```

### 2. Story Bible Context Query Flow
```
Scene Selection (EditorPage)
    ↓
    └─→ scene_id
    
    ↓ (HTTP GET /api/story-bible/projects/{id}/scenes/{scene_id}/context)
    
StoryBibleService
    ↓
    ├─→ Fetch scene from Firestore
    ├─→ Fetch related characters
    ├─→ Fetch location details
    ├─→ Fetch relevant lore
    └─→ Fetch plot points
    
    ↓
    
Firestore (Multiple Queries)
    ├─→ projects/{id}/scenes/{scene_id}
    ├─→ projects/{id}/characters/{char_id}...
    ├─→ projects/{id}/locations/{loc_id}
    └─→ projects/{id}/lore/*
    
    ↓ (Combined Response)
    
EditorPage
    └─→ Display context in AI Assistant panel
```

### 3. Continuity Check Flow
```
Check Request (UI)
    ↓
    └─→ project_id
    
    ↓ (HTTP POST /api/continuity/check/{project_id})
    
ContinuityTrackerService
    ↓
    ├─→ Fetch all characters
    ├─→ Fetch all scenes
    ├─→ Fetch all locations
    └─→ Group by character/timeline/location
    
    ↓
    
For each check:
    ├─→ Build analysis prompt
    ├─→ Send to Gemini AI
    └─→ Parse response for issues
    
    ↓
    
Gemini AI (Multiple Requests)
    └─→ Analyze consistency, return issues
    
    ↓
    
Save to Firestore
    └─→ projects/{id}/continuity_issues/*
    
    ↓ (Response with issue count)
    
UI
    └─→ Display issue summary
```

## Component Relationships

### Backend Service Dependencies
```
app.py (Main Application)
    ├─→ story_bible.py (Routes)
    │   └─→ StoryBibleService
    │       └─→ Firestore Client
    │
    ├─→ editor.py (Routes)
    │   ├─→ AIEditorService
    │   │   └─→ Gemini API
    │   └─→ StoryBibleService (for context)
    │
    ├─→ visual_planning.py (Routes)
    │   ├─→ VisualPlanningService
    │   │   └─→ Firestore Client
    │   └─→ StoryBibleService (for generation)
    │
    └─→ continuity.py (Routes)
        ├─→ ContinuityTrackerService
        │   └─→ Gemini API
        └─→ StoryBibleService (for data)
```

### Frontend Component Hierarchy
```
App.tsx
    ├─→ HomePage
    │   ├─→ Project List
    │   └─→ Create Project Dialog
    │
    ├─→ ProjectPage
    │   ├─→ Project Overview
    │   └─→ Navigation Tabs
    │
    ├─→ EditorPage
    │   ├─→ Scene List (Sidebar)
    │   ├─→ Editor Panel (Center)
    │   └─→ AI Assistant (Right)
    │       ├─→ Context Display
    │       └─→ Generation Controls
    │
    └─→ StoryBiblePage
        ├─→ Characters Tab
        │   └─→ CharacterCard (Multiple)
        ├─→ Locations Tab
        ├─→ Lore Tab
        └─→ Plot Points Tab
```

## Technology Stack Layers

```
┌──────────────────────────────────────────┐
│           User Interface Layer            │
│  • React 19                               │
│  • Material-UI v5                         │
│  • TypeScript                             │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────┴───────────────────────┐
│        Application Logic Layer            │
│  • React Hooks (State Management)        │
│  • React Router (Navigation)             │
│  • Axios (HTTP Client)                   │
└──────────────────┬───────────────────────┘
                   │
                   │ REST API
                   │
┌──────────────────┴───────────────────────┐
│         API & Routing Layer               │
│  • Flask 3.0                              │
│  • Flask-CORS                             │
│  • Blueprint Routing                      │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────┴───────────────────────┐
│       Business Logic Layer                │
│  • Service Classes                        │
│  • Context Management                     │
│  • AI Prompt Engineering                  │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────┴───────────────────────┐
│          Data Access Layer                │
│  • Firestore Client                       │
│  • Data Models (Dataclasses)             │
│  • CRUD Operations                        │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────┴───────────────────────┐
│        External Services Layer            │
│  • Firebase Firestore (Database)         │
│  • Google Gemini API (AI)                │
└───────────────────────────────────────────┘
```

## Security & Configuration

```
Environment Variables (.env files)
    ├─→ Backend
    │   ├─→ GOOGLE_API_KEY (Gemini)
    │   ├─→ FIREBASE_CONFIG (Service Account)
    │   ├─→ FLASK_ENV (development/production)
    │   └─→ PORT (Server port)
    │
    └─→ Frontend
        ├─→ REACT_APP_API_URL (Backend URL)
        └─→ REACT_APP_FIREBASE_* (Client config)

.gitignore
    ├─→ .env (Never committed)
    ├─→ node_modules/
    ├─→ __pycache__/
    └─→ build/
```

## Deployment Architecture (Future)

```
┌───────────────────────────────────────────┐
│          CDN (Frontend Assets)             │
│  • React build artifacts                  │
│  • Static files                           │
└──────────────────┬────────────────────────┘
                   │
┌──────────────────┴────────────────────────┐
│      Application Server (Backend)          │
│  • Cloud Run / Heroku / AWS                │
│  • Gunicorn + Flask                        │
│  • Auto-scaling                            │
└──────────────────┬────────────────────────┘
                   │
┌──────────────────┴────────────────────────┐
│       Firebase Services (Google)           │
│  • Firestore (Database)                    │
│  • Authentication                          │
│  • Hosting (Optional)                      │
└────────────────────────────────────────────┘
```

This architecture ensures:
- ✅ Clear separation of concerns
- ✅ Scalable component structure
- ✅ Testable service layer
- ✅ Flexible deployment options
- ✅ Maintainable codebase
