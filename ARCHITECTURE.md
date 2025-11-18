# 🏗️ LIT-RIFT TECHNICAL ARCHITECTURE

**Version:** 1.0.0  
**Last Updated:** 2025-11-18  
**Status:** Production Ready ✅

---

## SYSTEM OVERVIEW

Lit-Rift is a modern, full-stack web application built with:
- **Frontend:** React 18 + TypeScript + Material-UI
- **Backend:** Node.js + Express + Firebase
- **Database:** Cloud Firestore (NoSQL)
- **Authentication:** Firebase Auth
- **Hosting:** Static hosting (Vercel/Netlify recommended)

---

## ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT BROWSER                        │
│  ┌────────────────────────────────────────────────────┐ │
│  │         React Application (TypeScript)              │ │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────────┐   │ │
│  │  │  Pages   │  │Components│  │   Contexts     │   │ │
│  │  │  (Lazy)  │  │  (42)    │  │ Auth│Toast    │   │ │
│  │  └──────────┘  └──────────┘  └───────────────┘   │ │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────────┐   │ │
│  │  │   Utils  │  │  Config  │  │     Styles     │   │ │
│  │  │ API│Log  │  │ FB│Sentry│  │  MUI│A11y     │   │ │
│  │  └──────────┘  └──────────┘  └───────────────┘   │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────────┐
│              FIREBASE SERVICES (Google Cloud)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Firebase     │  │  Cloud       │  │  Cloud       │ │
│  │ Auth         │  │  Firestore   │  │  Storage     │ │
│  │ (JWT tokens) │  │  (NoSQL DB)  │  │  (Files)     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│               BACKEND API (Node.js/Express)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Routes     │  │  Middleware  │  │  Services    │ │
│  │ Projects     │  │  Auth        │  │  AI Gen      │ │
│  │ Scenes       │  │  Rate Limit  │  │  Validation  │ │
│  │ AI           │  │  Error       │  │  Database    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Sentry     │  │   OpenAI     │  │  Analytics   │ │
│  │ (Errors)     │  │  (AI Gen)    │  │  (Optional)  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## FRONTEND ARCHITECTURE

### Component Hierarchy

```
App (ToastProvider → AuthProvider → Router)
├── SkipToContent (accessibility)
├── Navbar (with UserMenu)
└── Routes (Lazy loaded)
    ├── HomePage (Protected)
    │   ├── ProjectCard (x N)
    │   ├── ProjectCardSkeleton (loading)
    │   └── CreateProjectDialog
    ├── ProjectEditorPage (Protected, Lazy)
    │   ├── Editor (Rich text)
    │   └── Toolbar
    ├── StoryBiblePage (Protected, Lazy)
    │   ├── CharacterList
    │   └── LocationList
    ├── LoginPage (Public)
    ├── SignupPage (Public)
    └── PasswordResetPage (Public)
```

### State Management

**Context API (Global State):**
```typescript
AuthContext: {
  currentUser: User | null
  login(email, password): Promise<void>
  signup(email, password): Promise<void>
  logout(): Promise<void>
  loginWithGoogle(): Promise<void>
  getIdToken(): Promise<string>
}

ToastContext: {
  showToast(message, severity): void
  showSuccess(message): void
  showError(message): void
  showWarning(message): void
  showInfo(message): void
}
```

**Local State:**
- React useState for component-level state
- React useEffect for side effects
- React useCallback/useMemo for optimization

### Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
API Call (axios)
    ↓
API Client (utils/api.ts)
    ↓
Interceptor (adds auth token)
    ↓
Backend API
    ↓
Response
    ↓
State Update
    ↓
Component Re-render
```

---

## BACKEND ARCHITECTURE

### API Structure

```
Express Server
├── Middleware Stack
│   ├── helmet (security headers)
│   ├── cors (cross-origin)
│   ├── express.json (body parsing)
│   ├── authMiddleware (JWT validation)
│   └── rateLimitMiddleware (60/min)
│
└── Routes
    ├── /api/projects
    │   ├── GET /          (list projects)
    │   ├── POST /         (create project)
    │   ├── GET /:id       (get project)
    │   ├── PUT /:id       (update project)
    │   └── DELETE /:id    (delete project)
    │
    ├── /api/projects/:id/scenes
    │   ├── GET /          (list scenes)
    │   └── POST /         (create scene)
    │
    └── /api/ai/generate
        └── POST /         (AI generation)
```

### Authentication Flow

```
1. User Login
   ↓
2. Firebase Auth (email/password or Google)
   ↓
3. Firebase returns ID token (JWT)
   ↓
4. Frontend stores token
   ↓
5. API requests include: Authorization: Bearer <token>
   ↓
6. Backend validates token with Firebase Admin SDK
   ↓
7. Extract user ID from token
   ↓
8. Proceed with request
```

### Database Schema (Firestore)

```javascript
// Collections
users/
  {userId}/
    - email: string
    - displayName: string
    - createdAt: timestamp

projects/
  {projectId}/
    - userId: string
    - title: string
    - author: string
    - genre: string
    - description: string
    - createdAt: timestamp
    - updatedAt: timestamp

scenes/
  {sceneId}/
    - projectId: string
    - title: string
    - content: string
    - order: number
    - createdAt: timestamp

characters/
  {characterId}/
    - projectId: string
    - name: string
    - description: string
    - traits: array

locations/
  {locationId}/
    - projectId: string
    - name: string
    - description: string
```

---

## SECURITY ARCHITECTURE

### Authentication
- Firebase Auth (industry-standard)
- JWT tokens (auto-refresh)
- Secure HTTP-only cookies (optional)

### Authorization
```javascript
// Firestore Security Rules
match /projects/{projectId} {
  allow read, write: if request.auth.uid == resource.data.userId;
}
```

### Input Validation
```javascript
// Joi validation schemas
const projectSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  author: Joi.string().min(1).max(100).required(),
  genre: Joi.string().min(1).max(50).required(),
  description: Joi.string().max(1000).optional()
});
```

### Rate Limiting
```javascript
// express-rate-limit
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'Too many requests'
});
```

---

## PERFORMANCE ARCHITECTURE

### Code Splitting
```typescript
// Route-based splitting
const ProjectEditorPage = lazy(() => import('./pages/ProjectEditorPage'));
const StoryBiblePage = lazy(() => import('./pages/StoryBiblePage'));

// Result: 27 separate chunks
// Main bundle: 167.86 kB (gzipped)
```

### Lazy Loading
```typescript
// Images
<LazyImage 
  src="/image.jpg"
  loading="lazy"  // Intersection Observer
/>

// Routes
<Suspense fallback={<LoadingSpinner fullPage />}>
  <Route path="/editor/:id" element={<ProjectEditorPage />} />
</Suspense>
```

### Caching Strategy
```
Browser Cache:
- Static assets: 1 year (immutable)
- HTML: no-cache (always fresh)
- API responses: no-cache

CDN Cache:
- JavaScript/CSS: 1 year
- Images: 1 week
- API: no-cache
```

---

## ERROR HANDLING ARCHITECTURE

### Frontend Error Handling

```typescript
// Error Boundary
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>

// API Error Handling
try {
  const response = await api.createProject(data);
} catch (error) {
  logError(error, { component: 'HomePage', action: 'create' });
  showError('Failed to create project');
  captureException(error); // Sentry
}
```

### Backend Error Handling

```javascript
// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});
```

### Error Tracking (Sentry)

```typescript
Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request?.url) {
      event.request.url = event.request.url.replace(
        /([?&]token=)[^&]+/,
        '$1[REDACTED]'
      );
    }
    return event;
  }
});
```

---

## TESTING ARCHITECTURE

### Test Structure

```
Unit Tests:
- Component rendering
- Function logic
- State management

Integration Tests:
- User flows
- API interactions
- Context providers

E2E Tests (Future):
- Complete user journeys
- Cross-browser testing
```

### Test Environment

```javascript
// setupTests.ts
- TextEncoder/TextDecoder polyfills
- ReadableStream polyfill
- Firebase mocks
- Sentry mocks
- IntersectionObserver mock
```

---

## BUILD & DEPLOYMENT ARCHITECTURE

### Build Process

```
1. TypeScript Compilation
   ↓
2. ESLint Validation
   ↓
3. Test Execution
   ↓
4. Webpack Bundle
   ↓
5. Code Splitting (27 chunks)
   ↓
6. Minification
   ↓
7. Gzip Compression
   ↓
8. Build Output (frontend/build/)
```

### CI/CD Pipeline

```yaml
# GitHub Actions
on: [pull_request]

jobs:
  lint-and-test:
    - Install dependencies
    - Run ESLint
    - Run tests with coverage
    - Build production
    - Check bundle size
  
  accessibility-check:
    - Run Lighthouse CI
    - Verify 95% accessibility score
  
  type-check:
    - Run TypeScript compiler
    - Verify no type errors
```

### Deployment Flow

```
1. Code Push
   ↓
2. CI/CD Tests
   ↓
3. Build Production Bundle
   ↓
4. Deploy to CDN/Static Host
   ↓
5. Update DNS (if needed)
   ↓
6. Verify Deployment
   ↓
7. Monitor Errors (Sentry)
```

---

## SCALABILITY CONSIDERATIONS

### Frontend Scaling
- Code splitting reduces initial load
- Lazy loading for on-demand resources
- CDN for global distribution
- Browser caching for repeat visits

### Backend Scaling
- Firebase auto-scales
- Rate limiting prevents abuse
- Firestore indexes for fast queries
- Cloud Functions for serverless compute

### Database Scaling
- NoSQL (Firestore) scales horizontally
- Document-based queries
- Automatic sharding
- Real-time subscriptions

---

## MONITORING & OBSERVABILITY

### Application Monitoring
```
Sentry:
- Error tracking
- Performance monitoring
- User impact assessment
- Release tracking

Web Vitals:
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- FCP (First Contentful Paint)
- TTFB (Time to First Byte)

Lighthouse:
- Performance score
- Accessibility score
- Best practices score
- SEO score
```

---

## TECHNOLOGY DECISIONS

### Why React?
- Component reusability
- Large ecosystem
- TypeScript support
- Performance optimizations

### Why TypeScript?
- Type safety
- Better IDE support
- Fewer runtime errors
- Self-documenting code

### Why Firebase?
- Authentication built-in
- Realtime database
- Automatic scaling
- Generous free tier

### Why Material-UI?
- Consistent design
- Accessibility built-in
- Comprehensive components
- Dark mode support

---

**Architecture Status:** ✅ Production Ready  
**Last Reviewed:** 2025-11-18  
**Next Review:** Monthly or on major changes
