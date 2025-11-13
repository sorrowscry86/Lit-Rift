# Lit-Rift: Documentation Index & Navigation Guide

**Quick navigation to all project documentation and resources**

---

## 🚀 Quick Start Paths

### For New Users (5 minutes)
1. [README.md](README.md) - Project overview
2. [QUICKSTART.md](QUICKSTART.md) - Get running in 5 minutes
3. [docs/FEATURES.md](docs/FEATURES.md) - What can this app do?

### For Developers (20 minutes)
1. [ARCHITECTURE.md](ARCHITECTURE.md) - System design
2. [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) - Development guide
3. [docs/API.md](docs/API.md) - API reference
4. [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute

### For DevOps/Deployment (30 minutes)
1. [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
2. [PRODUCTION_READY.md](PRODUCTION_READY.md) - Production checklist
3. [docker-compose.yml](docker-compose.yml) - Container setup

---

## 📚 Documentation by Category

### Core Documentation

#### Project Overview
| Document | Purpose | Audience | Time |
|----------|---------|----------|------|
| [README.md](README.md) | Project introduction | Everyone | 5 min |
| [QUICKSTART.md](QUICKSTART.md) | Fast setup guide | New users | 5 min |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Technical architecture | Developers | 20 min |
| [MANIFEST.md](MANIFEST.md) | Complete file inventory | Developers | 10 min |
| [INDEX.md](INDEX.md) | This navigation guide | Everyone | 2 min |

#### Development Guides
| Document | Purpose | Audience | Time |
|----------|---------|----------|------|
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Implementation details | Developers | 30 min |
| [docs/API.md](docs/API.md) | API endpoint reference | Developers | 30 min |
| [docs/SETUP.md](docs/SETUP.md) | Environment setup | Developers | 15 min |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines | Contributors | 20 min |

#### Feature Documentation
| Document | Purpose | Audience | Time |
|----------|---------|----------|------|
| [docs/FEATURES.md](docs/FEATURES.md) | Feature descriptions | Users/Developers | 25 min |
| [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md) | Future features | Product/Developers | 30 min |

#### Operations & Deployment
| Document | Purpose | Audience | Time |
|----------|---------|----------|------|
| [DEPLOYMENT.md](DEPLOYMENT.md) | Deployment instructions | DevOps | 25 min |
| [PRODUCTION_READY.md](PRODUCTION_READY.md) | Production checklist | DevOps | 20 min |
| [docker-compose.yml](docker-compose.yml) | Container orchestration | DevOps | 10 min |

#### Project Management
| Document | Purpose | Audience | Time |
|----------|---------|----------|------|
| [CHANGELOG.md](CHANGELOG.md) | Version history | Everyone | 10 min |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | What's been built | Product/Management | 15 min |
| [COMPLETION_REPORT.md](COMPLETION_REPORT.md) | Project completion status | Management | 15 min |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Command cheat sheet | Developers | 5 min |

---

## 🗂️ Code Navigation

### Backend (Python/Flask)

#### Entry Point
- [backend/app.py](backend/app.py) - Flask application main file

#### Core Services
- [backend/services/story_bible_service.py](backend/services/story_bible_service.py) - Story Bible CRUD operations
- [backend/services/ai_editor_service.py](backend/services/ai_editor_service.py) - AI text generation
- [backend/services/visual_planning_service.py](backend/services/visual_planning_service.py) - Planning features
- [backend/services/continuity_tracker_service.py](backend/services/continuity_tracker_service.py) - Consistency checking
- [backend/services/export_service.py](backend/services/export_service.py) - PDF/EPUB export

#### API Routes
- [backend/routes/auth.py](backend/routes/auth.py) - Authentication endpoints
- [backend/routes/story_bible.py](backend/routes/story_bible.py) - Story Bible API
- [backend/routes/editor.py](backend/routes/editor.py) - Editor AI endpoints
- [backend/routes/visual_planning.py](backend/routes/visual_planning.py) - Planning API
- [backend/routes/continuity.py](backend/routes/continuity.py) - Continuity API
- [backend/routes/export_routes.py](backend/routes/export_routes.py) - Export API

#### Data Models
- [backend/models/story_bible.py](backend/models/story_bible.py) - Database schemas

#### Utilities
- [backend/utils/auth.py](backend/utils/auth.py) - JWT authentication
- [backend/utils/rate_limiter.py](backend/utils/rate_limiter.py) - Rate limiting

#### Tests
- [backend/tests/conftest.py](backend/tests/conftest.py) - Pytest fixtures
- [backend/tests/test_story_bible_service.py](backend/tests/test_story_bible_service.py)
- [backend/tests/test_ai_editor_service.py](backend/tests/test_ai_editor_service.py)
- [backend/tests/test_visual_planning_service.py](backend/tests/test_visual_planning_service.py)
- [backend/tests/test_continuity_tracker_service.py](backend/tests/test_continuity_tracker_service.py)
- [backend/tests/test_routes.py](backend/tests/test_routes.py)

### Frontend (React/TypeScript)

#### Entry Point
- [frontend/src/index.tsx](frontend/src/index.tsx) - React application entry
- [frontend/src/App.tsx](frontend/src/App.tsx) - Root component with routing

#### Pages
- [frontend/src/pages/HomePage.tsx](frontend/src/pages/HomePage.tsx) - Landing page
- [frontend/src/pages/ProjectPage.tsx](frontend/src/pages/ProjectPage.tsx) - Project management
- [frontend/src/pages/StoryBiblePage.tsx](frontend/src/pages/StoryBiblePage.tsx) - Story Bible interface
- [frontend/src/pages/EditorPage.tsx](frontend/src/pages/EditorPage.tsx) - AI-powered editor
- [frontend/src/pages/VisualPlanningPage.tsx](frontend/src/pages/VisualPlanningPage.tsx) - Planning boards
- [frontend/src/pages/ContinuityPage.tsx](frontend/src/pages/ContinuityPage.tsx) - Continuity tracker

#### Components by Feature

**Story Bible**
- [frontend/src/components/StoryBible/CharacterCard.tsx](frontend/src/components/StoryBible/CharacterCard.tsx)

**Editor**
- [frontend/src/components/Editor/AIGenerationPanel.tsx](frontend/src/components/Editor/AIGenerationPanel.tsx)

**Visual Planning**
- [frontend/src/components/Planning/Corkboard.tsx](frontend/src/components/Planning/Corkboard.tsx) - Drag-drop board
- [frontend/src/components/Planning/MatrixGrid.tsx](frontend/src/components/Planning/MatrixGrid.tsx) - Grid planner
- [frontend/src/components/Planning/OutlineView.tsx](frontend/src/components/Planning/OutlineView.tsx) - Hierarchical outline

**Continuity**
- [frontend/src/components/Continuity/IssueDashboard.tsx](frontend/src/components/Continuity/IssueDashboard.tsx)

#### API Services
- [frontend/src/services/api.ts](frontend/src/services/api.ts) - Axios HTTP client
- [frontend/src/services/storyBibleService.ts](frontend/src/services/storyBibleService.ts)
- [frontend/src/services/editorService.ts](frontend/src/services/editorService.ts)
- [frontend/src/services/visualPlanningService.ts](frontend/src/services/visualPlanningService.ts)
- [frontend/src/services/continuityService.ts](frontend/src/services/continuityService.ts)

#### Tests
- [frontend/src/__tests__/components/CharacterCard.test.tsx](frontend/src/__tests__/components/CharacterCard.test.tsx)
- [frontend/src/__tests__/components/AIGenerationPanel.test.tsx](frontend/src/__tests__/components/AIGenerationPanel.test.tsx)
- [frontend/src/App.test.tsx](frontend/src/App.test.tsx)

---

## 🔧 Configuration Files

### Backend Configuration
| File | Purpose |
|------|---------|
| [backend/requirements.txt](backend/requirements.txt) | Python dependencies |
| [backend/.env.example](backend/.env.example) | Environment variables template |
| [backend/pytest.ini](backend/pytest.ini) | Test configuration |
| [backend/Dockerfile](backend/Dockerfile) | Backend container definition |

### Frontend Configuration
| File | Purpose |
|------|---------|
| [frontend/package.json](frontend/package.json) | npm dependencies & scripts |
| [frontend/tsconfig.json](frontend/tsconfig.json) | TypeScript compiler config |
| [frontend/jest.config.js](frontend/jest.config.js) | Test configuration |
| [frontend/.env.example](frontend/.env.example) | Environment variables template |
| [frontend/Dockerfile](frontend/Dockerfile) | Frontend container definition |
| [frontend/nginx.conf](frontend/nginx.conf) | Nginx web server config |

### DevOps Configuration
| File | Purpose |
|------|---------|
| [docker-compose.yml](docker-compose.yml) | Multi-container orchestration |
| [.github/workflows/ci.yml](.github/workflows/ci.yml) | CI/CD pipeline |
| [.gitignore](.gitignore) | Git exclusions |

---

## 📖 Common Task Guides

### Setup & Installation

**First Time Setup**
```bash
# See: QUICKSTART.md
git clone <repo>
cd Lit-Rift
npm run install:all
# Configure .env files
npm run dev:backend  # Terminal 1
npm run dev:frontend # Terminal 2
```

**Docker Setup**
```bash
# See: DEPLOYMENT.md
docker-compose up -d
```

### Development Tasks

**Run Backend Tests**
```bash
# See: docs/DEVELOPMENT.md
cd backend
pytest --cov=. --cov-report=html
```

**Run Frontend Tests**
```bash
# See: frontend/README.md
cd frontend
npm test
```

**Build for Production**
```bash
# See: DEPLOYMENT.md
docker-compose build
```

### API Reference

**Story Bible Endpoints**
- See [docs/API.md](docs/API.md) lines 50-180

**Editor AI Endpoints**
- See [docs/API.md](docs/API.md) lines 181-280

**Visual Planning Endpoints**
- See [docs/API.md](docs/API.md) lines 281-380

**Full API Documentation**
- See [docs/API.md](docs/API.md) (42+ endpoints documented)

---

## 🎯 Learning Paths by Role

### Path 1: Product Manager / Stakeholder
1. [README.md](README.md) - What is Lit-Rift?
2. [docs/FEATURES.md](docs/FEATURES.md) - Feature overview
3. [PRODUCTION_READY.md](PRODUCTION_READY.md) - What's complete?
4. [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md) - What's next?
5. [CHANGELOG.md](CHANGELOG.md) - Version history

**Time**: 1 hour

### Path 2: Backend Developer
1. [ARCHITECTURE.md](ARCHITECTURE.md) - System design
2. [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) - Implementation details
3. [docs/API.md](docs/API.md) - API reference
4. [backend/app.py](backend/app.py) - Entry point
5. [backend/services/](backend/services/) - Business logic
6. [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guide

**Time**: 2 hours

### Path 3: Frontend Developer
1. [ARCHITECTURE.md](ARCHITECTURE.md) - System design
2. [docs/API.md](docs/API.md) - API contracts
3. [frontend/src/App.tsx](frontend/src/App.tsx) - Root component
4. [frontend/src/pages/](frontend/src/pages/) - Main pages
5. [frontend/src/services/](frontend/src/services/) - API clients
6. [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guide

**Time**: 2 hours

### Path 4: DevOps Engineer
1. [ARCHITECTURE.md](ARCHITECTURE.md) - Infrastructure overview
2. [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment options
3. [PRODUCTION_READY.md](PRODUCTION_READY.md) - Readiness checklist
4. [docker-compose.yml](docker-compose.yml) - Container setup
5. [.github/workflows/ci.yml](.github/workflows/ci.yml) - CI/CD pipeline
6. [backend/Dockerfile](backend/Dockerfile) & [frontend/Dockerfile](frontend/Dockerfile) - Container definitions

**Time**: 1.5 hours

### Path 5: QA / Tester
1. [docs/FEATURES.md](docs/FEATURES.md) - What to test
2. [docs/API.md](docs/API.md) - API endpoints
3. [backend/tests/](backend/tests/) - Test examples
4. [frontend/src/__tests__/](frontend/src/__tests__/) - Component tests
5. [CONTRIBUTING.md](CONTRIBUTING.md) - Testing guidelines

**Time**: 1.5 hours

### Path 6: Technical Writer
1. [README.md](README.md) - Current overview
2. [MANIFEST.md](MANIFEST.md) - File inventory
3. [docs/](docs/) - Existing documentation
4. [CONTRIBUTING.md](CONTRIBUTING.md) - Documentation standards

**Time**: 2 hours

---

## 🔍 Find Specific Information

### Configuration Questions
- "What environment variables do I need?" → [backend/.env.example](backend/.env.example), [frontend/.env.example](frontend/.env.example)
- "What dependencies are required?" → [backend/requirements.txt](backend/requirements.txt), [frontend/package.json](frontend/package.json)
- "How do I configure Docker?" → [docker-compose.yml](docker-compose.yml), [DEPLOYMENT.md](DEPLOYMENT.md)

### Feature Questions
- "What features are complete?" → [PRODUCTION_READY.md](PRODUCTION_READY.md)
- "What's on the roadmap?" → [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md)
- "How do features work?" → [docs/FEATURES.md](docs/FEATURES.md)
- "What's the API?" → [docs/API.md](docs/API.md)

### Development Questions
- "How do I set up locally?" → [QUICKSTART.md](QUICKSTART.md), [docs/SETUP.md](docs/SETUP.md)
- "Where is the code?" → [MANIFEST.md](MANIFEST.md)
- "How do I contribute?" → [CONTRIBUTING.md](CONTRIBUTING.md)
- "What's the architecture?" → [ARCHITECTURE.md](ARCHITECTURE.md)

### Deployment Questions
- "How do I deploy?" → [DEPLOYMENT.md](DEPLOYMENT.md)
- "Is it production-ready?" → [PRODUCTION_READY.md](PRODUCTION_READY.md)
- "What's the Docker setup?" → [docker-compose.yml](docker-compose.yml)

---

## 📊 Project Status at a Glance

**Current Version**: 1.0.0
**Status**: Production Ready (95% complete)
**Test Coverage**: >90% backend, ~60% frontend (target >80%)
**Documentation**: 4,485 lines across 17 files
**Code**: 7,924 lines (Python + TypeScript)

### Quick Status Links
- **Completion Status**: [PRODUCTION_READY.md](PRODUCTION_READY.md)
- **Version History**: [CHANGELOG.md](CHANGELOG.md)
- **Implementation Summary**: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- **File Inventory**: [MANIFEST.md](MANIFEST.md)

---

## 🆘 Getting Help

### Documentation Issues
- Check [README.md](README.md) first
- See [QUICKSTART.md](QUICKSTART.md) for common setup problems
- Review [CONTRIBUTING.md](CONTRIBUTING.md) for development help

### Technical Issues
- Backend issues: See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
- API questions: See [docs/API.md](docs/API.md)
- Deployment problems: See [DEPLOYMENT.md](DEPLOYMENT.md)

### GitHub Templates
- Bug reports: [.github/ISSUE_TEMPLATE/bug_report.md](.github/ISSUE_TEMPLATE/bug_report.md)
- Feature requests: [.github/ISSUE_TEMPLATE/feature_request.md](.github/ISSUE_TEMPLATE/feature_request.md)
- Pull requests: [.github/PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md)

---

## 📝 Documentation Standards

All documentation in this project follows these principles:
1. **Multiple learning paths** (beginner → expert)
2. **Real examples** from actual implementation
3. **Clear navigation** with this index
4. **Quantified metrics** (not estimates)
5. **Up-to-date** (verified 2025-11-13)

*For more on documentation standards, see [CONTRIBUTING.md](CONTRIBUTING.md)*

---

**Last Updated**: 2025-11-13
**Maintained By**: Development Team
**Next Review**: After v1.1 release

**Quick Navigation**: [Top](#lit-rift-documentation-index--navigation-guide) | [README](README.md) | [MANIFEST](MANIFEST.md) | [API Docs](docs/API.md)
