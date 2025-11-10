# Quick Start Guide

Get Lit-Rift up and running in 5 minutes!

## Prerequisites
- Node.js 16+ and Python 3.9+ installed
- (Optional) Google Gemini API key for AI features
- (Optional) Firebase account for data persistence

## Installation

### 1. Clone and Install
```bash
git clone https://github.com/sorrowscry86/Lit-Rift.git
cd Lit-Rift

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Install frontend dependencies
cd ../frontend
npm install --legacy-peer-deps
```

### 2. Quick Start (No API Keys Required)
The app works in "mock mode" without API keys for testing the UI:

**Terminal 1 - Backend:**
```bash
cd backend
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Open http://localhost:3000 in your browser!

### 3. Enable AI Features (Optional)

To enable AI text generation:

1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

2. Create `backend/.env`:
```env
GOOGLE_API_KEY=your_gemini_api_key_here
FLASK_ENV=development
PORT=5000
```

3. Restart the backend server

### 4. Enable Data Persistence (Optional)

To save your work:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Get your service account key
4. Add to `backend/.env`:
```env
FIREBASE_CONFIG={"type":"service_account",...}
```

## Using the App

### Create Your First Project
1. Click "New Project" on the home page
2. Enter title, author, genre, and description
3. Click "Create"

### Build Your Story Bible
1. Open your project
2. Click "Story Bible"
3. Add characters, locations, and lore
4. Define plot points for your story

### Write with AI Assistance
1. Click "Editor"
2. Create a new scene
3. Select characters and location
4. Use the AI Assistant panel to:
   - Generate scenes
   - Create dialogue
   - Rewrite text
   - Continue writing

### Visual Planning
1. Use the API endpoints to create visual layouts
2. Arrange scenes on a corkboard
3. View story structure in matrix format
4. Generate outlines from plot points

### Check Continuity
1. Run continuity checks via API
2. Review flagged inconsistencies
3. Resolve issues in your Story Bible
4. Re-scan to verify fixes

## What Works Without API Keys

✅ Full UI navigation
✅ Project creation and management
✅ Story Bible (Characters, Locations, Lore, Plot)
✅ Scene creation and editing
✅ Manual writing

❌ AI text generation
❌ AI continuity checking
❌ Data persistence (changes lost on refresh)

## What Works With Gemini API Key

✅ Everything above, plus:
✅ AI scene generation
✅ AI dialogue creation
✅ Text rewriting and expansion
✅ AI continuity tracker
❌ Data persistence (still need Firebase)

## What Works With Firebase

✅ Everything above, plus:
✅ Data persistence across sessions
✅ Real-time updates
✅ Cloud backup

## Troubleshooting

**Port already in use?**
```bash
# Backend: Change PORT in .env
# Frontend: Set PORT=3001 in frontend/.env
```

**Build fails?**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Can't connect to backend?**
- Ensure backend is running at http://localhost:5000
- Check browser console for CORS errors
- Verify REACT_APP_API_URL in frontend/.env

## Next Steps

- Read [SETUP.md](docs/SETUP.md) for detailed configuration
- Check [FEATURES.md](docs/FEATURES.md) for feature overview
- Review [API.md](docs/API.md) for endpoint documentation
- See [DEVELOPMENT.md](docs/DEVELOPMENT.md) for architecture details

## Tips for Writers

1. **Start with Story Bible**: Define characters and world before writing
2. **Use AI Sparingly**: Let it help, not replace your voice
3. **Check Continuity Early**: Run checks after major plot points
4. **Visual Planning**: Use corkboard for brainstorming, outline for structure
5. **Save Often**: With Firebase enabled, saves are automatic

## Example Workflow

```
1. Create Project → "My Fantasy Novel"
2. Story Bible:
   - Add characters: Protagonist, Antagonist, Mentor
   - Define locations: Kingdom, Dark Forest, Ancient Temple
   - Document lore: Magic system, History
   - Outline plot: Act 1 → Act 2 → Act 3
3. Editor:
   - Create Scene 1: "The Awakening"
   - Select protagonist character
   - Set location: Kingdom
   - AI Prompt: "The hero discovers their magical powers"
   - Tone: Dramatic, Length: Medium
   - Generate and edit
4. Repeat for remaining scenes
5. Run continuity check
6. Polish and export
```

Enjoy your AI-powered writing journey! 🚀📚✨
