from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import and_, func
from models import db, User, Inventory, Sneaker, SneakerSize

inventory_bp = Blueprint('inventory', __name__)

@inventory_bp.route('', methods=['GET'])
@jwt_required()
def get_inventory():
    current_user_id = get_jwt_identity()
    user = db.session.get(User, current_user_id)

    # Only admin/seller can access inventory
    if user.role not in ['admin', 'seller']:
        return jsonify({'error': 'Unauthorized'}), 403

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    sneaker_id = request.args.get('sneaker_id', type=int)
    warehouse = request.args.get('warehouse')
    status = request.args.get('status')

    query = db.session.query(
        Inventory,
        Sneaker,
        SneakerSize
    ).join(
        Sneaker, Inventory.sneaker_id == Sneaker.id
    ).join(
        SneakerSize, Inventory.size_id == SneakerSize.id
    )

    if sneaker_id:
        query = query.filter(Inventory.sneaker_id == sneaker_id)

    if warehouse:
        query = query.filter(Inventory.warehouse_location.ilike(f'%{warehouse}%'))

    if status:
        query = query.filter(Inventory.lot_status == status)

    inventory_items = query.order_by(
        Inventory.last_audit_at.desc().nulls_last(),
        Inventory.created_at.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)

    items = []
    for inventory, sneaker, size in inventory_items.items:
        item_data = {
            'inventory': inventory.to_dict(),
            'sneaker': sneaker.to_dict(),
            'size': size.to_dict()
        }
        items.append(item_data)

    return jsonify({
        'inventory': items,
        'pagination': {
            'page': inventory_items.page,
            'per_page': inventory_items.per_page,
            'total': inventory_items.total,
            'pages': inventory_items.pages,
            'has_next': inventory_items.has_next,
            'has_prev': inventory_items.has_prev
        }
    }), 200

@inventory_bp.route('/<int:inventory_id>', methods=['PUT'])
@jwt_required()
def update_inventory(inventory_id):
    current_user_id = get_jwt_identity()
    user = db.session.get(User, current_user_id)

    if user.role not in ['admin', 'seller']:
        return jsonify({'error': 'Unauthorized'}), 403

    inventory = Inventory.query.get(inventory_id)

    if not inventory:
        return jsonify({'error': 'Inventory item not found'}), 404

    data = request.get_json()

    # Update allowed fields
    allowed_fields = [
        'stock_quantity', 'lot_status', 'condition_notes',
        'warehouse_location'
    ]

    for field in allowed_fields:
        if field in data:
            setattr(inventory, field, data[field])

    # Update audit timestamp when quantity changes
    if 'stock_quantity' in data:
        from datetime import datetime
        inventory.last_audit_at = datetime.utcnow()

    db.session.commit()

    return jsonify({
        'message': 'Inventory updated successfully',
        'inventory': inventory.to_dict()
    }), 200

@inventory_bp.route('/add', methods=['POST'])
@jwt_required()
def add_inventory():
    current_user_id = get_jwt_identity()
    user = db.session.get(User, current_user_id)

    if user.role not in ['admin', 'seller']:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()

    required_fields = ['sneaker_id', 'size_id', 'stock_quantity']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400

    sneaker_id = data['sneaker_id']
    size_id = data['size_id']

    # Validate sneaker and size exist
    sneaker = Sneaker.query.get(sneaker_id)
    if not sneaker:
        return jsonify({'error': 'Sneaker not found'}), 404

    size = SneakerSize.query.get(size_id)
    if not size or size.sneaker_id != sneaker_id:
        return jsonify({'error': 'Invalid size for this sneaker'}), 400

    # Check if inventory already exists
    existing_inventory = Inventory.query.filter_by(
        sneaker_id=sneaker_id,
        size_id=size_id
    ).first()

    if existing_inventory:
        # Update existing inventory
        existing_inventory.stock_quantity += data['stock_quantity']
        if 'condition_notes' in data:
            existing_inventory.condition_notes = data['condition_notes']
        if 'warehouse_location' in data:
            existing_inventory.warehouse_location = data['warehouse_location']
        db.session.commit()

        return jsonify({
            'message': 'Inventory updated successfully',
            'inventory': existing_inventory.to_dict()
        }), 200

    # Create new inventory
    inventory = Inventory(
        sneaker_id=sneaker_id,
        size_id=size_id,
        stock_quantity=data['stock_quantity'],
        warehouse_location=data.get('warehouse_location', 'Mumbai Vault'),
        condition_notes=data.get('condition_notes')
    )

    db.session.add(inventory)
    db.session.commit()

    return jsonify({
        'message': 'Inventory added successfully',
        'inventory': inventory.to_dict()
    }), 201

@inventory_bp.route('/<int:inventory_id>', methods=['DELETE'])
@jwt_required()
def remove_inventory(inventory_id):
    current_user_id = get_jwt_identity()
    user = db.session.get(User, current_user_id)

    if user.role not in ['admin', 'seller']:
        return jsonify({'error': 'Unauthorized'}), 403

    inventory = Inventory.query.get(inventory_id)

    if not inventory:
        return jsonify({'error': 'Inventory item not found'}), 404

    # Only allow deletion if stock is 0
    if inventory.stock_quantity > 0:
        return jsonify({
            'error': 'Cannot delete inventory with remaining stock'
        }), 400

    db.session.delete(inventory)
    db.session.commit()

    return jsonify({'message': 'Inventory removed successfully'}), 200

@inventory_bp.route('/low-stock', methods=['GET'])
@jwt_required()
def get_low_stock():
    current_user_id = get_jwt_identity()
    user = db.session.get(User, current_user_id)

    if user.role not in ['admin', 'seller']:
        return jsonify({'error': 'Unauthorized'}), 403

    threshold = request.args.get('threshold', 5, type=int)

    low_stock_items = db.session.query(
        Inventory,
        Sneaker,
        SneakerSize
    ).join(
        Sneaker, Inventory.sneaker_id == Sneaker.id
    ).join(
        SneakerSize, Inventory.size_id == SneakerSize.id
    ).filter(
        Inventory.stock_quantity <= threshold,
        Inventory.stock_quantity > 0,
        Inventory.lot_status == 'available'
    ).order_by(Inventory.stock_quantity.asc()).all()

    items = []
    for inventory, sneaker, size in low_stock_items:
        item_data = {
            'inventory': inventory.to_dict(),
            'sneaker': sneaker.to_dict(),
            'size': size.to_dict()
        }
        items.append(item_data)

    return jsonify({
        'low_stock_items': items,
        'count': len(items),
        'threshold': threshold
    }), 200

@inventory_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_inventory_stats():
    current_user_id = get_jwt_identity()
    user = db.session.get(User, current_user_id)

    if user.role not in ['admin', 'seller']:
        return jsonify({'error': 'Unauthorized'}), 403

    # Total inventory value
    total_value = db.session.query(
        func.sum(Inventory.stock_quantity * Sneaker.current_price_inr)
    ).join(Sneaker).scalar() or 0

    # Total items in stock
    total_items = db.session.query(func.sum(Inventory.stock_quantity)).scalar() or 0

    # Items by status
    status_counts = db.session.query(
        Inventory.lot_status,
        func.sum(Inventory.stock_quantity)
    ).group_by(Inventory.lot_status).all()

    status_stats = {status: count for status, count in status_counts}

    # Warehouse distribution
    warehouse_stats = db.session.query(
        Inventory.warehouse_location,
        func.sum(Inventory.stock_quantity)
    ).group_by(Inventory.warehouse_location).all()

    warehouse_distribution = {location: count for location, count in warehouse_stats}

    return jsonify({
        'total_inventory_value_inr': total_value,
        'total_items_in_stock': total_items,
        'items_by_status': status_stats,
        'warehouse_distribution': warehouse_distribution
    }), 200