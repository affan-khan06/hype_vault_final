from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import and_
from models import db, User, Cart, CartItem, Order, OrderItem, Inventory
import uuid
from datetime import datetime

checkout_bp = Blueprint('checkout', __name__)

@checkout_bp.route('/preview', methods=['GET'])
@jwt_required()
def checkout_preview():
    current_user_id = get_jwt_identity()

    cart = Cart.query.filter_by(user_id=current_user_id, status='active').first()

    if not cart:
        return jsonify({'error': 'No active cart found'}), 404

    # Get cart items with details
    items = db.session.query(
        CartItem,
        Inventory
    ).join(
        Inventory, and_(
            Inventory.sneaker_id == CartItem.sneaker_id,
            Inventory.size_id == CartItem.size_id
        )
    ).filter(
        CartItem.cart_id == cart.id
    ).all()

    if not items:
        return jsonify({'error': 'Cart is empty'}), 400

    # Calculate totals
    subtotal = 0
    items_list = []

    for cart_item, inventory in items:
        if inventory.stock_quantity < cart_item.quantity:
            return jsonify({
                'error': f'Insufficient stock for item {cart_item.id}'
            }), 400

        item_total = cart_item.quantity * cart_item.price_inr
        subtotal += item_total

        items_list.append({
            'cart_item_id': cart_item.id,
            'quantity': cart_item.quantity,
            'price_inr': cart_item.price_inr,
            'total_price': item_total
        })

    # Calculate fees (simplified)
    shipping_fee = 0 if subtotal > 5000 else 299  # Free shipping over ₹5000
    handling_fee = 99
    tax_rate = 0.18  # 18% GST
    tax = int(subtotal * tax_rate)
    total = subtotal + shipping_fee + handling_fee + tax

    return jsonify({
        'cart_id': cart.id,
        'items': items_list,
        'breakdown': {
            'subtotal': subtotal,
            'shipping_fee': shipping_fee,
            'handling_fee': handling_fee,
            'tax': tax,
            'total': total
        }
    }), 200

@checkout_bp.route('', methods=['POST'])
@jwt_required()
def checkout():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    required_fields = ['payment_method', 'shipping_address']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400

    payment_method = data['payment_method']
    shipping_address = data['shipping_address']

    # Validate payment method
    valid_payment_methods = ['card', 'upi', 'netbanking', 'wallet', 'cash_on_delivery']
    if payment_method not in valid_payment_methods:
        return jsonify({'error': 'Invalid payment method'}), 400

    cart = Cart.query.filter_by(user_id=current_user_id, status='active').first()

    if not cart:
        return jsonify({'error': 'No active cart found'}), 404

    # Get cart items with inventory check
    items = db.session.query(
        CartItem,
        Inventory
    ).join(
        Inventory, and_(
            Inventory.sneaker_id == CartItem.sneaker_id,
            Inventory.size_id == CartItem.size_id
        )
    ).filter(
        CartItem.cart_id == cart.id
    ).all()

    if not items:
        return jsonify({'error': 'Cart is empty'}), 400

    # Validate inventory and calculate totals
    subtotal = 0
    order_items_data = []

    for cart_item, inventory in items:
        if inventory.stock_quantity < cart_item.quantity:
            return jsonify({
                'error': f'Insufficient stock for item {cart_item.id}'
            }), 400

        item_total = cart_item.quantity * cart_item.price_inr
        subtotal += item_total

        order_items_data.append({
            'cart_item': cart_item,
            'inventory': inventory,
            'total_price': item_total
        })

    # Calculate fees
    shipping_fee = 0 if subtotal > 5000 else 299
    handling_fee = 99
    tax = int(subtotal * 0.18)  # 18% GST
    total = subtotal + shipping_fee + handling_fee + tax

    # Generate order number
    order_number = f"HV-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"

    # Create order
    order = Order(
        user_id=current_user_id,
        cart_id=cart.id,
        order_number=order_number,
        payment_method=payment_method,
        order_total_inr=total,
        shipping_fee_inr=shipping_fee,
        handling_fee_inr=handling_fee,
        tax_inr=tax,
        shipping_address=shipping_address
    )

    db.session.add(order)
    db.session.flush()  # Get order ID

    # Create order items and update inventory
    for item_data in order_items_data:
        cart_item = item_data['cart_item']
        inventory = item_data['inventory']

        order_item = OrderItem(
            order_id=order.id,
            sneaker_id=cart_item.sneaker_id,
            size_id=cart_item.size_id,
            quantity=cart_item.quantity,
            unit_price_inr=cart_item.price_inr,
            total_price_inr=item_data['total_price']
        )

        db.session.add(order_item)

        # Update inventory
        inventory.stock_quantity -= cart_item.quantity
        if inventory.stock_quantity == 0:
            inventory.lot_status = 'sold'

    # Mark cart as converted
    cart.status = 'converted'

    # Clear cart items (optional, since cart is converted)
    CartItem.query.filter_by(cart_id=cart.id).delete()

    db.session.commit()

    # Build enriched order_items for the frontend (needs sneaker name/brand and size_label)
    enriched_items = []
    for item in order.items:
        from models import Sneaker as SneakerModel, SneakerSize as SneakerSizeModel
        sneaker = db.session.get(SneakerModel, item.sneaker_id)
        size = db.session.get(SneakerSizeModel, item.size_id)
        enriched_items.append({
            **item.to_dict(),
            'sneaker': {
                'id': sneaker.id,
                'name': sneaker.name,
                'brand': sneaker.brand,
            } if sneaker else {'id': item.sneaker_id, 'name': 'Unknown', 'brand': 'Unknown'},
            'size': {
                'id': size.id,
                'size_label': size.size_label,
            } if size else {'id': item.size_id, 'size_label': 'UK 9'},
        })

    return jsonify({
        'message': 'Order placed successfully',
        'order': order.to_dict(),
        'order_items': enriched_items
    }), 201

@checkout_bp.route('/payment/webhook', methods=['POST'])
def payment_webhook():
    # This would handle payment gateway webhooks
    # For now, just acknowledge
    data = request.get_json()

    # In a real implementation, you'd verify the webhook signature
    # and update order payment status accordingly

    if data.get('event') == 'payment.captured':
        order_number = data.get('order_number')
        order = Order.query.filter_by(order_number=order_number).first()

        if order:
            order.payment_status = 'captured'
            order.status = 'confirmed'
            db.session.commit()

    return jsonify({'status': 'ok'}), 200