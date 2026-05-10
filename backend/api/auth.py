from flask import Blueprint, request, jsonify, session as flask_session
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
from models import db, User, Session
from datetime import datetime, timedelta
import secrets
import string

auth_bp = Blueprint('auth', __name__)

auth_bp = Blueprint('auth', __name__)

def generate_token(length=32):
    """Generate a secure random token"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def create_user_session(user):
    """Create a new session for the user"""
    # Clean up expired sessions for this user
    expired_sessions = Session.query.filter(
        Session.user_id == user.id,
        Session.refresh_expires_at < datetime.utcnow()
    ).all()
    for exp_session in expired_sessions:
        db.session.delete(exp_session)

    # Create new session
    session_token = generate_token()
    refresh_token = generate_token()
    access_token = create_access_token(identity=user.id)

    expires_at = datetime.utcnow() + timedelta(days=7)  # 7 days
    refresh_expires_at = datetime.utcnow() + timedelta(days=90)  # 90 days

    user_session = Session(
        user_id=user.id,
        session_token=session_token,
        refresh_token=refresh_token,
        access_token=access_token,
        expires_at=expires_at,
        refresh_expires_at=refresh_expires_at
    )

    db.session.add(user_session)
    db.session.commit()

    return user_session

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409

    # Generate unique profile handle
    base_handle = data.get('full_name', '').lower().replace(' ', '.')
    handle = base_handle
    counter = 1
    while User.query.filter_by(profile_handle=handle).first():
        handle = f"{base_handle}{counter}"
        counter += 1

    user = User(
        full_name=data['full_name'],
        email=data['email'],
        profile_handle=handle,
        phone=data.get('phone')
    )
    user.set_password(data['password'])

    db.session.add(user)
    db.session.commit()

    # Create session
    user_session = create_user_session(user)

    # Set session cookie (legacy support)
    flask_session['session_token'] = user_session.session_token

    return jsonify({
        'message': 'User registered successfully',
        'user': user.to_dict(),
        'session_token': user_session.session_token,
        'access_token': user_session.access_token,
        'refresh_token': user_session.refresh_token
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=data['email']).first()

    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401

    if user.status != 'active':
        return jsonify({'error': 'Account is not active'}), 403

    # Update last login
    user.last_login = datetime.utcnow()
    db.session.commit()

    # Create session
    user_session = create_user_session(user)

    # Set session cookie (legacy support)
    flask_session['session_token'] = user_session.session_token

    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'session_token': user_session.session_token,
        'access_token': user_session.access_token,
        'refresh_token': user_session.refresh_token
    }), 200

@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'No session found'}), 401
    
    refresh_token = auth_header.split(' ')[1]

    user_session = Session.query.filter_by(refresh_token=refresh_token).first()
    if not user_session:
        return jsonify({'error': 'Invalid session'}), 401

    if user_session.is_refresh_expired():
        db.session.delete(user_session)
        db.session.commit()
        return jsonify({'error': 'Session expired'}), 401

    # Update session with new tokens
    user_session.access_token = create_access_token(identity=user_session.user_id)
    user_session.expires_at = datetime.utcnow() + timedelta(days=7)
    user_session.update_last_used()
    db.session.commit()

    return jsonify({
        'access_token': user_session.access_token,
        'session_token': user_session.session_token
    }), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity()
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'No session found'}), 401
        
    access_token = auth_header.split(' ')[1]

    user_session = Session.query.filter_by(access_token=access_token).first()
    if not user_session:
        return jsonify({'error': 'Invalid session'}), 401

    if user_session.is_expired():
        db.session.delete(user_session)
        db.session.commit()
        return jsonify({'error': 'Session expired'}), 401

    user_session.update_last_used()

    user = User.query.get(current_user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'user': user.to_dict()}), 200

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_id = get_jwt_identity()
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'No session found'}), 401
        
    access_token = auth_header.split(' ')[1]

    user_session = Session.query.filter_by(access_token=access_token).first()
    if not user_session:
        return jsonify({'error': 'Invalid session'}), 401

    if user_session.is_expired():
        db.session.delete(user_session)
        db.session.commit()
        return jsonify({'error': 'Session expired'}), 401

    user_session.update_last_used()

    user = User.query.get(current_user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()

    # Update allowed fields
    allowed_fields = ['full_name', 'phone']
    for field in allowed_fields:
        if field in data:
            setattr(user, field, data[field])

    # Update profile handle if full_name changed
    if 'full_name' in data:
        base_handle = data['full_name'].lower().replace(' ', '.')
        handle = base_handle
        counter = 1
        while User.query.filter(User.profile_handle == handle, User.id != user.id).first():
            handle = f"{base_handle}{counter}"
            counter += 1
        user.profile_handle = handle

    db.session.commit()

    return jsonify({
        'message': 'Profile updated successfully',
        'user': user.to_dict()
    }), 200

@auth_bp.route('/current-user', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'No session found'}), 401
        
    access_token = auth_header.split(' ')[1]

    user_session = Session.query.filter_by(access_token=access_token).first()
    if not user_session:
        return jsonify({'error': 'Invalid session'}), 401

    if user_session.is_expired():
        db.session.delete(user_session)
        db.session.commit()
        return jsonify({'error': 'Session expired'}), 401

    user_session.update_last_used()

    user = User.query.get(current_user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'user': user.to_dict()}), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        access_token = auth_header.split(' ')[1]
        user_session = Session.query.filter_by(access_token=access_token).first()
        if user_session:
            db.session.delete(user_session)
            db.session.commit()

    flask_session.pop('session_token', None)
    return jsonify({'message': 'Logged out successfully'}), 200