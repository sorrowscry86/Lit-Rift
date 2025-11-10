# Changelog

All notable changes to the Lit-Rift project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive development roadmap (DEVELOPMENT_ROADMAP.md)
- Contributing guidelines (CONTRIBUTING.md)
- GitHub issue templates (bug report, feature request)
- GitHub pull request template
- CHANGELOG.md for tracking version history

## [1.0.0] - 2025-11-10

### Added

#### Core Infrastructure
- Flask 3.0 backend with CORS support
- React 18 frontend with TypeScript
- Material-UI v5 design system
- Firebase Firestore integration
- Google Gemini AI integration
- Environment-based configuration
- Health check endpoint (`/api/health`)

#### Story Bible System (Priority 1 - Complete)
- Data models for Characters, Locations, Lore, Plot Points, Scenes, Projects
- Full CRUD operations for all Story Bible entities
- Relationship tracking between entities
- Context querying for AI generation
- Story Bible UI with tabbed interface
- Character cards with traits and details
- Location management
- Lore database
- Plot point tracking

#### AI-Powered Editor (Priority 2 - Complete)
- Context-aware scene generation from Story Bible
- Dialogue generation with character consistency
- Text rewriting and expansion
- Tone control (dramatic, humorous, suspenseful, etc.)
- Length control (short, medium, long)
- Text summarization
- Continuation assistance
- Three-panel editor layout (Scenes, Editor, AI Assistant)
- Real-time word counting
- Scene management

#### Visual Planning Service (Priority 3 - Backend Complete)
- Corkboard view backend with positioning
- Matrix/grid view with auto-generation
- Outline view with hierarchical structure
- Scene-to-plot-point mapping
- Layout persistence
- API endpoints for all planning features
- Note: UI implementation pending

#### Continuity Tracker (Priority 4 - Backend Complete)
- AI-powered consistency checking
- Character detail verification
- Timeline logic validation
- Location description checking
- Issue severity classification
- Resolution tracking
- API endpoints for continuity checking
- Note: Dashboard UI pending

#### API Endpoints
- 42 RESTful API endpoints across 7 route modules
- `/api/story-bible/*` - Story Bible CRUD (15 endpoints)
- `/api/editor/*` - AI text generation (6 endpoints)
- `/api/planning/*` - Visual planning (8 endpoints)
- `/api/continuity/*` - Continuity checking (3 endpoints)
- `/api/inspiration/*` - Inspiration generation (2 endpoints, stub)
- `/api/assets/*` - Asset generation (3 endpoints, stub)
- `/api/export/*` - Multi-format export (5 endpoints, stub)

#### Documentation
- Comprehensive README with quick start
- QUICKSTART.md for new users
- ARCHITECTURE.md with system diagrams
- SETUP.md with detailed configuration
- DEVELOPMENT.md with implementation details
- FEATURES.md with feature specifications
- API.md with endpoint documentation
- IMPLEMENTATION_SUMMARY.md tracking progress

### Backend Architecture
- Clean service layer architecture
- Type-safe data models with dataclasses
- Modular route blueprints
- Graceful degradation (works without API keys)
- Error handling with fallbacks
- Firestore database integration
- Gemini AI integration

### Frontend Architecture
- React functional components with hooks
- TypeScript with strict type checking
- Component-based architecture
- API service layer
- Responsive Material-UI design
- Dark theme optimized for writing
- React Router navigation

### Developer Experience
- Zero TypeScript compilation errors
- Zero ESLint warnings
- Hot reloading for development
- Environment variable configuration
- npm workspace setup
- Python virtual environment support

### Security
- No hardcoded credentials
- Environment-based secrets
- Debug mode controlled by environment
- CORS configuration
- `.gitignore` properly configured
- No known vulnerabilities (CodeQL verified)

## [0.1.0] - Initial Planning

### Added
- Project initialization
- Repository setup
- Initial planning documents
- Technology stack selection

---

## Release Notes

### Version 1.0.0 - Initial Release

**Status**: Core features complete, ready for user testing

**What Works:**
- ✅ Full Story Bible system (Characters, Locations, Lore, Plot Points)
- ✅ AI-powered scene generation with context awareness
- ✅ AI dialogue generation
- ✅ Text editing and rewriting
- ✅ Visual planning backend (APIs ready)
- ✅ Continuity tracking backend (APIs ready)
- ✅ Project management
- ✅ Scene organization

**What Needs Work:**
- ⚠️ Visual Planning UI (drag-and-drop interface)
- ⚠️ Continuity Tracker UI (issue dashboard)
- ⚠️ Inspiration module (real AI integration)
- ⚠️ Asset generation (image/audio APIs)
- ⚠️ Export system (PDF/EPUB/MOBI/Audio)
- ⚠️ User authentication
- ⚠️ Test coverage
- ⚠️ CI/CD pipeline

**Breaking Changes**: None (initial release)

**Migration Guide**: N/A (initial release)

**Known Issues**:
- Frontend works without Firebase (changes not persisted)
- AI features require Gemini API key
- No user authentication yet
- Export endpoints are stubs

**Upgrade Path**: N/A (initial release)

---

## Version History

- **1.0.0** (2025-11-10) - Initial release with core features
- **0.1.0** (2025-11-10) - Project planning and initialization

---

## Upcoming Releases

### Version 1.1.0 (Planned)
- Visual Planning UI implementation
- Continuity Tracker dashboard
- Story Bible detail views
- UI enhancements

### Version 1.2.0 (Planned)
- Inspiration module with Gemini Vision
- Asset generation (images and audio)
- Export system (PDF, EPUB, MOBI, Audio)

### Version 2.0.0 (Planned)
- User authentication
- Multi-user support
- Real-time collaboration
- Advanced features

---

## Links

- [GitHub Repository](https://github.com/sorrowscry86/Lit-Rift)
- [Documentation](./docs/)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Development Roadmap](./DEVELOPMENT_ROADMAP.md)

---

**Note**: For detailed technical changes, see the [commit history](https://github.com/sorrowscry86/Lit-Rift/commits/main).
