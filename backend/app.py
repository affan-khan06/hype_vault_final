import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db
from api.auth import auth_bp
from api.sneakers import sneakers_bp
from api.cart import cart_bp
from api.checkout import checkout_bp
from api.wishlist import wishlist_bp
from api.orders import orders_bp
from api.inventory import inventory_bp
from api.receipts import receipts_bp
from datetime import timedelta

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Session configuration
    app.config['SESSION_TYPE'] = 'filesystem'
    app.config['SESSION_PERMANENT'] = True
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=90)
    app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

    # Initialize extensions
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    jwt = JWTManager(app)
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error_string):
        return {'error': 'Invalid token', 'message': error_string}, 401
        
    @jwt.unauthorized_loader
    def missing_token_callback(error_string):
        return {'error': 'Missing token', 'message': error_string}, 401
        
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {'error': 'Token expired', 'message': 'The token has expired'}, 401
    db.init_app(app)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(sneakers_bp, url_prefix='/api/sneakers')
    app.register_blueprint(cart_bp, url_prefix='/api/cart')
    app.register_blueprint(checkout_bp, url_prefix='/api/checkout')
    app.register_blueprint(wishlist_bp, url_prefix='/api/wishlist')
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    app.register_blueprint(inventory_bp, url_prefix='/api/inventory')
    app.register_blueprint(receipts_bp, url_prefix='/api/receipts')

    # Health check endpoint
    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'service': 'hype-vault-backend'}

    # Create database tables (commented out for now - run manually after DB setup)
    # with app.app_context():
    #     db.create_all()

    return app

# Expose 'app' for Gunicorn deployment
app = create_app()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)