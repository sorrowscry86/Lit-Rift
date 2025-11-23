"""
Authentication middleware and utilities
"""
from functools import wraps
from flask import request, jsonify
import firebase_admin
from firebase_admin import auth
import os

def verify_token(id_token):
    """
    Verify Firebase ID token

    Args:
        id_token: Firebase ID token from client

    Returns:
        dict: Decoded token with user info

    Raises:
        Exception: If token is invalid
    """
    if os.environ.get('MOCK_AUTH') == 'true':
        return {
            'uid': 'mock-user-id',
            'email': 'mock@example.com',
            'name': 'Mock User'
        }

    try:
        # Check if app is initialized
        if not firebase_admin._apps:
             raise ValueError("Firebase not initialized")

        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        if os.environ.get('FLASK_ENV') == 'development':
             # In dev, if firebase fails, maybe we want to allow it anyway?
             # For now, let's just log and raise
             print(f"Auth verification failed: {e}")
        raise ValueError(f"Invalid token: {str(e)}")


def require_auth(f):
    """
    Decorator to require authentication for routes

    Usage:
        @bp.route('/protected')
        @require_auth
        def protected_route(current_user):
            # current_user contains decoded token
            return jsonify({'user': current_user['uid']})
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return jsonify({'error': 'No authorization header'}), 401

        # Extract token (format: "Bearer <token>")
        try:
            token = auth_header.split(' ')[1]
        except IndexError:
            return jsonify({'error': 'Invalid authorization header format'}), 401

        # Verify token
        try:
            current_user = verify_token(token)
        except ValueError as e:
            return jsonify({'error': str(e)}), 401

        # Pass current_user to the route
        return f(current_user=current_user, *args, **kwargs)

    return decorated_function


def optional_auth(f):
    """
    Decorator for optional authentication

    If token is provided, verify it and pass user info.
    If no token, pass None as current_user.

    Usage:
        @bp.route('/public')
        @optional_auth
        def public_route(current_user):
            if current_user:
                return jsonify({'user': current_user['uid']})
            return jsonify({'user': 'anonymous'})
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')

        current_user = None
        if auth_header:
            try:
                token = auth_header.split(' ')[1]
                current_user = verify_token(token)
            except (IndexError, ValueError):
                # Invalid token, but route is public so continue
                pass

        return f(current_user=current_user, *args, **kwargs)

    return decorated_function


def check_project_access(user_id, project_id, db):
    """
    Check if user has access to a project

    Args:
        user_id: Firebase user ID
        project_id: Project ID
        db: Firestore database instance

    Returns:
        bool: True if user has access, False otherwise
    """
    if not db:
        # If no database, allow access (development/mock mode)
        return True

    # If using mock auth, allow access
    if os.environ.get('MOCK_AUTH') == 'true':
        return True

    try:
        # Get project
        project_ref = db.collection('projects').document(project_id)
        project = project_ref.get()

        if not project.exists:
            return False

        project_data = project.to_dict()

        # Check if user is owner
        if project_data.get('owner_id') == user_id:
            return True

        # Check if user is collaborator
        collaborators = project_data.get('collaborators', [])
        if user_id in collaborators:
            return True

        return False

    except Exception:
        return False


def require_project_access(f):
    """
    Decorator to require project access

    Usage:
        @bp.route('/projects/<project_id>')
        @require_project_access
        def get_project(current_user, project_id):
            # User has access to project
            return jsonify({'project_id': project_id})
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # First check authentication
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return jsonify({'error': 'Authentication required'}), 401

        try:
            token = auth_header.split(' ')[1]
            current_user = verify_token(token)
        except (IndexError, ValueError) as e:
            return jsonify({'error': 'Invalid token'}), 401

        # Get project_id from kwargs or args
        project_id = kwargs.get('project_id') or kwargs.get('id')

        if not project_id:
            return jsonify({'error': 'Project ID required'}), 400

        # Check project access
        # Use deferred import to avoid circular dependency
        from flask import current_app
        # Access db from some global or context if possible, or import from app
        # But app imports this, so it's tricky.
        # Ideally db should be in a separate extension module.
        # For now, we'll try to get it from where it lives.

        try:
             import app as main_app
             db = main_app.db
        except ImportError:
             db = None

        if not check_project_access(current_user['uid'], project_id, db):
            return jsonify({'error': 'Access denied'}), 403

        # Pass current_user to the route
        return f(current_user=current_user, *args, **kwargs)

    return decorated_function
