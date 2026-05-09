from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_, and_
from models import db, Sneaker, SneakerSize, Inventory, PriceHistory
from datetime import datetime

sneakers_bp = Blueprint('sneakers', __name__)

@sneakers_bp.route('', methods=['GET'])
def get_sneakers():
    # Query parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '')
    brand = request.args.get('brand', '')
    category = request.args.get('category', '')
    min_price = request.args.get('min_price', type=int)
    max_price = request.args.get('max_price', type=int)
    condition = request.args.get('condition', '')
    sort_by = request.args.get('sort_by', 'created_at')
    sort_order = request.args.get('sort_order', 'desc')

    # Build query
    query = Sneaker.query

    # Apply filters
    if search:
        query = query.filter(
            or_(
                Sneaker.name.ilike(f'%{search}%'),
                Sneaker.brand.ilike(f'%{search}%'),
                Sneaker.model.ilike(f'%{search}%'),
                Sneaker.colorway.ilike(f'%{search}%')
            )
        )

    if brand:
        query = query.filter(Sneaker.brand.ilike(f'%{brand}%'))

    if category:
        query = query.filter(Sneaker.category == category)

    if min_price is not None:
        query = query.filter(Sneaker.current_price_inr >= min_price)

    if max_price is not None:
        query = query.filter(Sneaker.current_price_inr <= max_price)

    if condition:
        query = query.filter(Sneaker.condition == condition)

    # Apply sorting
    if sort_by == 'price':
        sort_column = Sneaker.current_price_inr
    elif sort_by == 'name':
        sort_column = Sneaker.name
    elif sort_by == 'brand':
        sort_column = Sneaker.brand
    elif sort_by == 'release_year':
        sort_column = Sneaker.release_year
    else:
        sort_column = Sneaker.created_at

    if sort_order == 'asc':
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    # Paginate
    sneakers = query.paginate(page=page, per_page=per_page, error_out=False)

    result = {
        'sneakers': [sneaker.to_dict() for sneaker in sneakers.items],
        'pagination': {
            'page': sneakers.page,
            'per_page': sneakers.per_page,
            'total': sneakers.total,
            'pages': sneakers.pages,
            'has_next': sneakers.has_next,
            'has_prev': sneakers.has_prev
        }
    }

    return jsonify(result), 200

@sneakers_bp.route('/<int:sneaker_id>', methods=['GET'])
def get_sneaker(sneaker_id):
    sneaker = Sneaker.query.get(sneaker_id)

    if not sneaker:
        return jsonify({'error': 'Sneaker not found'}), 404

    # Get available sizes with inventory
    sizes = db.session.query(
        SneakerSize,
        Inventory.stock_quantity
    ).join(
        Inventory, and_(Inventory.sneaker_id == sneaker_id, Inventory.size_id == SneakerSize.id)
    ).filter(
        Inventory.stock_quantity > 0,
        Inventory.lot_status == 'available'
    ).all()

    sneaker_data = sneaker.to_dict()
    sneaker_data['available_sizes'] = [
        {
            **size.to_dict(),
            'stock_quantity': quantity
        } for size, quantity in sizes
    ]

    return jsonify({'sneaker': sneaker_data}), 200

@sneakers_bp.route('/brands', methods=['GET'])
def get_brands():
    brands = db.session.query(Sneaker.brand).distinct().all()
    return jsonify({'brands': [brand[0] for brand in brands]}), 200

@sneakers_bp.route('/categories', methods=['GET'])
def get_categories():
    categories = ['running', 'basketball', 'lifestyle', 'luxury', 'skate', 'retro', 'high-fashion']
    return jsonify({'categories': categories}), 200

@sneakers_bp.route('/<int:sneaker_id>/price-history', methods=['GET'])
def get_price_history(sneaker_id):
    sneaker = Sneaker.query.get(sneaker_id)

    if not sneaker:
        return jsonify({'error': 'Sneaker not found'}), 404

    # Get last 30 days of price history
    thirty_days_ago = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    thirty_days_ago = thirty_days_ago.replace(day=thirty_days_ago.day - 30)

    price_history = PriceHistory.query.filter(
        PriceHistory.sneaker_id == sneaker_id,
        PriceHistory.recorded_at >= thirty_days_ago
    ).order_by(PriceHistory.recorded_at.asc()).all()

    return jsonify({
        'sneaker_id': sneaker_id,
        'price_history': [ph.to_dict() for ph in price_history]
    }), 200

@sneakers_bp.route('', methods=['POST'])
@jwt_required()
def create_sneaker():
    # Only admin/seller can create sneakers
    current_user_id = get_jwt_identity()
    user = db.session.get(User, current_user_id)

    if user.role not in ['admin', 'seller']:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()

    required_fields = ['sku', 'name', 'brand', 'model', 'colorway', 'release_year', 'current_price_inr']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400

    # Check if SKU already exists
    if Sneaker.query.filter_by(sku=data['sku']).first():
        return jsonify({'error': 'SKU already exists'}), 409

    sneaker = Sneaker(
        sku=data['sku'],
        name=data['name'],
        brand=data['brand'],
        model=data['model'],
        colorway=data['colorway'],
        release_year=data['release_year'],
        rarity=data.get('rarity', 'common'),
        category=data.get('category', 'lifestyle'),
        condition=data.get('condition', 'deadstock'),
        msrp_inr=data.get('msrp_inr'),
        current_price_inr=data['current_price_inr'],
        market_value_inr=data.get('market_value_inr'),
        description=data.get('description'),
        image_path=data.get('image_path')
    )

    db.session.add(sneaker)
    db.session.commit()

    return jsonify({
        'message': 'Sneaker created successfully',
        'sneaker': sneaker.to_dict()
    }), 201

@sneakers_bp.route('/<int:sneaker_id>', methods=['PUT'])
@jwt_required()
def update_sneaker(sneaker_id):
    # Only admin/seller can update sneakers
    current_user_id = get_jwt_identity()
    user = db.session.get(User, current_user_id)

    if user.role not in ['admin', 'seller']:
        return jsonify({'error': 'Unauthorized'}), 403

    sneaker = Sneaker.query.get(sneaker_id)

    if not sneaker:
        return jsonify({'error': 'Sneaker not found'}), 404

    data = request.get_json()

    # Update allowed fields
    allowed_fields = [
        'name', 'brand', 'model', 'colorway', 'release_year', 'rarity',
        'category', 'condition', 'msrp_inr', 'current_price_inr',
        'market_value_inr', 'description', 'image_path'
    ]

    for field in allowed_fields:
        if field in data:
            setattr(sneaker, field, data[field])

    db.session.commit()

    return jsonify({
        'message': 'Sneaker updated successfully',
        'sneaker': sneaker.to_dict()
    }), 200