# ⚡ LIT-RIFT QUICK REFERENCE

## One-Liner Commands

```bash
# Start development
npm install && npm start

# Run tests
npm test

# Build for production
npm run build

# Deploy to production
cd scripts && ./deploy.sh production

# Rollback deployment
./rollback.sh production [timestamp]

# Create backup
./create-backup.sh production
```

## Environment Variables

```bash
# Firebase
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=

# Backend API
REACT_APP_API_URL=http://localhost:5000/api

# Error Tracking (optional)
REACT_APP_SENTRY_DSN=
```

## Common Tasks

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Start dev server | `npm start` |
| Run all tests | `npm test -- --watchAll=false` |
| Build production | `npm run build` |
| Lint code | `npm run lint` |
| Type check | `npx tsc --noEmit` |
| Serve build locally | `npx serve -s build` |

## File Locations

```
Configuration:   frontend/.env
API Client:      frontend/src/utils/api.ts
Auth Context:    frontend/src/contexts/AuthContext.tsx
Toast Context:   frontend/src/contexts/ToastContext.tsx
Error Logging:   frontend/src/utils/errorLogger.ts
Deploy Script:   scripts/deploy.sh
```

## Test Coverage

```
Authentication: 57/64 tests (89%)
Components:     28/28 tests (100%)
Total:          85/92 tests (92%)
```

## Build Sizes

```
Main bundle:    167.86 kB (gzipped)
Total chunks:   27
CSS:            1.19 kB
```

---
**Quick Start:** `npm install && npm start`  
**Deploy:** `cd scripts && ./deploy.sh production`  
**Rollback:** `./rollback.sh production [timestamp]`
