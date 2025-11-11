import os
import json
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore
import google.generativeai as genai

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize Firebase
db = None
try:
    if not firebase_admin._apps:
        # Use environment variable or default credentials
        firebase_config = os.getenv('FIREBASE_CONFIG')
        if firebase_config:
            cred = credentials.Certificate(json.loads(firebase_config))
            firebase_admin.initialize_app(cred)
            db = firestore.client()
        else:
            # For development, try default credentials
            try:
                cred = credentials.ApplicationDefault()
                firebase_admin.initialize_app(cred)
                db = firestore.client()
            except Exception as e:
                print(f"Warning: Firebase credentials not configured. Using mock mode. Error: {e}")
                db = None
    else:
        db = firestore.client()
except Exception as e:
    print(f"Warning: Firebase initialization failed. Using mock mode. Error: {e}")
    db = None

# Initialize Gemini AI
gemini_api_key = os.getenv('GOOGLE_API_KEY')
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)
else:
    print("Warning: GOOGLE_API_KEY not set. AI features will be limited.")

# Import routes
from routes import story_bible, editor, visual_planning, continuity, inspiration, assets, export_routes, auth

# Register blueprints
app.register_blueprint(auth.bp, url_prefix='/api/auth')
app.register_blueprint(story_bible.bp, url_prefix='/api/story-bible')
app.register_blueprint(editor.bp, url_prefix='/api/editor')
app.register_blueprint(visual_planning.bp, url_prefix='/api/planning')
app.register_blueprint(continuity.bp, url_prefix='/api/continuity')
app.register_blueprint(inspiration.bp, url_prefix='/api/inspiration')
app.register_blueprint(assets.bp, url_prefix='/api/assets')
app.register_blueprint(export_routes.bp, url_prefix='/api/export')

@app.route('/')
def home():
    return jsonify({
        'message': 'Lit-Rift API',
        'version': '1.0.0',
        'status': 'running'
    })

@app.route('/api/health')
def health():
    return jsonify({
        'status': 'healthy',
        'firebase': db is not None,
        'gemini': gemini_api_key is not None
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug_mode = os.getenv('FLASK_ENV', 'production') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
