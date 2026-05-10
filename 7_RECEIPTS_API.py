"""
HYPE VAULT PDF RECEIPT API
Endpoint for generating downloadable PDF invoices

Add this to backend/api/orders.py or create backend/api/receipts.py
"""

from flask import Blueprint, request, jsonify, send_file, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Order, OrderItem, User, Sneaker, SneakerSize
from datetime import datetime
import io
import os
from ..utils.invoice_generator import HypeVaultInvoiceGenerator

receipts_bp = Blueprint('receipts', __name__)

@receipts_bp.route('/order/<int:order_id>/receipt', methods=['GET'])
@jwt_required()
def get_order_receipt(order_id):
    """
    Generate and return PDF receipt for an order
    
    GET /api/receipts/order/<order_id>/receipt
    
    Returns: PDF file
    """
    current_user_id = get_jwt_identity()
    
    # Fetch order
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    # Verify user owns this order
    if order.user_id != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        # Fetch user, items, and related data
        user = User.query.get(current_user_id)
        order_items = OrderItem.query.filter_by(order_id=order_id).all()
        
        # Build order data structure
        items_list = []
        for item in order_items:
            sneaker = Sneaker.query.get(item.sneaker_id)
            size = SneakerSize.query.get(item.size_id)
            
            items_list.append({
                'name': sneaker.name,
                'sku': sneaker.sku,
                'size': size.size_label if size else 'N/A',
                'quantity': item.quantity,
                'unit_price': item.unit_price_inr,
                'total_price': item.total_price_inr,
                'image_path': sneaker.image_path
            })
        
        # Parse shipping address (stored as JSON string in Order)
        import json
        try:
            shipping_address = json.loads(order.shipping_address)
        except:
            shipping_address = {
                'street': order.shipping_address,
                'city': 'Mumbai',
                'state': 'MH',
                'zipcode': '400001',
                'country': 'India'
            }
        
        order_data = {
            'order_number': order.order_number,
            'order_date': order.placed_at.strftime('%Y-%m-%d'),
            'customer': {
                'name': user.full_name,
                'email': user.email,
                'phone': user.phone or '+91-XXXX-XXXX-XXXX',
                'loyalty_tier': user.loyalty_tier,
                'profile_handle': user.profile_handle
            },
            'shipping_address': shipping_address,
            'items': items_list,
            'subtotal': sum(item.total_price_inr for item in order_items),
            'shipping_fee': order.shipping_fee_inr,
            'handling_fee': order.handling_fee_inr,
            'tax': order.tax_inr,
            'total': order.order_total_inr,
            'payment_method': order.payment_method
        }
        
        # Generate PDF
        generator = HypeVaultInvoiceGenerator()
        pdf_bytes = generator.generate_invoice(order_data)
        
        # Return as downloadable file
        return send_file(
            pdf_bytes,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f"HYPEVAULT_{order.order_number}.pdf"
        )
        
    except Exception as e:
        current_app.logger.error(f"Receipt generation failed: {str(e)}")
        return jsonify({'error': 'Failed to generate receipt', 'details': str(e)}), 500


@receipts_bp.route('/order/<int:order_id>/receipt-preview', methods=['GET'])
@jwt_required()
def preview_order_receipt(order_id):
    """
    Preview receipt as base64 data URL (for in-app display)
    
    GET /api/receipts/order/<order_id>/receipt-preview
    
    Returns: JSON with base64 encoded PDF
    """
    current_user_id = get_jwt_identity()
    
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    if order.user_id != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        import base64
        from io import BytesIO
        
        user = User.query.get(current_user_id)
        order_items = OrderItem.query.filter_by(order_id=order_id).all()
        
        items_list = []
        for item in order_items:
            sneaker = Sneaker.query.get(item.sneaker_id)
            size = SneakerSize.query.get(item.size_id)
            
            items_list.append({
                'name': sneaker.name,
                'sku': sneaker.sku,
                'size': size.size_label if size else 'N/A',
                'quantity': item.quantity,
                'unit_price': item.unit_price_inr,
                'total_price': item.total_price_inr,
                'image_path': sneaker.image_path
            })
        
        import json
        try:
            shipping_address = json.loads(order.shipping_address)
        except:
            shipping_address = {
                'street': order.shipping_address,
                'city': 'Mumbai',
                'state': 'MH',
                'zipcode': '400001',
                'country': 'India'
            }
        
        order_data = {
            'order_number': order.order_number,
            'order_date': order.placed_at.strftime('%Y-%m-%d'),
            'customer': {
                'name': user.full_name,
                'email': user.email,
                'phone': user.phone or '+91-XXXX-XXXX-XXXX',
                'loyalty_tier': user.loyalty_tier,
                'profile_handle': user.profile_handle
            },
            'shipping_address': shipping_address,
            'items': items_list,
            'subtotal': sum(item.total_price_inr for item in order_items),
            'shipping_fee': order.shipping_fee_inr,
            'handling_fee': order.handling_fee_inr,
            'tax': order.tax_inr,
            'total': order.order_total_inr,
            'payment_method': order.payment_method
        }
        
        # Generate PDF
        generator = HypeVaultInvoiceGenerator()
        pdf_bytes = generator.generate_invoice(order_data)
        
        # Convert to base64
        pdf_b64 = base64.b64encode(pdf_bytes.getvalue()).decode('utf-8')
        
        return jsonify({
            'success': True,
            'pdf_data': f"data:application/pdf;base64,{pdf_b64}",
            'order_number': order.order_number
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Receipt preview failed: {str(e)}")
        return jsonify({'error': 'Failed to preview receipt'}), 500


@receipts_bp.route('/order/<int:order_id>/send-receipt-email', methods=['POST'])
@jwt_required()
def send_receipt_email(order_id):
    """
    Email receipt PDF to user
    
    POST /api/receipts/order/<order_id>/send-receipt-email
    
    Returns: JSON success/error
    """
    current_user_id = get_jwt_identity()
    
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    if order.user_id != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        from flask_mail import Mail, Message
        
        user = User.query.get(current_user_id)
        order_items = OrderItem.query.filter_by(order_id=order_id).all()
        
        items_list = []
        for item in order_items:
            sneaker = Sneaker.query.get(item.sneaker_id)
            size = SneakerSize.query.get(item.size_id)
            
            items_list.append({
                'name': sneaker.name,
                'sku': sneaker.sku,
                'size': size.size_label if size else 'N/A',
                'quantity': item.quantity,
                'unit_price': item.unit_price_inr,
                'total_price': item.total_price_inr,
                'image_path': sneaker.image_path
            })
        
        import json
        try:
            shipping_address = json.loads(order.shipping_address)
        except:
            shipping_address = {
                'street': order.shipping_address,
                'city': 'Mumbai',
                'state': 'MH',
                'zipcode': '400001',
                'country': 'India'
            }
        
        order_data = {
            'order_number': order.order_number,
            'order_date': order.placed_at.strftime('%Y-%m-%d'),
            'customer': {
                'name': user.full_name,
                'email': user.email,
                'phone': user.phone or '+91-XXXX-XXXX-XXXX',
                'loyalty_tier': user.loyalty_tier,
                'profile_handle': user.profile_handle
            },
            'shipping_address': shipping_address,
            'items': items_list,
            'subtotal': sum(item.total_price_inr for item in order_items),
            'shipping_fee': order.shipping_fee_inr,
            'handling_fee': order.handling_fee_inr,
            'tax': order.tax_inr,
            'total': order.order_total_inr,
            'payment_method': order.payment_method
        }
        
        # Generate PDF
        generator = HypeVaultInvoiceGenerator()
        pdf_bytes = generator.generate_invoice(order_data)
        
        # Send email
        mail = Mail(current_app)
        msg = Message(
            subject=f"Your HYPE VAULT Order Receipt - {order.order_number}",
            recipients=[user.email],
            body=f"""
Hello {user.full_name},

Thank you for your order at HYPE VAULT!

Order Number: {order.order_number}
Order Date: {order.placed_at.strftime('%Y-%m-%d')}
Total Amount: ₹{order.order_total_inr:,.0f}

Your invoice is attached to this email.

Track your order at: https://hypevault.com/order/{order.order_number}

Best regards,
HYPE VAULT Team
            """
        )
        
        # Attach PDF
        msg.attach(
            f"HYPEVAULT_{order.order_number}.pdf",
            "application/pdf",
            pdf_bytes.getvalue(),
            headers={"Content-Disposition": f"attachment; filename=HYPEVAULT_{order.order_number}.pdf"}
        )
        
        mail.send(msg)
        
        return jsonify({'success': True, 'message': 'Receipt sent to email'}), 200
        
    except Exception as e:
        current_app.logger.error(f"Receipt email failed: {str(e)}")
        return jsonify({'error': 'Failed to send receipt email', 'details': str(e)}), 500
