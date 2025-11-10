# Lit-Rift: AI-Powered Novel Creation App

Web-based novel creation app with React/Python, Firestore DB, and Gemini AI integration.

## Features

### Core System
- **Story Bible/Codex**: Central database tracking all story elements (characters, locations, lore, plot). Single source of truth for AI context.

### Priority Features
1. **Context-Aware Editor**: AI text generation (scenes, dialogue, descriptions) pulls directly from Story Bible for continuity. Custom prompts, tone control, rewriting assistance.

2. **Visual Planning**: Canvas with multiple views: Corkboard (free-form), Matrix/Grid (structured), standard outlines. All elements link to Story Bible.

3. **AI Continuity Tracker**: Passive agent scans manuscript and Story Bible, flags inconsistencies non-intrusively (character details, location logic, timeline errors).

4. **Inspiration Spark**: Input: image/text/audio. Output: AI-generated ideas, prompts, "what if" scenarios for writer's block.

5. **Asset Generation**: Images (HD/anime) from Story Bible descriptions. Text-to-speech audiobook with voice options/cloning.

6. **Multi-Format Export**: PDF, print, .epub, .mobi, audio.

## Architecture

- **Frontend**: React with modern UI components
- **Backend**: Python with Flask/FastAPI
- **Database**: Firestore (real-time, document-based)
- **AI**: Modular Gemini API integration (text, image, audio)

## Project Structure

```
lit-rift/
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── contexts/    # React contexts
│   │   └── utils/       # Utility functions
│   └── public/
├── backend/            # Python backend
│   ├── app.py          # Main application
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── models/         # Data models
│   └── utils/          # Utility functions
└── docs/              # Documentation
```

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- Python (v3.9+)
- Firebase account with Firestore enabled
- Google Cloud account with Gemini API access

### Environment Variables

Create `.env` files in both frontend and backend directories:

**Backend `.env`:**
```
GOOGLE_API_KEY=your_gemini_api_key
FIREBASE_CONFIG=your_firebase_config_json
FLASK_ENV=development
PORT=5000
```

**Frontend `.env`:**
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_FIREBASE_CONFIG=your_firebase_config
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sorrowscry86/Lit-Rift.git
cd Lit-Rift
```

2. Install dependencies:
```bash
npm run install:all
```

### Running the Application

1. Start the backend server:
```bash
npm run dev:backend
```

2. In a new terminal, start the frontend:
```bash
npm run dev:frontend
```

3. Open your browser to `http://localhost:3000`

## Development Priority

1. Story Bible → Context-Aware Editor
2. Visual Planning
3. Continuity Tracker
4. Inspiration/Assets
5. Export

## UX Philosophy

Seamless, distraction-free, modular. The app acts as a supportive co-writer, not a complex tool. The Story Bible ↔ AI text generation link is critical for maintaining narrative consistency.

## License

See LICENSE file for details.
