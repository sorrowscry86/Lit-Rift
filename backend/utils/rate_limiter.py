"""
Rate limiting utilities
"""
from functools import wraps
from flask import request, jsonify
from datetime import datetime, timedelta
from collections import defaultdict
import threading


class RateLimiter:
    """
    Simple in-memory rate limiter

    For production, use Redis-based rate limiting
    """

    def __init__(self):
        self.requests = defaultdict(list)
        self.lock = threading.Lock()

    def is_allowed(self, key: str, limit: int, window: int) -> bool:
        """
        Check if request is allowed

        Args:
            key: Unique identifier (e.g., IP address or user ID)
            limit: Maximum number of requests
            window: Time window in seconds

        Returns:
            bool: True if allowed, False if rate limited
        """
        now = datetime.now()
        window_start = now - timedelta(seconds=window)

        with self.lock:
            # Clean old requests
            self.requests[key] = [
                timestamp for timestamp in self.requests[key]
                if timestamp > window_start
            ]

            # Check limit
            if len(self.requests[key]) >= limit:
                return False

            # Add current request
            self.requests[key].append(now)
            return True

    def get_wait_time(self, key: str, window: int) -> int:
        """Get seconds until next request is allowed"""
        if key not in self.requests or not self.requests[key]:
            return 0

        oldest_request = min(self.requests[key])
        window_end = oldest_request + timedelta(seconds=window)
        wait_time = (window_end - datetime.now()).total_seconds()

        return max(0, int(wait_time))


# Global rate limiter instance
limiter = RateLimiter()


def rate_limit(limit=100, window=60, per='ip'):
    """
    Decorator for rate limiting routes

    Args:
        limit: Maximum number of requests
        window: Time window in seconds
        per: Rate limit key ('ip' or 'user')

    Usage:
        @bp.route('/expensive-operation')
        @rate_limit(limit=10, window=60)  # 10 requests per minute
        def expensive_operation():
            return jsonify({'result': 'success'})
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Determine rate limit key
            if per == 'ip':
                key = request.remote_addr or 'unknown'
            elif per == 'user':
                # Try to get user from auth header
                auth_header = request.headers.get('Authorization')
                if auth_header:
                    try:
                        token = auth_header.split(' ')[1]
                        # In production, verify token and get user ID
                        key = f"user:{token[:20]}"  # Use part of token as key
                    except IndexError:
                        key = request.remote_addr or 'unknown'
                else:
                    key = request.remote_addr or 'unknown'
            else:
                key = per

            # Check rate limit
            if not limiter.is_allowed(key, limit, window):
                wait_time = limiter.get_wait_time(key, window)
                return jsonify({
                    'error': 'Rate limit exceeded',
                    'retry_after': wait_time
                }), 429

            return f(*args, **kwargs)

        return decorated_function
    return decorator


def ai_rate_limit(f):
    """
    Special rate limit for AI endpoints (more restrictive)

    Usage:
        @bp.route('/generate-scene')
        @ai_rate_limit
        def generate_scene():
            return jsonify({'scene': 'generated text'})
    """
    return rate_limit(limit=20, window=60, per='ip')(f)


def auth_rate_limit(f):
    """
    Special rate limit for auth endpoints (prevent brute force)

    Usage:
        @bp.route('/login')
        @auth_rate_limit
        def login():
            return jsonify({'token': 'auth_token'})
    """
    return rate_limit(limit=5, window=60, per='ip')(f)
