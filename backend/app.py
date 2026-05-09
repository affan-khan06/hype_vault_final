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

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    CORS(app)
    JWTManager(app)
    db.init_app(app)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(sneakers_bp, url_prefix='/api/sneakers')
    app.register_blueprint(cart_bp, url_prefix='/api/cart')
    app.register_blueprint(checkout_bp, url_prefix='/api/checkout')
    app.register_blueprint(wishlist_bp, url_prefix='/api/wishlist')
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    app.register_blueprint(inventory_bp, url_prefix='/api/inventory')

    # Health check endpoint
    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'service': 'hype-vault-backend'}

    # Create database tables (commented out for now - run manually after DB setup)
    # with app.app_context():
    #     db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)