from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import and_
from models import db, Wishlist, Sneaker

wishlist_bp = Blueprint('wishlist', __name__)

@wishlist_bp.route('', methods=['GET'])
@jwt_required()
def get_wishlist():
    current_user_id = get_jwt_identity()

    # Get wishlist items with sneaker details
    wishlist_items = db.session.query(
        Wishlist,
        Sneaker
    ).join(
        Sneaker, Wishlist.sneaker_id == Sneaker.id
    ).filter(
        Wishlist.user_id == current_user_id
    ).order_by(
        Wishlist.priority.desc(),
        Wishlist.added_at.desc()
    ).all()

    items = []
    for wishlist_item, sneaker in wishlist_items:
        item_data = {
            'id': wishlist_item.id,
            'sneaker': sneaker.to_dict(),
            'priority': wishlist_item.priority,
            'added_at': wishlist_item.added_at.isoformat()
        }
        items.append(item_data)

    return jsonify({
        'wishlist': items,
        'count': len(items)
    }), 200

@wishlist_bp.route('/add/<int:sneaker_id>', methods=['POST'])
@jwt_required()
def add_to_wishlist(sneaker_id):
    current_user_id = get_jwt_identity()

    # Check if sneaker exists
    sneaker = Sneaker.query.get(sneaker_id)
    if not sneaker:
        return jsonify({'error': 'Sneaker not found'}), 404

    # Check if already in wishlist
    existing = Wishlist.query.filter_by(
        user_id=current_user_id,
        sneaker_id=sneaker_id
    ).first()

    if existing:
        return jsonify({'error': 'Sneaker already in wishlist'}), 409

    data = request.get_json() or {}
    priority = data.get('priority', 1)

    wishlist_item = Wishlist(
        user_id=current_user_id,
        sneaker_id=sneaker_id,
        priority=priority
    )

    db.session.add(wishlist_item)
    db.session.commit()

    return jsonify({
        'message': 'Sneaker added to wishlist',
        'wishlist_item': wishlist_item.to_dict()
    }), 201

@wishlist_bp.route('/remove/<int:sneaker_id>', methods=['DELETE'])
@jwt_required()
def remove_from_wishlist(sneaker_id):
    current_user_id = get_jwt_identity()

    wishlist_item = Wishlist.query.filter_by(
        user_id=current_user_id,
        sneaker_id=sneaker_id
    ).first()

    if not wishlist_item:
        return jsonify({'error': 'Sneaker not in wishlist'}), 404

    db.session.delete(wishlist_item)
    db.session.commit()

    return jsonify({'message': 'Sneaker removed from wishlist'}), 200

@wishlist_bp.route('/update/<int:sneaker_id>', methods=['PUT'])
@jwt_required()
def update_wishlist_item(sneaker_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()

    if 'priority' not in data:
        return jsonify({'error': 'priority is required'}), 400

    priority = data['priority']
    if not isinstance(priority, int) or priority < 1 or priority > 5:
        return jsonify({'error': 'Priority must be between 1 and 5'}), 400

    wishlist_item = Wishlist.query.filter_by(
        user_id=current_user_id,
        sneaker_id=sneaker_id
    ).first()

    if not wishlist_item:
        return jsonify({'error': 'Sneaker not in wishlist'}), 404

    wishlist_item.priority = priority
    db.session.commit()

    return jsonify({
        'message': 'Wishlist item updated',
        'wishlist_item': wishlist_item.to_dict()
    }), 200

@wishlist_bp.route('/check/<int:sneaker_id>', methods=['GET'])
@jwt_required()
def check_wishlist(sneaker_id):
    current_user_id = get_jwt_identity()

    in_wishlist = Wishlist.query.filter_by(
        user_id=current_user_id,
        sneaker_id=sneaker_id
    ).first() is not None

    return jsonify({'in_wishlist': in_wishlist}), 200

@wishlist_bp.route('/clear', methods=['DELETE'])
@jwt_required()
def clear_wishlist():
    current_user_id = get_jwt_identity()

    Wishlist.query.filter_by(user_id=current_user_id).delete()
    db.session.commit()

    return jsonify({'message': 'Wishlist cleared successfully'}), 200