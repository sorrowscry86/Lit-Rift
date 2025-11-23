import os
import json
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore
import google.generativeai as genai

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

def validate_config():
    """Validate required environment variables at startup"""
    required = ['GOOGLE_API_KEY', 'FIREBASE_CONFIG']
    missing = [key for key in required if not os.getenv(key)]

    if missing:
        if os.getenv('FLASK_ENV') != 'development':
             logger.warning(f"Missing required environment variables in production: {', '.join(missing)}")
             logger.warning("Application may not function correctly without these variables.")
        else:
             logger.info(f"Missing env vars in dev: {missing}. Proceeding with limited functionality.")

    return len(missing) == 0

app = Flask(__name__)
CORS(app)

# Validate configuration
validate_config()

# Initialize Firebase
db = None
try:
    if not firebase_admin._apps:
        # Use environment variable or default credentials
        firebase_config = os.getenv('FIREBASE_CONFIG')
        if firebase_config:
            try:
                # Check if it's a file path or JSON string
                if os.path.exists(firebase_config):
                    cred = credentials.Certificate(firebase_config)
                else:
                    cred = credentials.Certificate(json.loads(firebase_config))

                firebase_admin.initialize_app(cred)
                db = firestore.client()
                logger.info("Firebase initialized successfully")
            except Exception as e:
                logger.error(f"Failed to load Firebase config: {e}")
                # Fallback to default

        if not db:
            # Try default credentials or mock
            try:
                # Only try ApplicationDefault if we think we are in GCP
                if os.getenv('GOOGLE_CLOUD_PROJECT'):
                     cred = credentials.ApplicationDefault()
                     firebase_admin.initialize_app(cred)
                     db = firestore.client()
                     logger.info("Firebase initialized with ApplicationDefault")
                else:
                     logger.warning("Skipping ApplicationDefault credentials check (not in GCP context)")
            except Exception as e:
                logger.warning(f"Firebase credentials not configured. Using mock mode. Error: {e}")
                db = None
    else:
        db = firestore.client()
except Exception as e:
    logger.warning(f"Firebase initialization failed. Using mock mode. Error: {e}")
    db = None

# Initialize Gemini AI
gemini_api_key = os.getenv('GOOGLE_API_KEY')
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)
    logger.info("Gemini AI initialized")
else:
    logger.warning("GOOGLE_API_KEY not set. AI features will be limited.")

# Import routes
# We must ensure routes don't crash if imported and db is None
# Most routes import 'app' to get 'db', or expect services to have it.
# We need to make sure services handle db being None.

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

@app.after_request
def set_security_headers(response):
    """Add security headers to all responses"""
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Content-Security-Policy'] = "default-src 'self'"
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response

@app.route('/')
def home():
    return jsonify({
        'message': 'Lit-Rift API',
        'version': '1.0.0',
        'status': 'running',
        'db_status': 'connected' if db else 'mock/disconnected'
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
