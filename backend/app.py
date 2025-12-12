import os
import json
import logging
import asyncio
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
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

# Initialize SocketIO for real-time conflict notifications
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

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

# Initialize SQLite database for offline-first sync
try:
    from db.schema import DatabaseSchema
    from db.connection import DatabaseManager
    DatabaseSchema.init_database()
    db_manager = DatabaseManager()
    logger.info("SQLite database initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize SQLite database: {e}")
    db_manager = None

# Initialize device ID for sync attribution
try:
    from utils.device import DeviceManager
    device_id = DeviceManager.get_or_create_device_id()
    device_name = DeviceManager.get_device_name()
    app_version = DeviceManager.get_app_version()
    DeviceManager.save_device_info(device_id, device_name, app_version)

    # Store device info in app config
    app.config['DEVICE_ID'] = device_id
    app.config['DEVICE_NAME'] = device_name
    app.config['APP_VERSION'] = app_version

    logger.info(f"Device initialized: {device_name} ({device_id[:8]}...)")
except Exception as e:
    logger.error(f"Failed to initialize device ID: {e}")
    app.config['DEVICE_ID'] = 'unknown'

# Initialize sync services for background worker
try:
    from services.sync_service import SyncService
    from services.firebase_sync import FirebaseSyncAdapter
    from services.background_sync import BackgroundSyncWorker

    firebase_adapter = FirebaseSyncAdapter(db) if db else None
    sync_service = None  # Will be created per-user

    # Global background workers (one per user)
    background_workers = {}

    logger.info("Sync services initialized")
except Exception as e:
    logger.error(f"Failed to initialize sync services: {e}")
    firebase_adapter = None
    sync_service = None
    background_workers = {}

# Import routes
# We must ensure routes don't crash if imported and db is None
# Most routes import 'app' to get 'db', or expect services to have it.
# We need to make sure services handle db being None.

from routes import story_bible, editor, visual_planning, continuity, inspiration, assets, export_routes, auth, sync, health

# Register blueprints
app.register_blueprint(auth.bp, url_prefix='/api/auth')
app.register_blueprint(story_bible.bp, url_prefix='/api/story-bible')
app.register_blueprint(editor.bp, url_prefix='/api/editor')
app.register_blueprint(visual_planning.bp, url_prefix='/api/planning')
app.register_blueprint(continuity.bp, url_prefix='/api/continuity')
app.register_blueprint(inspiration.bp, url_prefix='/api/inspiration')
app.register_blueprint(assets.bp, url_prefix='/api/assets')
app.register_blueprint(export_routes.bp, url_prefix='/api/export')
app.register_blueprint(sync.bp, url_prefix='/api/sync')
app.register_blueprint(health.health_bp, url_prefix='/api/diagnostics')

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
        'version': app.config.get('APP_VERSION', '1.0.0'),
        'status': 'running',
        'db_status': 'connected' if db else 'mock/disconnected',
        'device_id': app.config.get('DEVICE_ID', 'unknown')[:8] + '...',
        'device_name': app.config.get('DEVICE_NAME', 'Unknown')
    })

@app.route('/api/health')
def health():
    # Check SQLite database
    sqlite_status = False
    try:
        from db.schema import DB_PATH
        import os
        sqlite_status = os.path.exists(DB_PATH)
    except:
        pass

    return jsonify({
        'status': 'healthy',
        'firebase': db is not None,
        'gemini': gemini_api_key is not None,
        'sqlite': sqlite_status,
        'device_id': app.config.get('DEVICE_ID', 'unknown')[:8] + '...',
        'version': app.config.get('APP_VERSION', '1.0.0')
    })

# Background Sync Worker Endpoints

def run_worker_async(worker):
    """Helper to run async worker in a thread"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(worker.run())

@app.route('/api/sync/start-worker', methods=['POST'])
def start_background_worker():
    """Start background sync worker for authenticated user"""
    user_id = request.headers.get('X-User-ID')

    if not user_id:
        return jsonify({'error': 'Missing user_id'}), 400

    if not db_manager or not firebase_adapter:
        return jsonify({'error': 'Sync services not available'}), 503

    if user_id in background_workers:
        return jsonify({'status': 'already running'}), 200

    try:
        # Create sync service for this user
        device_id = app.config.get('DEVICE_ID', 'unknown')
        user_sync_service = SyncService(db_manager, device_id)

        # Define conflict callback
        def on_conflict(conflict):
            """Emit conflict event to frontend via WebSocket"""
            try:
                socketio.emit('sync:conflict', {
                    'conflict_id': conflict['id'],
                    'doc_id': conflict['document_id'],
                    'local_version': conflict['local_version'],
                    'cloud_version': conflict['cloud_version'],
                    'local_device': conflict['local_device_id'],
                    'cloud_device': conflict['cloud_device_id'],
                    'local_timestamp': conflict['local_timestamp'],
                    'cloud_timestamp': conflict['cloud_timestamp']
                }, room=f'user_{user_id}')
            except Exception as e:
                logger.error(f"Failed to emit conflict event: {e}")

        # Create worker
        worker = BackgroundSyncWorker(
            db_manager,
            user_sync_service,
            firebase_adapter,
            user_id,
            device_id,
            on_conflict_callback=on_conflict,
            sync_interval=30
        )

        background_workers[user_id] = worker

        # Start worker in background thread
        import threading
        thread = threading.Thread(target=run_worker_async, args=(worker,))
        thread.daemon = True
        thread.start()

        logger.info(f"Background sync started for user {user_id}")
        return jsonify({'status': 'background sync started'}), 200

    except Exception as e:
        logger.error(f"Failed to start background worker: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/sync/worker-status', methods=['GET'])
def get_worker_status():
    """Get sync worker status for authenticated user"""
    user_id = request.headers.get('X-User-ID')

    if not user_id:
        return jsonify({'error': 'Missing user_id'}), 400

    worker = background_workers.get(user_id)

    if not worker:
        return jsonify({'status': 'not running'}), 200

    return jsonify(worker.get_status()), 200

# WebSocket handlers

@socketio.on('connect')
def handle_connect(auth):
    """Handle WebSocket connection"""
    user_id = auth.get('user_id') if auth else None
    if user_id:
        join_room(f'user_{user_id}')
        logger.info(f"User {user_id} connected to sync WebSocket")
    else:
        logger.warning("WebSocket connection without user_id")

@socketio.on('disconnect')
def handle_disconnect():
    """Handle WebSocket disconnection"""
    logger.info("User disconnected from sync WebSocket")

@socketio.on('join')
def handle_join(data):
    """Handle explicit room join"""
    user_id = data.get('user_id')
    if user_id:
        join_room(f'user_{user_id}')
        logger.info(f"User {user_id} joined room")

@socketio.on('leave')
def handle_leave(data):
    """Handle explicit room leave"""
    user_id = data.get('user_id')
    if user_id:
        leave_room(f'user_{user_id}')
        logger.info(f"User {user_id} left room")

# Graceful shutdown
@app.teardown_appcontext
def shutdown_workers(exception):
    """Stop all background workers on app shutdown"""
    for user_id, worker in background_workers.items():
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(worker.stop())
        except Exception as e:
            logger.error(f"Error stopping worker for {user_id}: {e}")

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug_mode = os.getenv('FLASK_ENV', 'production') == 'development'
    # Use socketio.run instead of app.run for WebSocket support
    socketio.run(app, host='0.0.0.0', port=port, debug=debug_mode, allow_unsafe_werkzeug=True)
