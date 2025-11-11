# Development Roadmap for Lit-Rift

## Executive Summary
**Current Status**: Core features (P1-P2) complete, ~60% overall completion
**Ready For**: User testing with core features
**Needs**: UI completion for P3-P4, real implementations for P5-P7

---

## Phase 1: Complete Core Features (2-3 weeks)

### 1.1 Visual Planning UI Implementation
**Priority**: HIGH | **Impact**: HIGH | **Effort**: Medium

**Tasks:**
- [ ] Create Corkboard component with react-dnd
  - Drag-and-drop note cards
  - Canvas positioning and persistence
  - Scene/character/plot linking
  - Zoom and pan controls

- [ ] Build Matrix/Grid view
  - Interactive grid layout
  - Auto-generated structure from backend
  - Cell editing and navigation
  - Row/column labels (Acts, Threads)

- [ ] Implement Outline editor
  - Hierarchical tree view
  - Collapsible sections
  - Drag to reorder
  - Export to markdown

**Dependencies**: react-dnd, react-beautiful-dnd
**Backend**: ✅ Already complete
**Files to create**:
- `frontend/src/pages/VisualPlanningPage.tsx`
- `frontend/src/components/Planning/Corkboard.tsx`
- `frontend/src/components/Planning/MatrixGrid.tsx`
- `frontend/src/components/Planning/OutlineView.tsx`
- `frontend/src/services/visualPlanningService.ts`

---

### 1.2 Continuity Tracker UI
**Priority**: HIGH | **Impact**: HIGH | **Effort**: Small

**Tasks:**
- [ ] Create ContinuityDashboard component
  - Issue list with severity badges
  - Filter by type (character/timeline/location)
  - Resolve/dismiss actions
  - Direct links to affected scenes

- [ ] Add continuity indicators to Editor
  - Inline warnings for flagged text
  - Tooltip with issue details
  - Quick fix suggestions

- [ ] Build scan progress UI
  - Loading state during scan
  - Progress bar for large projects
  - Summary statistics

**Backend**: ✅ Already complete
**Files to create**:
- `frontend/src/pages/ContinuityPage.tsx`
- `frontend/src/components/Continuity/IssueDashboard.tsx`
- `frontend/src/components/Continuity/IssueCard.tsx`
- `frontend/src/services/continuityService.ts`

---

### 1.3 Story Bible UI Enhancements
**Priority**: MEDIUM | **Impact**: MEDIUM | **Effort**: Small

**Tasks:**
- [ ] Create detail view dialogs
  - Character profile modal with full details
  - Location detail modal
  - Lore entry viewer
  - Plot point timeline

- [ ] Add relationship visualization
  - Character relationship graph
  - Location hierarchy tree
  - Plot point dependencies

- [ ] Implement search and filtering
  - Quick search across all entities
  - Tag-based filtering
  - Recent/favorites

**Files to create**:
- `frontend/src/components/StoryBible/CharacterDetailDialog.tsx`
- `frontend/src/components/StoryBible/LocationDetailDialog.tsx`
- `frontend/src/components/StoryBible/RelationshipGraph.tsx`

---

## Phase 2: Complete Lower Priority Features (2-3 weeks)

### 2.1 Inspiration Module Implementation
**Priority**: MEDIUM | **Impact**: MEDIUM | **Effort**: Medium

**Tasks:**
- [ ] Integrate Gemini Vision API for image analysis
  - Upload image handler
  - Extract themes and ideas
  - Generate story prompts from images

- [ ] Add text-based inspiration
  - Prompt expansion
  - "What if" scenario generation
  - Character arc suggestions

- [ ] Create Inspiration UI
  - Upload/paste input area
  - Generated ideas display
  - Save to Story Bible
  - Regenerate/refine controls

**Backend**: Update `backend/routes/inspiration.py` with real Gemini calls
**Frontend**: Create `frontend/src/pages/InspirationPage.tsx`

---

### 2.2 Asset Generation Implementation
**Priority**: MEDIUM | **Impact**: HIGH | **Effort**: Large

**Tasks:**
- [ ] Integrate image generation API
  - Research: Gemini Imagen vs Stability AI vs DALL-E
  - Character portraits from descriptions
  - Location concept art
  - Cover art generation

- [ ] Implement Text-to-Speech
  - Research: Google Cloud TTS vs ElevenLabs
  - Voice selection interface
  - Scene audio preview
  - Full audiobook compilation

- [ ] Create Assets UI
  - Gallery view of generated images
  - Audio player with waveform
  - Regenerate with tweaks
  - Export and download

**Backend**: Update `backend/routes/assets.py`
**Frontend**: Create `frontend/src/pages/AssetsPage.tsx`
**Dependencies**: Image generation API, TTS service

---

### 2.3 Export System Implementation
**Priority**: MEDIUM | **Impact**: HIGH | **Effort**: Large

**Tasks:**
- [ ] PDF Export
  - Install reportlab or WeasyPrint
  - Template system for formatting
  - Cover page generation
  - Chapter organization
  - Page numbers and TOC

- [ ] EPUB/MOBI Export
  - Use ebooklib (already in requirements.txt)
  - Metadata inclusion
  - Chapter structuring
  - Style sheets

- [ ] Audio Export
  - Stitch scene audio files
  - Chapter markers
  - ID3 tags
  - MP3 compression

- [ ] Create Export UI
  - Format selection
  - Preview before export
  - Progress indicator
  - Download links

**Backend**: Update `backend/routes/export_routes.py`
**Frontend**: Create `frontend/src/pages/ExportPage.tsx`
**Dependencies**: reportlab/WeasyPrint, ebooklib, pydub

---

## Phase 3: Testing & Quality Assurance (1-2 weeks)

### 3.1 Backend Testing
**Priority**: HIGH | **Impact**: HIGH | **Effort**: Large

**Tasks:**
- [ ] Unit tests for services
  - StoryBibleService tests (CRUD, context queries)
  - AIEditorService tests (prompt building, mocking Gemini)
  - VisualPlanningService tests
  - ContinuityTrackerService tests
  - Target: >80% coverage

- [ ] Integration tests for routes
  - Test all 42 API endpoints
  - Success and error cases
  - Authentication (when added)
  - Mock external services

- [ ] Database tests
  - Firestore operations
  - Mock Firestore for testing
  - Data integrity

**Files to create**:
- `backend/tests/test_story_bible_service.py`
- `backend/tests/test_ai_editor_service.py`
- `backend/tests/test_routes.py`
- `backend/tests/conftest.py` (pytest fixtures)

**Run with**: `npm run test:backend`

---

### 3.2 Frontend Testing
**Priority**: HIGH | **Impact**: HIGH | **Effort**: Large

**Tasks:**
- [ ] Component tests
  - All page components
  - All reusable components
  - Form validation
  - User interactions

- [ ] Service tests
  - API service mocking
  - Error handling
  - State management

- [ ] E2E tests (optional)
  - Critical user flows
  - Project creation → Story Bible → Editor → Export
  - Use Cypress or Playwright

**Files to create**:
- `frontend/src/pages/__tests__/HomePage.test.tsx`
- `frontend/src/pages/__tests__/EditorPage.test.tsx`
- `frontend/src/pages/__tests__/StoryBiblePage.test.tsx`
- `frontend/src/components/__tests__/*.test.tsx`

**Run with**: `npm run test:frontend`

---

### 3.3 CI/CD Pipeline
**Priority**: MEDIUM | **Impact**: HIGH | **Effort**: Small

**Tasks:**
- [ ] GitHub Actions workflows
  - `.github/workflows/backend-tests.yml`
  - `.github/workflows/frontend-tests.yml`
  - `.github/workflows/build-and-deploy.yml`

- [ ] Automated testing on PR
  - Run all tests
  - Lint checks
  - TypeScript compilation
  - Build verification

- [ ] Deployment automation
  - Deploy to staging on merge to main
  - Deploy to production on release tag
  - Environment-specific configs

**Files to create**:
- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`

---

## Phase 4: Production Readiness (1-2 weeks)

### 4.1 Authentication & Authorization
**Priority**: HIGH (for production) | **Impact**: CRITICAL | **Effort**: Medium

**Tasks:**
- [ ] Firebase Authentication integration
  - Email/password auth
  - Google OAuth
  - GitHub OAuth

- [ ] User management
  - User profile model
  - Registration flow
  - Login/logout
  - Password reset

- [ ] Authorization
  - Project ownership model
  - Access control middleware
  - Share/collaborate features (future)

**Backend**: New `backend/routes/auth.py`
**Frontend**: New `frontend/src/pages/AuthPage.tsx`

---

### 4.2 Production Infrastructure
**Priority**: HIGH (for production) | **Impact**: CRITICAL | **Effort**: Medium

**Tasks:**
- [ ] Rate limiting
  - Flask-Limiter integration
  - Per-endpoint limits
  - User-based limits
  - API key system (future)

- [ ] Logging & Monitoring
  - Structured logging
  - Error tracking (Sentry)
  - Performance monitoring (New Relic/Datadog)
  - Uptime monitoring

- [ ] Security hardening
  - HTTPS enforcement
  - CORS configuration review
  - Input validation
  - SQL injection prevention (N/A for Firestore)
  - XSS prevention

- [ ] Deployment configuration
  - Docker containers
  - Kubernetes manifests (optional)
  - Environment variable management
  - Secrets management (Google Secret Manager)

**Files to create**:
- `Dockerfile` (backend)
- `Dockerfile` (frontend)
- `docker-compose.yml`
- `kubernetes/` (optional)
- `DEPLOYMENT.md`

---

### 4.3 Performance Optimization
**Priority**: MEDIUM | **Impact**: MEDIUM | **Effort**: Medium

**Tasks:**
- [ ] Backend optimization
  - Database query optimization
  - Caching layer (Redis)
  - Connection pooling
  - Async operations

- [ ] Frontend optimization
  - Code splitting
  - Lazy loading
  - Image optimization
  - Bundle size reduction

- [ ] API optimization
  - Response compression
  - Pagination for large lists
  - Batch operations
  - WebSocket for real-time updates (future)

---

## Phase 5: Polish & User Experience (Ongoing)

### 5.1 UI/UX Improvements
**Priority**: LOW | **Impact**: MEDIUM | **Effort**: Variable

**Tasks:**
- [ ] Keyboard shortcuts
  - Editor shortcuts (Ctrl+S, Ctrl+B, etc.)
  - Navigation shortcuts
  - Quick actions

- [ ] Dark/Light theme toggle
  - Theme preference storage
  - System theme detection

- [ ] Responsive design refinements
  - Mobile-friendly layouts
  - Tablet optimization
  - Touch gestures

- [ ] Accessibility
  - ARIA labels
  - Keyboard navigation
  - Screen reader support
  - Color contrast compliance

- [ ] User preferences
  - Editor font/size
  - Auto-save settings
  - AI generation defaults
  - Export templates

**Frontend**: Settings page and preference storage

---

### 5.2 Advanced Features (Future)
**Priority**: LOW | **Impact**: MEDIUM | **Effort**: Large

**Ideas for later:**
- [ ] Real-time collaboration (multiple users editing)
- [ ] Version control / history for scenes
- [ ] Advanced analytics (writing speed, word count trends)
- [ ] Multi-language support (i18n)
- [ ] Plugin/extension system
- [ ] Mobile apps (React Native)
- [ ] Offline mode (PWA)
- [ ] AI writing style learning
- [ ] Community features (share Story Bibles, templates)

---

## Quick Wins (Can Do Immediately)

These are small improvements that add value with minimal effort:

1. **Add `.env.example` files** ✅
   - Backend: Document all required env vars
   - Frontend: Document all required env vars

2. **Create GitHub issue templates** ✅
   - Bug report template
   - Feature request template
   - Question template

3. **Add pull request template** ✅
   - Checklist for reviewers
   - Testing instructions
   - Breaking changes section

4. **Create CONTRIBUTING.md** ✅
   - How to set up dev environment
   - Code style guidelines
   - Commit message conventions
   - PR process

5. **Add health check endpoint** ✅
   - `/api/health` endpoint
   - Return API status and dependencies

6. **Improve error messages** ✅
   - User-friendly error text
   - Suggestions for fixing
   - Error codes

7. **Add loading states** ✅
   - Skeleton loaders
   - Progress indicators
   - Better UX during AI generation

8. **Add changelog** ✅
   - CHANGELOG.md
   - Document version history
   - Migration guides

---

## Technical Debt to Address

### Code Quality
- [ ] Add JSDoc comments to complex functions
- [ ] Add Python docstrings (partially done)
- [ ] Refactor long functions (>50 lines)
- [ ] Extract magic numbers to constants
- [ ] Type safety improvements

### Architecture
- [ ] Standardize error handling patterns
- [ ] Create shared TypeScript types/interfaces
- [ ] Centralize API error handling
- [ ] Add request/response validation schemas
- [ ] Consider GraphQL for complex queries (future)

### Dependencies
- [ ] Audit for security vulnerabilities
- [ ] Update to latest versions
- [ ] Remove unused dependencies
- [ ] Pin dependency versions

---

## Suggested Improvements by Category

### 🎨 User Experience
1. **Undo/Redo in Editor** - Critical for writers
2. **Auto-save with indicators** - Peace of mind
3. **Drag-and-drop file upload** - For inspiration images
4. **Keyboard shortcuts help** - Discoverability
5. **Tutorial/onboarding flow** - First-time user experience
6. **Empty state improvements** - Guide users to first actions
7. **Confirmation dialogs** - Prevent accidental deletions
8. **Toast notifications** - Action feedback

### 🔒 Security
1. **Rate limiting** - Prevent abuse
2. **API authentication** - Secure endpoints
3. **Input sanitization** - XSS prevention
4. **File upload validation** - Security
5. **CSRF protection** - Form security
6. **Content Security Policy** - XSS defense

### ⚡ Performance
1. **Database indexing** - Faster queries
2. **Image optimization** - Faster loads
3. **Lazy loading** - Faster initial load
4. **Service Worker** - Offline support
5. **Redis caching** - Reduce API calls
6. **CDN for static assets** - Global delivery
7. **Code splitting** - Smaller bundles

### 🛠️ Developer Experience
1. **Hot reloading** - Already working ✅
2. **API documentation** - Already done ✅
3. **Storybook for components** - Visual testing
4. **Pre-commit hooks** - Code quality
5. **Linting rules** - Code consistency
6. **Debug mode** - Better error messages
7. **Seed data script** - Quick testing

### 📊 Analytics & Monitoring
1. **Usage analytics** - Understand user behavior
2. **Error tracking** - Catch bugs in production
3. **Performance monitoring** - Identify bottlenecks
4. **User feedback system** - In-app feedback
5. **Feature flags** - Gradual rollouts
6. **A/B testing** - Optimize UX

---

## Priority Matrix

| Feature | Priority | Impact | Effort | Do Next? |
|---------|----------|--------|--------|----------|
| Visual Planning UI | HIGH | HIGH | Medium | ✅ YES |
| Continuity Tracker UI | HIGH | HIGH | Small | ✅ YES |
| Backend Testing | HIGH | HIGH | Large | ✅ YES |
| Frontend Testing | HIGH | HIGH | Large | Later |
| CI/CD Pipeline | MEDIUM | HIGH | Small | ✅ YES |
| Authentication | HIGH | CRITICAL | Medium | Before Prod |
| Export Implementation | MEDIUM | HIGH | Large | Later |
| Asset Generation | MEDIUM | HIGH | Large | Later |
| Inspiration Module | MEDIUM | MEDIUM | Medium | Later |
| Performance Optimization | MEDIUM | MEDIUM | Medium | Later |

---

## Recommended Next Sprint (2 weeks)

**Sprint Goal**: Complete core UI features and establish testing foundation

**Week 1:**
1. Visual Planning UI (Corkboard + Matrix)
2. Continuity Tracker UI (Dashboard)
3. Quick Wins (templates, health check, .env.example)

**Week 2:**
4. Backend testing setup + first tests
5. CI/CD pipeline setup
6. Story Bible UI enhancements (detail dialogs)

**Definition of Done:**
- All UI components have TypeScript interfaces
- Components are responsive
- Basic error handling in place
- Code reviewed and merged
- Documentation updated
- Demo-able to stakeholders

---

## Long-Term Vision (6-12 months)

1. **Months 1-2**: Complete all P1-P4 features
2. **Months 3-4**: Complete P5-P7 features + authentication
3. **Month 5**: Testing, security, performance
4. **Month 6**: Beta launch, user feedback
5. **Months 7-9**: Iteration based on feedback
6. **Months 10-12**: Advanced features, scaling, monetization

---

## Resources Needed

### APIs & Services
- Google Gemini API (already have)
- Firebase/Firestore (already configured)
- Image Generation API (TBD: Stability AI vs DALL-E)
- Text-to-Speech (TBD: Google Cloud TTS vs ElevenLabs)
- Error tracking (Sentry)
- Monitoring (Datadog or New Relic)

### Tools & Libraries
- `react-dnd` or `react-beautiful-dnd` (drag-and-drop)
- `reportlab` or `WeasyPrint` (PDF generation)
- `ebooklib` (EPUB/MOBI) - already in requirements.txt
- `redis` (caching)
- `flask-limiter` (rate limiting)
- `pytest-cov` (test coverage)
- `cypress` or `playwright` (E2E testing)

### Infrastructure
- Docker/Kubernetes (deployment)
- CDN (static assets)
- Redis server (caching)
- Cloud storage (generated assets)

---

## Metrics for Success

### User Metrics
- Time to first project created: < 2 minutes
- Stories completed per user: > 1
- Daily active users retention: > 40%
- Feature usage (% users using each feature)

### Technical Metrics
- API response time: < 500ms (p95)
- Uptime: > 99.5%
- Test coverage: > 80%
- Build time: < 5 minutes
- Bug escape rate: < 5%

### Business Metrics (Future)
- User acquisition cost
- Conversion rate (free to paid)
- Monthly recurring revenue
- Customer lifetime value
- Churn rate

---

## Conclusion

**Current State**: Strong foundation with core features complete (60%)
**Next Priority**: Complete UI for Visual Planning and Continuity Tracker
**Production Readiness**: Need authentication, testing, and infrastructure work

The codebase is well-architected and ready for rapid feature development. Focus on completing the UI for existing backend features before adding new features. Once P1-P4 are fully functional with UI, the app will be ready for beta testing.

**Estimated time to production-ready**: 6-8 weeks with focused development
**Estimated time to feature-complete**: 3-4 months

---

*Document created: 2025-11-10*
*Last updated: 2025-11-10*
