"""
Request validation utilities using Pydantic
"""

from functools import wraps
from flask import request, jsonify
from pydantic import BaseModel, ValidationError
from typing import Type, Callable
import logging


def validate_request(schema: Type[BaseModel]) -> Callable:
    """
    Decorator to validate Flask request JSON against a Pydantic schema

    Usage:
        @bp.route('/endpoint', methods=['POST'])
        @validate_request(MyRequestSchema)
        def my_endpoint():
            validated_data = request.validated_data
            # Use validated_data instead of request.json

    Args:
        schema: Pydantic BaseModel class for validation

    Returns:
        Decorated function that validates request data
    """
    def decorator(f: Callable) -> Callable:
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                # Get JSON data from request
                data = request.get_json()

                if data is None:
                    return jsonify({
                        'error': 'Request body must be valid JSON',
                        'details': 'No JSON data provided'
                    }), 400

                # Validate against schema
                validated_data = schema(**data)

                # Store validated data in request context
                request.validated_data = validated_data

                # Call the original function
                return f(*args, **kwargs)

            except ValidationError as e:
                # Return validation errors
                errors = []
                for error in e.errors():
                    field = ' -> '.join(str(loc) for loc in error['loc'])
                    errors.append({
                        'field': field,
                        'message': error['msg'],
                        'type': error['type']
                    })

                return jsonify({
                    'error': 'Validation failed',
                    'details': errors
                }), 400

            except Exception as e:
                # Log the full exception for debugging
                logging.exception("An unexpected error occurred during request validation.")
                return jsonify({
                    'error': 'An internal error occurred during request validation.',
                    'details': 'Please contact support.'
                }), 500

        return decorated_function
    return decorator
