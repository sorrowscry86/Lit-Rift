# Lit-Rift Configuration Guide

This guide provides step-by-step instructions for configuring Lit-Rift for development and production use.

## Quick Start (Development Mode)

The project is already set up to run in development mode with mock services. Both frontend and backend will start without requiring API keys.

### Prerequisites

- Node.js 16+ and npm
- Python 3.8+

### Installation & Running

1. **Install Dependencies**
```bash
# Frontend dependencies
cd frontend
npm install --legacy-peer-deps

# Backend dependencies
cd ../backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Start the Application**

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python app.py
# Runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# Opens at http://localhost:3000
```

The app will run in **mock mode** with limited functionality:
- ✅ Full UI navigation
- ✅ Authentication UI (frontend only)
- ✅ Project management UI
- ✅ Story Bible UI
- ❌ Authentication (requires Firebase)
- ❌ Data persistence (requires Firebase)
- ❌ AI features (requires Google API key)

---

## Configuration Files

### Frontend Environment (.env)

Location: `frontend/.env`

A basic `.env` file has been created with mock values. For full functionality, update with your actual Firebase configuration:

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5000

# Firebase Configuration - Get from Firebase Console
REACT_APP_FIREBASE_API_KEY=your_actual_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Sentry (Optional - for error tracking)
# REACT_APP_SENTRY_DSN=https://your_key@sentry.io/your_project
# REACT_APP_SENTRY_ENVIRONMENT=development
```

### Backend Environment (.env)

Location: `backend/.env`

A basic `.env` file has been created. For full functionality, update with your actual credentials:

```bash
# Flask Configuration
FLASK_ENV=development
PORT=5000
SECRET_KEY=your-secret-key-change-in-production

# Google API Key (Gemini AI)
# Get from: https://makersuite.google.com/app/apikey
GOOGLE_API_KEY=your_actual_gemini_api_key

# Firebase Configuration (JSON string)
# Get from Firebase Console > Project Settings > Service Accounts
FIREBASE_CONFIG={"type":"service_account","project_id":"...","private_key":"..."}

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

---

## Firebase Setup (Required for Full Functionality)

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "lit-rift")
4. Follow the setup wizard

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Enable **Email/Password** provider
4. Enable **Google** provider (optional)

### 3. Enable Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Choose "Start in production mode"
4. Select a location
5. Click "Enable"

### 4. Get Firebase Web Config

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps"
3. Click the web icon `</>`
4. Register app (name: "Lit-Rift Web")
5. Copy the configuration values to `frontend/.env`

### 5. Get Service Account Key

1. In **Project Settings**, go to **Service Accounts**
2. Click "Generate new private key"
3. Download the JSON file
4. **Method 1**: Save as `backend/serviceAccountKey.json` (add to .gitignore)
5. **Method 2**: Set as `FIREBASE_CONFIG` environment variable (JSON string)

### 6. Set Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Projects
    match /projects/{projectId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Scenes
    match /scenes/{sceneId} {
      allow read, write: if request.auth != null;
    }
    
    // Characters
    match /characters/{characterId} {
      allow read, write: if request.auth != null;
    }
    
    // Locations
    match /locations/{locationId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Google Gemini API Setup (Required for AI Features)

### 1. Get API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Get API Key"
3. Create a new API key
4. Copy the key

### 2. Configure Backend

Add to `backend/.env`:
```bash
GOOGLE_API_KEY=your_actual_gemini_api_key_here
```

### 3. Test AI Features

After configuration, you can:
- Generate scenes with AI
- Create dialogue
- Rewrite and expand text
- Run continuity checks

---

## Sentry Setup (Optional - Error Tracking)

### 1. Create Sentry Account

1. Go to [Sentry.io](https://sentry.io)
2. Sign up for free account
3. Create a new project (React)

### 2. Get DSN

1. In project settings, copy the DSN
2. Add to `frontend/.env`:

```bash
REACT_APP_SENTRY_DSN=https://your_key@sentry.io/your_project_id
REACT_APP_SENTRY_ENVIRONMENT=development
```

---

## Production Configuration

### Environment Variables for Production

**Frontend (Vercel/Netlify):**
- Set all `REACT_APP_*` variables in hosting platform
- Change `REACT_APP_API_URL` to your backend URL
- Set `REACT_APP_SENTRY_ENVIRONMENT=production`

**Backend (Heroku/Railway/GCP):**
- Set `FLASK_ENV=production`
- Generate strong `SECRET_KEY`: `python -c "import secrets; print(secrets.token_hex(32))"`
- Set `GOOGLE_API_KEY` from secure storage
- Set `FIREBASE_CONFIG` from secure storage
- Set `FRONTEND_URL` to your frontend URL

### Security Checklist

- ✅ Never commit `.env` files to git
- ✅ Never commit Firebase service account keys
- ✅ Use strong `SECRET_KEY` in production
- ✅ Enable HTTPS in production
- ✅ Configure CORS for your domain only
- ✅ Set up Firestore security rules
- ✅ Enable Firebase App Check (optional)

---

## Troubleshooting

### Frontend Won't Start

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm start
```

### Backend Won't Start

```bash
cd backend
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
python app.py
```

### Port Already in Use

**Backend (port 5000):**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in backend/.env
PORT=5001
```

**Frontend (port 3000):**
```bash
# Change port in frontend/.env
PORT=3001
```

### Firebase Authentication Errors

1. Check Firebase config in `frontend/.env`
2. Verify authentication providers are enabled
3. Check browser console for specific errors
4. Ensure CORS is configured correctly

### AI Features Not Working

1. Verify `GOOGLE_API_KEY` is set in `backend/.env`
2. Check API key is valid and not expired
3. Check Google Cloud billing is enabled
4. Review backend logs for specific errors

---

## Testing the Setup

### 1. Backend Health Check

```bash
curl http://localhost:5000/
```

Expected response:
```json
{
  "message": "Lit-Rift API",
  "status": "running",
  "version": "1.0.0",
  "db_status": "mock/disconnected"
}
```

### 2. Frontend Access

Open browser to `http://localhost:3000`

You should see:
- Login page with Lit-Rift branding
- Sign up option
- Google sign-in button

### 3. Full Functionality Test

With Firebase and API keys configured:
1. Sign up for a new account
2. Create a new project
3. Add characters to Story Bible
4. Generate a scene with AI
5. Check continuity

---

## Current Status

Based on the setup completed:

✅ **Working (No Configuration Needed):**
- Frontend development server
- Backend development server
- UI navigation
- Build pipeline
- Testing infrastructure

⚠️ **Requires Configuration:**
- Firebase authentication
- Firestore database
- Google Gemini API
- Sentry error tracking

📝 **Configuration Files Created:**
- `frontend/.env` (with mock values)
- `backend/.env` (with development defaults)

---

## Next Steps

1. **For Development**: The app is ready to run in mock mode
2. **For Testing Auth**: Configure Firebase (30 minutes)
3. **For AI Features**: Get Google Gemini API key (5 minutes)
4. **For Production**: Complete all configurations and follow production checklist

---

## Support

For issues or questions:
- Check [README.md](README.md) for general information
- Review [QUICKSTART.md](QUICKSTART.md) for quick setup
- See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API details
- Open an issue on GitHub

---

**Last Updated:** 2025-11-23
