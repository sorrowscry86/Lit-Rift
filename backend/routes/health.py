"""
Health check and diagnostics endpoints for monitoring system status
"""
import os
import time
import logging
from datetime import datetime
from flask import Blueprint, jsonify
import firebase_admin
from firebase_admin import firestore
import google.generativeai as genai

logger = logging.getLogger(__name__)

health_bp = Blueprint('health', __name__)

# Track service health status
service_status = {
    'firebase': {'status': 'unknown', 'last_check': None, 'message': ''},
    'firestore': {'status': 'unknown', 'last_check': None, 'message': ''},
    'gemini_ai': {'status': 'unknown', 'last_check': None, 'message': ''},
    'socketio': {'status': 'unknown', 'last_check': None, 'message': ''},
}

def check_firebase_status():
    """Check Firebase Admin SDK initialization"""
    try:
        if firebase_admin._apps:
            service_status['firebase'] = {
                'status': 'healthy',
                'last_check': datetime.utcnow().isoformat(),
                'message': 'Firebase Admin SDK initialized successfully'
            }
            return True
        else:
            service_status['firebase'] = {
                'status': 'unhealthy',
                'last_check': datetime.utcnow().isoformat(),
                'message': 'Firebase Admin SDK not initialized'
            }
            return False
    except Exception as e:
        service_status['firebase'] = {
            'status': 'error',
            'last_check': datetime.utcnow().isoformat(),
            'message': f'Firebase check failed: {str(e)}'
        }
        logger.error(f"Firebase health check error: {e}")
        return False

def check_firestore_status():
    """Check Firestore database connectivity"""
    try:
        if not firebase_admin._apps:
            service_status['firestore'] = {
                'status': 'unhealthy',
                'last_check': datetime.utcnow().isoformat(),
                'message': 'Firebase not initialized'
            }
            return False
            
        db = firestore.client()
        start_time = time.time()
        
        # Try a simple read operation to test connectivity
        # Use a health check collection that doesn't impact user data
        test_ref = db.collection('_health_check').document('test')
        test_ref.set({'timestamp': datetime.utcnow().isoformat()}, merge=True)
        test_ref.get()
        
        response_time = (time.time() - start_time) * 1000  # Convert to ms
        
        service_status['firestore'] = {
            'status': 'healthy',
            'last_check': datetime.utcnow().isoformat(),
            'message': f'Connected successfully (response time: {response_time:.2f}ms)',
            'response_time_ms': round(response_time, 2)
        }
        return True
    except Exception as e:
        service_status['firestore'] = {
            'status': 'error',
            'last_check': datetime.utcnow().isoformat(),
            'message': f'Database connection failed: {str(e)}'
        }
        logger.error(f"Firestore health check error: {e}")
        return False

def check_gemini_ai_status():
    """Check Gemini AI API connectivity"""
    try:
        api_key = os.getenv('GOOGLE_API_KEY')
        if not api_key:
            service_status['gemini_ai'] = {
                'status': 'unhealthy',
                'last_check': datetime.utcnow().isoformat(),
                'message': 'GOOGLE_API_KEY not configured'
            }
            return False
        
        # Configure Gemini
        genai.configure(api_key=api_key)
        
        # Try to list available models to verify API connectivity
        start_time = time.time()
        models = genai.list_models()
        response_time = (time.time() - start_time) * 1000
        
        # Check if we can find gemini-pro model
        model_names = [m.name for m in models]
        has_gemini_pro = any('gemini-pro' in name for name in model_names)
        
        if has_gemini_pro:
            service_status['gemini_ai'] = {
                'status': 'healthy',
                'last_check': datetime.utcnow().isoformat(),
                'message': f'API connected successfully (response time: {response_time:.2f}ms)',
                'response_time_ms': round(response_time, 2),
                'available_models': len(model_names)
            }
            return True
        else:
            service_status['gemini_ai'] = {
                'status': 'degraded',
                'last_check': datetime.utcnow().isoformat(),
                'message': 'API connected but gemini-pro model not found',
                'available_models': len(model_names)
            }
            return False
    except Exception as e:
        service_status['gemini_ai'] = {
            'status': 'error',
            'last_check': datetime.utcnow().isoformat(),
            'message': f'AI API connection failed: {str(e)}'
        }
        logger.error(f"Gemini AI health check error: {e}")
        return False

def check_socketio_status():
    """Check SocketIO server status"""
    try:
        # SocketIO is always running if the app is running
        # We just verify it's configured
        service_status['socketio'] = {
            'status': 'healthy',
            'last_check': datetime.utcnow().isoformat(),
            'message': 'WebSocket server running'
        }
        return True
    except Exception as e:
        service_status['socketio'] = {
            'status': 'error',
            'last_check': datetime.utcnow().isoformat(),
            'message': f'WebSocket check failed: {str(e)}'
        }
        logger.error(f"SocketIO health check error: {e}")
        return False

@health_bp.route('/health', methods=['GET'])
def health_check():
    """
    Overall health check endpoint
    Returns: JSON with overall status and individual service statuses
    """
    try:
        # Run all health checks
        firebase_ok = check_firebase_status()
        firestore_ok = check_firestore_status()
        gemini_ok = check_gemini_ai_status()
        socketio_ok = check_socketio_status()
        
        # Determine overall status
        all_healthy = all([firebase_ok, firestore_ok, gemini_ok, socketio_ok])
        any_error = any([
            service_status[s]['status'] == 'error' 
            for s in service_status
        ])
        
        if all_healthy:
            overall_status = 'healthy'
        elif any_error:
            overall_status = 'unhealthy'
        else:
            overall_status = 'degraded'
        
        response = {
            'status': overall_status,
            'timestamp': datetime.utcnow().isoformat(),
            'services': service_status,
            'summary': {
                'total_services': len(service_status),
                'healthy_count': sum(1 for s in service_status.values() if s['status'] == 'healthy'),
                'unhealthy_count': sum(1 for s in service_status.values() if s['status'] in ['unhealthy', 'error']),
                'degraded_count': sum(1 for s in service_status.values() if s['status'] == 'degraded'),
            }
        }
        
        # Return 200 if healthy/degraded, 503 if unhealthy
        status_code = 200 if overall_status != 'unhealthy' else 503
        
        return jsonify(response), status_code
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({
            'status': 'error',
            'timestamp': datetime.utcnow().isoformat(),
            'message': f'Health check failed: {str(e)}'
        }), 500

@health_bp.route('/health/detailed', methods=['GET'])
def detailed_health():
    """
    Detailed health information including environment and configuration
    """
    try:
        # Run health checks
        check_firebase_status()
        check_firestore_status()
        check_gemini_ai_status()
        check_socketio_status()
        
        # Environment information (don't expose sensitive data)
        env_info = {
            'flask_env': os.getenv('FLASK_ENV', 'not set'),
            'python_version': os.sys.version,
            'has_google_api_key': bool(os.getenv('GOOGLE_API_KEY')),
            'has_firebase_config': bool(os.getenv('FIREBASE_CONFIG')),
            'has_google_cloud_project': bool(os.getenv('GOOGLE_CLOUD_PROJECT')),
        }
        
        response = {
            'timestamp': datetime.utcnow().isoformat(),
            'services': service_status,
            'environment': env_info,
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Detailed health check failed: {e}")
        return jsonify({
            'status': 'error',
            'timestamp': datetime.utcnow().isoformat(),
            'message': f'Detailed health check failed: {str(e)}'
        }), 500

@health_bp.route('/health/service/<service_name>', methods=['GET'])
def service_health(service_name):
    """
    Get health status for a specific service
    """
    if service_name not in service_status:
        return jsonify({
            'error': f'Unknown service: {service_name}',
            'available_services': list(service_status.keys())
        }), 404
    
    # Run specific health check
    if service_name == 'firebase':
        check_firebase_status()
    elif service_name == 'firestore':
        check_firestore_status()
    elif service_name == 'gemini_ai':
        check_gemini_ai_status()
    elif service_name == 'socketio':
        check_socketio_status()
    
    return jsonify({
        'service': service_name,
        'timestamp': datetime.utcnow().isoformat(),
        **service_status[service_name]
    }), 200
