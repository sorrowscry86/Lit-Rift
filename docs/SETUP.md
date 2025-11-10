# Setup Guide

## Quick Start

### Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.9 or higher) - [Download](https://www.python.org/)
- **Git** - [Download](https://git-scm.com/)

### Required API Keys
You'll need accounts and API keys for:
1. **Google Cloud / Gemini API**: For AI text generation
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   
2. **Firebase**: For database and authentication
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Firestore Database
   - Generate service account credentials

## Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/sorrowscry86/Lit-Rift.git
cd Lit-Rift
```

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Create a Python virtual environment:
```bash
# On macOS/Linux:
python3 -m venv venv
source venv/bin/activate

# On Windows:
python -m venv venv
venv\Scripts\activate
```

Install Python dependencies:
```bash
pip install -r requirements.txt
```

Create a `.env` file:
```bash
cp .env.example .env
```

Edit the `.env` file with your credentials:
```env
GOOGLE_API_KEY=your_gemini_api_key_here
FIREBASE_CONFIG={"type":"service_account","project_id":"your-project",...}
FLASK_ENV=development
PORT=5000
```

**Note**: For FIREBASE_CONFIG, you can:
- Option 1: Paste the entire JSON from your Firebase service account key as a single-line string
- Option 2: Leave empty and set up Application Default Credentials

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

Install Node.js dependencies:
```bash
npm install
```

Create a `.env` file:
```bash
cp .env.example .env
```

Edit the `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 4. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable Firestore Database:
   - Click "Firestore Database" in the left menu
   - Click "Create database"
   - Start in **production mode** (you can change rules later)
   - Choose a location close to your users

4. Get your Firebase config:
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" section
   - Click the web icon (</>)
   - Copy the config values to your frontend `.env` file

5. Generate service account key:
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save the JSON file securely
   - Copy its contents to your backend `.env` file

### 5. Running the Application

**Start the Backend** (in the backend directory):
```bash
# Make sure your virtual environment is activated
python app.py
```

The backend will start at `http://localhost:5000`

**Start the Frontend** (in a new terminal, in the frontend directory):
```bash
npm start
```

The frontend will start at `http://localhost:3000` and open in your browser.

## Verification

To verify everything is working:

1. Open `http://localhost:3000` in your browser
2. You should see the Lit-Rift home page
3. Try creating a new project
4. Navigate to the Story Bible to add characters
5. Open the Editor and try the AI generation features

## Troubleshooting

### Backend Issues

**Error: "Firebase credentials not configured"**
- This is normal if you haven't set up Firebase yet
- The app will run in mock mode (data won't persist)
- To fix: Add your Firebase credentials to `.env`

**Error: "GOOGLE_API_KEY not set"**
- AI features won't work without this
- Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Add it to your backend `.env` file

**Port already in use**
- Change the PORT in backend `.env`
- Update REACT_APP_API_URL in frontend `.env` to match

### Frontend Issues

**Build errors with npm**
- Try: `npm install --legacy-peer-deps`
- Or: Delete `node_modules` and `package-lock.json`, then run `npm install` again

**Cannot connect to backend**
- Ensure backend is running at `http://localhost:5000`
- Check REACT_APP_API_URL in frontend `.env`
- Check CORS settings in backend `app.py`

### Firebase Issues

**Permission denied errors**
- Check your Firestore security rules
- For development, you can use permissive rules (not recommended for production):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Development Mode

For active development:

1. Backend with auto-reload:
```bash
cd backend
FLASK_ENV=development python app.py
```

2. Frontend with hot-reload:
```bash
cd frontend
npm start
```

## Production Deployment

See the [Deployment Guide](DEPLOYMENT.md) for instructions on deploying to production.

## Next Steps

Once you have the app running:
1. Read the [Development Guide](DEVELOPMENT.md) to understand the architecture
2. Check the [API Documentation](API.md) for endpoint details
3. Explore the code in `backend/` and `frontend/src/`

## Getting Help

If you encounter issues:
1. Check this setup guide first
2. Review the [Development Guide](DEVELOPMENT.md)
3. Check the repository issues on GitHub
4. Create a new issue with:
   - What you were trying to do
   - The error message
   - Your environment (OS, Node version, Python version)

## Optional Enhancements

### Add a mock data script
Create sample projects and characters for testing:
```bash
cd backend
python scripts/seed_data.py
```

### Enable Firebase emulator
For local development without cloud Firebase:
```bash
npm install -g firebase-tools
firebase init emulators
firebase emulators:start
```

## Security Notes

- Never commit `.env` files to version control
- Keep your API keys secret
- Use Firebase security rules in production
- Enable authentication before deploying
- Use environment variables for all sensitive data

Enjoy building your novel with Lit-Rift! 🚀📚✨
