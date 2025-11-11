"""
Authentication routes
"""
from flask import Blueprint, request, jsonify
from firebase_admin import auth as firebase_auth
from utils.auth import verify_token, require_auth

bp = Blueprint('auth', __name__)


@bp.route('/verify', methods=['POST'])
def verify():
    """
    Verify Firebase ID token

    Body:
        {
            "token": "firebase_id_token"
        }

    Returns:
        {
            "valid": true,
            "uid": "user_id",
            "email": "user@example.com"
        }
    """
    data = request.json
    token = data.get('token')

    if not token:
        return jsonify({'error': 'Token required'}), 400

    try:
        decoded_token = verify_token(token)
        return jsonify({
            'valid': True,
            'uid': decoded_token['uid'],
            'email': decoded_token.get('email'),
            'name': decoded_token.get('name')
        })
    except ValueError as e:
        return jsonify({'valid': False, 'error': str(e)}), 401


@bp.route('/me', methods=['GET'])
@require_auth
def get_current_user(current_user):
    """
    Get current user information

    Requires: Authorization header with Bearer token

    Returns:
        {
            "uid": "user_id",
            "email": "user@example.com",
            "name": "User Name"
        }
    """
    return jsonify({
        'uid': current_user['uid'],
        'email': current_user.get('email'),
        'name': current_user.get('name'),
        'picture': current_user.get('picture')
    })


@bp.route('/refresh', methods=['POST'])
@require_auth
def refresh_token(current_user):
    """
    Refresh user token (validates current token)

    Returns:
        {
            "valid": true,
            "uid": "user_id"
        }
    """
    return jsonify({
        'valid': True,
        'uid': current_user['uid']
    })
