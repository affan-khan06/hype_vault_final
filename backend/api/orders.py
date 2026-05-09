from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import and_, desc
from models import db, Order, OrderItem, Sneaker, SneakerSize

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('', methods=['GET'])
@jwt_required()
def get_orders():
    current_user_id = get_jwt_identity()

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    status = request.args.get('status')

    query = Order.query.filter_by(user_id=current_user_id)

    if status:
        query = query.filter_by(status=status)

    orders = query.order_by(desc(Order.placed_at)).paginate(
        page=page, per_page=per_page, error_out=False
    )

    orders_data = []
    for order in orders.items:
        # Get order items with sneaker details
        items = db.session.query(
            OrderItem,
            Sneaker,
            SneakerSize
        ).join(
            Sneaker, OrderItem.sneaker_id == Sneaker.id
        ).join(
            SneakerSize, OrderItem.size_id == SneakerSize.id
        ).filter(
            OrderItem.order_id == order.id
        ).all()

        order_items = []
        for order_item, sneaker, size in items:
            item_data = {
                'id': order_item.id,
                'sneaker': sneaker.to_dict(),
                'size': size.to_dict(),
                'quantity': order_item.quantity,
                'unit_price_inr': order_item.unit_price_inr,
                'total_price_inr': order_item.total_price_inr
            }
            order_items.append(item_data)

        order_data = order.to_dict()
        order_data['items'] = order_items
        order_data['item_count'] = len(order_items)
        orders_data.append(order_data)

    return jsonify({
        'orders': orders_data,
        'pagination': {
            'page': orders.page,
            'per_page': orders.per_page,
            'total': orders.total,
            'pages': orders.pages,
            'has_next': orders.has_next,
            'has_prev': orders.has_prev
        }
    }), 200

@orders_bp.route('/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    current_user_id = get_jwt_identity()

    order = Order.query.filter_by(id=order_id, user_id=current_user_id).first()

    if not order:
        return jsonify({'error': 'Order not found'}), 404

    # Get order items with sneaker details
    items = db.session.query(
        OrderItem,
        Sneaker,
        SneakerSize
    ).join(
        Sneaker, OrderItem.sneaker_id == Sneaker.id
    ).join(
        SneakerSize, OrderItem.size_id == SneakerSize.id
    ).filter(
        OrderItem.order_id == order.id
    ).all()

    order_items = []
    for order_item, sneaker, size in items:
        item_data = {
            'id': order_item.id,
            'sneaker': sneaker.to_dict(),
            'size': size.to_dict(),
            'quantity': order_item.quantity,
            'unit_price_inr': order_item.unit_price_inr,
            'total_price_inr': order_item.total_price_inr,
            'created_at': order_item.created_at.isoformat()
        }
        order_items.append(item_data)

    order_data = order.to_dict()
    order_data['items'] = order_items

    return jsonify({'order': order_data}), 200

@orders_bp.route('/<int:order_id>/cancel', methods=['POST'])
@jwt_required()
def cancel_order(order_id):
    current_user_id = get_jwt_identity()

    order = Order.query.filter_by(id=order_id, user_id=current_user_id).first()

    if not order:
        return jsonify({'error': 'Order not found'}), 404

    # Only allow cancellation for pending/confirmed orders
    if order.status not in ['pending', 'confirmed']:
        return jsonify({
            'error': 'Order cannot be cancelled at this stage'
        }), 400

    # Update order status
    order.status = 'cancelled'

    # In a real implementation, you'd also:
    # - Refund payment if already captured
    # - Restock inventory
    # - Send cancellation notifications

    db.session.commit()

    return jsonify({
        'message': 'Order cancelled successfully',
        'order': order.to_dict()
    }), 200

@orders_bp.route('/<int:order_id>/status', methods=['GET'])
@jwt_required()
def get_order_status(order_id):
    current_user_id = get_jwt_identity()

    order = Order.query.filter_by(id=order_id, user_id=current_user_id).first()

    if not order:
        return jsonify({'error': 'Order not found'}), 404

    return jsonify({
        'order_id': order.id,
        'order_number': order.order_number,
        'status': order.status,
        'payment_status': order.payment_status,
        'placed_at': order.placed_at.isoformat(),
        'shipped_at': order.shipped_at.isoformat() if order.shipped_at else None,
        'delivered_at': order.delivered_at.isoformat() if order.delivered_at else None
    }), 200

@orders_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_order_stats():
    current_user_id = get_jwt_identity()

    # Get order statistics
    total_orders = Order.query.filter_by(user_id=current_user_id).count()

    orders_by_status = db.session.query(
        Order.status,
        db.func.count(Order.id)
    ).filter_by(user_id=current_user_id).group_by(Order.status).all()

    status_counts = {status: count for status, count in orders_by_status}

    # Calculate total spent
    total_spent = db.session.query(
        db.func.sum(Order.order_total_inr)
    ).filter(
        Order.user_id == current_user_id,
        Order.status != 'cancelled'
    ).scalar() or 0

    return jsonify({
        'total_orders': total_orders,
        'total_spent_inr': total_spent,
        'orders_by_status': status_counts
    }), 200