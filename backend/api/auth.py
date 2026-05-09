from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
from models import db, User
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

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

    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)

    return jsonify({
        'message': 'User registered successfully',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
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

    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)

    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 200

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user_id = get_jwt_identity()
    access_token = create_access_token(identity=current_user_id)
    return jsonify({'access_token': access_token}), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'user': user.to_dict()}), 200

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_id = get_jwt_identity()
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
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'user': user.to_dict()}), 200