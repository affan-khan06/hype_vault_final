from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import and_
from models import db, User, Cart, CartItem, Sneaker, SneakerSize, Inventory
from datetime import datetime, timedelta

cart_bp = Blueprint('cart', __name__)

@cart_bp.route('', methods=['GET'])
@jwt_required()
def get_cart():
    current_user_id = get_jwt_identity()

    # Get or create active cart
    cart = Cart.query.filter_by(user_id=current_user_id, status='active').first()

    if not cart:
        cart = Cart(user_id=current_user_id)
        db.session.add(cart)
        db.session.commit()

    # Get cart items with sneaker and size details
    items = db.session.query(
        CartItem,
        Sneaker,
        SneakerSize
    ).join(
        Sneaker, CartItem.sneaker_id == Sneaker.id
    ).join(
        SneakerSize, CartItem.size_id == SneakerSize.id
    ).filter(
        CartItem.cart_id == cart.id
    ).all()

    cart_items = []
    total_amount = 0

    for cart_item, sneaker, size in items:
        item_data = {
            'id': cart_item.id,
            'sneaker': sneaker.to_dict(),
            'size': size.to_dict(),
            'quantity': cart_item.quantity,
            'price_inr': cart_item.price_inr,
            'total_price': cart_item.quantity * cart_item.price_inr,
            'added_at': cart_item.added_at.isoformat()
        }
        cart_items.append(item_data)
        total_amount += item_data['total_price']

    return jsonify({
        'cart': cart.to_dict(),
        'items': cart_items,
        'total_amount': total_amount,
        'item_count': len(cart_items)
    }), 200

@cart_bp.route('/add', methods=['POST'])
@jwt_required()
def add_to_cart():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    required_fields = ['sneaker_id', 'size_id', 'quantity']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400

    sneaker_id = data['sneaker_id']
    size_id = data['size_id']
    quantity = data['quantity']

    # Validate sneaker and size exist
    sneaker = Sneaker.query.get(sneaker_id)
    if not sneaker:
        return jsonify({'error': 'Sneaker not found'}), 404

    size = SneakerSize.query.get(size_id)
    if not size or size.sneaker_id != sneaker_id:
        return jsonify({'error': 'Invalid size for this sneaker'}), 400

    # Check inventory availability
    inventory = Inventory.query.filter_by(
        sneaker_id=sneaker_id,
        size_id=size_id,
        lot_status='available'
    ).first()

    if not inventory or inventory.stock_quantity < quantity:
        return jsonify({'error': 'Insufficient stock'}), 400

    # Get or create active cart
    cart = Cart.query.filter_by(user_id=current_user_id, status='active').first()
    if not cart:
        cart = Cart(user_id=current_user_id)
        db.session.add(cart)
        db.session.flush()

    # Check if item already in cart
    existing_item = CartItem.query.filter_by(
        cart_id=cart.id,
        sneaker_id=sneaker_id,
        size_id=size_id
    ).first()

    if existing_item:
        new_quantity = existing_item.quantity + quantity
        if inventory.stock_quantity < new_quantity:
            return jsonify({'error': 'Insufficient stock for requested quantity'}), 400
        existing_item.quantity = new_quantity
    else:
        # Calculate price (sneaker price + size adjustment)
        price = sneaker.current_price_inr + size.price_adjustment

        cart_item = CartItem(
            cart_id=cart.id,
            sneaker_id=sneaker_id,
            size_id=size_id,
            quantity=quantity,
            price_inr=price
        )
        db.session.add(cart_item)

    # Reserve inventory for 30 minutes
    cart.reserved_at = datetime.utcnow()
    db.session.commit()

    return jsonify({'message': 'Item added to cart successfully'}), 200

@cart_bp.route('/update/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_cart_item(item_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()

    if 'quantity' not in data:
        return jsonify({'error': 'quantity is required'}), 400

    quantity = data['quantity']
    if quantity <= 0:
        return jsonify({'error': 'Quantity must be greater than 0'}), 400

    # Find cart item and verify ownership
    cart_item = db.session.query(CartItem).join(Cart).filter(
        CartItem.id == item_id,
        Cart.user_id == current_user_id,
        Cart.status == 'active'
    ).first()

    if not cart_item:
        return jsonify({'error': 'Cart item not found'}), 404

    # Check inventory availability
    inventory = Inventory.query.filter_by(
        sneaker_id=cart_item.sneaker_id,
        size_id=cart_item.size_id,
        lot_status='available'
    ).first()

    if not inventory or inventory.stock_quantity < quantity:
        return jsonify({'error': 'Insufficient stock'}), 400

    cart_item.quantity = quantity
    db.session.commit()

    return jsonify({'message': 'Cart item updated successfully'}), 200

@cart_bp.route('/remove/<int:item_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(item_id):
    current_user_id = get_jwt_identity()

    # Find cart item and verify ownership
    cart_item = db.session.query(CartItem).join(Cart).filter(
        CartItem.id == item_id,
        Cart.user_id == current_user_id,
        Cart.status == 'active'
    ).first()

    if not cart_item:
        return jsonify({'error': 'Cart item not found'}), 404

    db.session.delete(cart_item)
    db.session.commit()

    return jsonify({'message': 'Item removed from cart successfully'}), 200

@cart_bp.route('/clear', methods=['DELETE'])
@jwt_required()
def clear_cart():
    current_user_id = get_jwt_identity()

    cart = Cart.query.filter_by(user_id=current_user_id, status='active').first()

    if cart:
        CartItem.query.filter_by(cart_id=cart.id).delete()
        db.session.commit()

    return jsonify({'message': 'Cart cleared successfully'}), 200

@cart_bp.route('/reserve', methods=['POST'])
@jwt_required()
def reserve_cart():
    current_user_id = get_jwt_identity()

    cart = Cart.query.filter_by(user_id=current_user_id, status='active').first()

    if not cart:
        return jsonify({'error': 'No active cart found'}), 404

    # Check if cart has items
    item_count = CartItem.query.filter_by(cart_id=cart.id).count()
    if item_count == 0:
        return jsonify({'error': 'Cart is empty'}), 400

    # Reserve cart for 30 minutes
    cart.reserved_at = datetime.utcnow()
    db.session.commit()

    return jsonify({
        'message': 'Cart reserved successfully',
        'reservation_expires': (cart.reserved_at + timedelta(minutes=30)).isoformat()
    }), 200