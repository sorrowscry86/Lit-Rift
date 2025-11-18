# 📚 Lit-Rift

**AI-Powered Novel Creation Platform**

Lit-Rift is a comprehensive web application designed to help authors create, manage, and develop their novels using AI assistance. From story planning to scene generation, Lit-Rift provides intelligent tools to streamline the creative writing process.

[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG-2.1%20AA-green.svg)](https://www.w3.org/WAI/WCAG21/quickref/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Test Coverage](https://img.shields.io/badge/coverage-75%25-yellowgreen.svg)]()

---

## ✨ Features

### 🎯 Core Functionality
- **Project Management** - Create and manage multiple novel projects
- **AI-Powered Scene Generation** - Generate scenes using advanced AI models
- **Story Bible** - Maintain consistent characters, locations, and lore
- **Visual Planning** - Drag-and-drop scene organization with visual boards
- **Continuity Tracking** - Automatic detection of continuity issues
- **Real-time Editing** - Rich text editor with AI assistance

### 🔐 Authentication & Security
- **Firebase Authentication** - Email/password and Google OAuth
- **Email Verification** - Secure account validation
- **Password Reset** - Self-service password recovery
- **Protected Routes** - Role-based access control
- **JWT Tokens** - Secure API authentication with auto-refresh

### 🎨 User Experience
- **Dark Theme** - Easy on the eyes for long writing sessions
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Loading States** - Skeleton loaders and spinners for smooth UX
- **Error Boundaries** - Graceful error handling with recovery options
- **Accessibility** - WCAG 2.1 AA compliant for screen readers and keyboard navigation

### ⚡ Performance
- **Code Splitting** - Route-based lazy loading (40-60% smaller initial bundle)
- **Web Vitals Tracking** - LCP, FID, CLS monitoring
- **Image Optimization** - Lazy loading with WebP support
- **Bundle Analysis** - Optimized dependencies and tree-shaking

### 🔍 Error Tracking & Monitoring
- **Sentry Integration** - Production error tracking
- **Centralized Logging** - Structured error logging with context
- **User Context** - Errors associated with user sessions
- **Performance Monitoring** - Track slow page loads and bottlenecks

### 🧪 Testing & Quality
- **Unit Tests** - Jest + React Testing Library
- **Component Tests** - 28+ tests covering critical components
- **CI/CD Pipeline** - Automated testing on every PR
- **Linting** - ESLint for code quality

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Material-UI v5** - Component library with dark theme
- **React Router v6** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Firebase SDK** - Authentication

### Backend
- **Flask** - Python web framework
- **Firebase Admin** - Server-side authentication
- **Google Cloud Firestore** - NoSQL database
- **Pydantic** - Request/response validation
- **OpenAI API** - AI-powered generation

### DevOps & Tools
- **GitHub Actions** - CI/CD automation
- **Sentry** - Error tracking
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Webpack** - Bundling with code splitting

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 16+ and npm
- **Python** 3.8+
- **Firebase Account** ([free tier](https://firebase.google.com/))
- **OpenAI API Key** ([get one here](https://platform.openai.com/api-keys))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/sorrowscry86/Lit-Rift.git
cd Lit-Rift
```

2. **Set up Frontend**
```bash
cd frontend
npm install
```

3. **Set up Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Configuration

#### Frontend Environment Variables

Create `frontend/.env`:

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5000

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Sentry (Optional - for error tracking)
# REACT_APP_SENTRY_DSN=https://your_key@sentry.io/your_project_id
# REACT_APP_SENTRY_ENVIRONMENT=development
```

See `frontend/.env.example` for a complete template.

#### Backend Environment Variables

Create `backend/.env`:

```bash
# Flask Configuration
FLASK_ENV=development
SECRET_KEY=your_secret_key_here

# Firebase Admin
FIREBASE_CREDENTIALS_PATH=path/to/serviceAccountKey.json

# Google Cloud
GOOGLE_CLOUD_PROJECT=your_project_id

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# CORS
FRONTEND_URL=http://localhost:3000
```

#### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password and Google)
4. Enable Firestore Database
5. Download service account key (Project Settings → Service Accounts)
6. Place `serviceAccountKey.json` in `backend/`

---

## 💻 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# App opens at http://localhost:3000
```

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
# Creates optimized build in /build folder
```

**Backend:**
```bash
cd backend
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

---

## 🧪 Testing

### Run All Tests
```bash
cd frontend
npm test
```

### Run Tests with Coverage
```bash
npm test -- --coverage --watchAll=false
```

### Run Specific Test File
```bash
npm test -- --testPathPattern="LoadingSpinner"
```

### Linting
```bash
npm run lint
```

See [TESTING_GUIDE.md](frontend/TESTING_GUIDE.md) for detailed testing documentation.

---

## 📁 Project Structure

```
Lit-Rift/
├── frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   │   ├── __tests__/  # Component tests
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── LazyImage.tsx
│   │   │   └── ...
│   │   ├── contexts/        # React contexts (Auth, Theme)
│   │   ├── pages/           # Route components
│   │   │   ├── HomePage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── EditorPage.tsx
│   │   │   └── ...
│   │   ├── services/        # API clients
│   │   ├── utils/           # Utilities and helpers
│   │   ├── styles/          # Global styles
│   │   ├── config/          # Configuration files
│   │   ├── App.tsx          # Main app component
│   │   └── index.tsx        # Entry point
│   ├── .env.example         # Environment template
│   ├── package.json
│   └── tsconfig.json
├── backend/
│   ├── routes/              # API endpoints
│   ├── services/            # Business logic
│   ├── schemas/             # Pydantic validation
│   ├── utils/               # Helper functions
│   ├── app.py               # Flask application
│   └── requirements.txt
├── docs/                    # Additional documentation
├── .github/
│   └── workflows/           # GitHub Actions CI/CD
└── README.md
```

---

## 🎨 Key Components

### Authentication
- `LoginPage` - Email/password and Google OAuth
- `SignupPage` - New user registration
- `PasswordResetPage` - Self-service password reset
- `AuthContext` - Global authentication state
- `ProtectedRoute` - Route guard for authenticated users

### Error Handling
- `ErrorBoundary` - Catches React errors, prevents crashes
- `ErrorFallback` - Beautiful error UI with recovery
- `errorLogger` - Centralized error logging (Sentry integration)

### Loading States
- `LoadingSpinner` - Full-page and inline loading indicators
- `ProjectCardSkeleton` - Skeleton loader for project cards
- Suspense boundaries for lazy-loaded routes

### Accessibility
- `SkipToContent` - Keyboard navigation to main content
- WCAG 2.1 AA compliant
- Full screen reader support
- Keyboard navigation for all features

See [ACCESSIBILITY_GUIDE.md](frontend/ACCESSIBILITY_GUIDE.md) for details.

---

## 🚢 Deployment

### Frontend (Vercel/Netlify)

**Build Command:**
```bash
npm run build
```

**Publish Directory:**
```
build/
```

**Environment Variables:**
Add all `REACT_APP_*` variables from `.env`

### Backend (Heroku/Railway/GCP)

**Procfile:**
```
web: gunicorn app:app
```

**Environment Variables:**
Set all variables from `backend/.env`

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /projects/{projectId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /scenes/{sceneId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 📚 Additional Documentation

- [TESTING_GUIDE.md](frontend/TESTING_GUIDE.md) - Testing best practices and examples
- [ACCESSIBILITY_GUIDE.md](frontend/ACCESSIBILITY_GUIDE.md) - WCAG compliance and a11y features
- [SENTRY_SETUP.md](frontend/SENTRY_SETUP.md) - Error tracking configuration
- [IMAGE_OPTIMIZATION_GUIDE.md](frontend/IMAGE_OPTIMIZATION_GUIDE.md) - Image best practices

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Run linter (`npm run lint`)
6. Commit with descriptive message
7. Push to your branch
8. Open a Pull Request

### Code Standards

- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- WCAG 2.1 AA for accessibility
- Jest for testing (aim for 80%+ coverage)

---

## 🐛 Troubleshooting

### Frontend won't start
- Check Node version: `node --version` (need 16+)
- Delete `node_modules` and `package-lock.json`, then `npm install`
- Check for port conflicts on 3000

### Backend errors
- Ensure virtual environment is activated
- Check Python version: `python --version` (need 3.8+)
- Verify Firebase credentials path
- Check Firestore database is created

### Authentication not working
- Verify Firebase config in `.env`
- Check Firebase Authentication is enabled
- Ensure CORS is configured correctly
- Check browser console for specific errors

### Build fails
- Clear build cache: `npm run build --clean`
- Check for TypeScript errors
- Verify all imports are correct
- Check bundle size (may need optimization)

---

## 📊 Performance Metrics

- **Initial Load**: < 3s on 3G
- **Bundle Size**: 159 KB (gzipped main bundle)
- **Code Split**: 24 chunks for optimal loading
- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices)
- **Web Vitals**:
  - LCP: < 2.5s
  - FID: < 100ms
  - CLS: < 0.1

---

## 🔒 Security

- All API routes require authentication
- Firebase Admin SDK validates tokens server-side
- CORS configured for specific origins
- Environment variables for sensitive data
- Content Security Policy headers
- Input validation with Pydantic
- SQL injection prevention (Firestore NoSQL)
- XSS protection

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) - AI-powered generation
- [Firebase](https://firebase.google.com/) - Authentication and database
- [Material-UI](https://mui.com/) - React component library
- [Sentry](https://sentry.io/) - Error tracking
- All our amazing contributors!

---

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/sorrowscry86/Lit-Rift/issues)
- **Discussions**: [GitHub Discussions](https://github.com/sorrowscry86/Lit-Rift/discussions)

---

## 🗺️ Roadmap

- [ ] Real-time collaboration
- [ ] Export to PDF/EPUB
- [ ] Advanced AI models (GPT-4, Claude)
- [ ] Mobile app (React Native)
- [ ] Offline mode with sync
- [ ] Team workspaces
- [ ] Publishing integration

---

**Built with ❤️ by the Lit-Rift Team**

*Making novel writing accessible and enjoyable for everyone.*
