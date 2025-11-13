# Lit-Rift: Quick Reference Guide

**Command cheat sheet for common development tasks**

---

## 🚀 One-Minute Quick Start

```bash
# Clone and setup
git clone <repo> && cd Lit-Rift
npm run install:all

# Configure
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit .env files with your credentials

# Run (Docker)
docker-compose up -d

# OR Run (Local)
npm run dev:backend   # Terminal 1
npm run dev:frontend  # Terminal 2
```

**Access**: http://localhost:3000

---

## 📦 Installation Commands

### First-Time Setup
```bash
# Install all dependencies
npm run install:all

# Backend only
cd backend && pip install -r requirements.txt

# Frontend only
cd frontend && npm install
```

### Environment Configuration
```bash
# Create environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit with your editor
nano backend/.env
nano frontend/.env
```

---

## 🏃 Running the Application

### Local Development
```bash
# Backend (port 5000)
cd backend
python app.py

# OR with npm script
npm run dev:backend

# Frontend (port 3000)
cd frontend
npm start

# OR with npm script
npm run dev:frontend

# Both together
npm run dev
```

### Docker
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild
docker-compose build
docker-compose up -d
```

---

## 🧪 Testing Commands

### Backend Tests
```bash
# Run all tests
cd backend && pytest

# With coverage
pytest --cov=. --cov-report=html

# Specific test file
pytest tests/test_story_bible_service.py

# With verbose output
pytest -v

# Run specific test
pytest tests/test_ai_editor_service.py::test_generate_scene
```

### Frontend Tests
```bash
# Run all tests
cd frontend && npm test

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch

# Specific test file
npm test -- CharacterCard.test.tsx
```

### Run All Tests
```bash
# From root directory
npm run test:backend
npm run test:frontend
npm test  # Both
```

---

## 🏗️ Build Commands

### Backend Build
```bash
# Docker build
docker build -t lit-rift-backend ./backend

# Production dependencies only
cd backend && pip install -r requirements.txt --no-dev
```

### Frontend Build
```bash
# Production build
cd frontend && npm run build

# Output in: frontend/build/

# Docker build
docker build -t lit-rift-frontend ./frontend

# Build with npm script
npm run build:frontend
```

### Full Build
```bash
# Build all Docker containers
docker-compose build

# Build for production
npm run build
```

---

## 🐛 Development & Debugging

### Backend Debugging
```bash
# Run with Flask debug mode
cd backend
export FLASK_ENV=development
python app.py

# Check syntax
python -m py_compile app.py

# Interactive Python shell
python
>>> from app import app, db
>>> # Test code here
```

### Frontend Debugging
```bash
# TypeScript check
cd frontend && npx tsc --noEmit

# Linting
npm run lint

# Fix lint errors
npm run lint:fix
```

### Check Health
```bash
# Backend health check
curl http://localhost:5000/api/health

# Frontend (should return HTML)
curl http://localhost:3000
```

---

## 🗄️ Database Commands

### Firestore (Cloud)
```bash
# No local commands - managed via Firebase console
# Access: https://console.firebase.google.com
```

### Local Testing (Mock Firestore)
```bash
# Tests use mocked Firestore
cd backend
pytest tests/  # Mocking happens automatically
```

---

## 📝 Code Quality

### Linting
```bash
# Python (if flake8/black installed)
cd backend
flake8 .
black .

# TypeScript/JavaScript
cd frontend
npm run lint
npm run lint:fix
```

### Type Checking
```bash
# TypeScript
cd frontend && npx tsc --noEmit

# Python (if mypy installed)
cd backend && mypy .
```

### Code Formatting
```bash
# Frontend (Prettier)
cd frontend
npm run format
npm run format:check
```

---

## 🔒 Security Commands

### Dependency Audits
```bash
# npm audit
cd frontend && npm audit
npm audit fix

# Python vulnerability scan (if safety installed)
cd backend && safety check
```

### Update Dependencies
```bash
# Frontend
cd frontend && npm update

# Backend
cd backend && pip list --outdated
# Manually update requirements.txt
```

---

## 🚀 Deployment Commands

### Docker Compose Deployment
```bash
# Production deployment
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart services
docker-compose restart

# Update containers
docker-compose pull
docker-compose up -d
```

### Cloud Deployment

**Google Cloud Run**
```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/lit-rift-backend backend/
gcloud builds submit --tag gcr.io/PROJECT_ID/lit-rift-frontend frontend/

# Deploy
gcloud run deploy lit-rift-backend --image gcr.io/PROJECT_ID/lit-rift-backend
gcloud run deploy lit-rift-frontend --image gcr.io/PROJECT_ID/lit-rift-frontend
```

**Heroku**
```bash
# Login
heroku login

# Create apps
heroku create lit-rift-backend
heroku create lit-rift-frontend

# Deploy backend
cd backend && git push heroku main

# Deploy frontend
cd frontend && git push heroku main
```

---

## 📊 Monitoring & Logs

### View Logs
```bash
# Docker logs
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100 backend

# Local backend logs
cd backend && python app.py  # Logs to stdout

# Local frontend logs
cd frontend && npm start  # Logs to stdout
```

### Resource Usage
```bash
# Docker stats
docker stats

# Specific container
docker stats lit-rift-backend

# Disk usage
docker system df
```

---

## 🛠️ Maintenance Commands

### Clean Up
```bash
# Remove node_modules
rm -rf frontend/node_modules
rm -rf node_modules

# Remove Python cache
find . -type d -name "__pycache__" -exec rm -r {} +
find . -type f -name "*.pyc" -delete

# Remove Docker volumes
docker-compose down -v

# Clean Docker system
docker system prune -a
```

### Reset Environment
```bash
# Complete reset
docker-compose down -v
rm -rf frontend/node_modules node_modules
rm -rf frontend/build
npm run install:all
```

---

## 🔑 Environment Variables

### Backend (.env)
```bash
GOOGLE_API_KEY=your_gemini_api_key
FIREBASE_CONFIG={"type":"service_account",...}
FLASK_ENV=development
PORT=5000
```

### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:5000
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

---

## 📈 Common Workflows

### Feature Development
```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes
# ... edit code ...

# 3. Run tests
npm run test:backend
npm run test:frontend

# 4. Commit
git add .
git commit -m "feat: add my feature"

# 5. Push
git push origin feature/my-feature

# 6. Create PR on GitHub
```

### Bug Fix
```bash
# 1. Create branch
git checkout -b fix/bug-description

# 2. Fix bug
# ... edit code ...

# 3. Add test
# ... add regression test ...

# 4. Verify
npm test

# 5. Commit and push
git add .
git commit -m "fix: resolve bug description"
git push origin fix/bug-description
```

### Update Dependencies
```bash
# Frontend
cd frontend
npm outdated
npm update
npm audit fix

# Backend
cd backend
pip list --outdated
# Update requirements.txt manually
pip install -r requirements.txt

# Test
npm test
```

---

## 🎯 API Quick Reference

### Authentication
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'
```

### Story Bible
```bash
# Get characters
curl http://localhost:5000/api/story-bible/characters?project_id=PROJECT_ID

# Create character
curl -X POST http://localhost:5000/api/story-bible/characters \
  -H "Content-Type: application/json" \
  -d '{"project_id":"PROJECT_ID","name":"Hero","role":"Protagonist"}'
```

### AI Editor
```bash
# Generate scene
curl -X POST http://localhost:5000/api/editor/generate-scene \
  -H "Content-Type: application/json" \
  -d '{"project_id":"PROJECT_ID","prompt":"A hero enters the castle"}'
```

**Full API Reference**: See [docs/API.md](docs/API.md)

---

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Docker Issues
```bash
# Remove all containers
docker-compose down

# Remove volumes
docker-compose down -v

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

### Module Not Found
```bash
# Backend
cd backend && pip install -r requirements.txt

# Frontend
cd frontend && npm install

# OR reinstall everything
npm run install:all
```

### Firebase Auth Errors
```bash
# Check .env files
cat backend/.env
cat frontend/.env

# Verify Firebase console settings
# - Authentication enabled
# - Web app registered
# - API keys correct
```

---

## 📚 Documentation Links

- **Full Documentation**: [INDEX.md](INDEX.md)
- **Setup Guide**: [QUICKSTART.md](QUICKSTART.md)
- **API Reference**: [docs/API.md](docs/API.md)
- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **Deployment**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **File Inventory**: [MANIFEST.md](MANIFEST.md)

---

## 🎓 Keyboard Shortcuts (Future)

*Coming in v1.1 - see [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md)*

---

## 📞 Support

**Issues**: [GitHub Issues](https://github.com/sorrowscry86/Lit-Rift/issues)
**Documentation**: [INDEX.md](INDEX.md)
**Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)

---

**Last Updated**: 2025-11-13
**Version**: 1.0.0
**Status**: Production Ready

**Quick Links**: [Top](#lit-rift-quick-reference-guide) | [README](README.md) | [INDEX](INDEX.md)
