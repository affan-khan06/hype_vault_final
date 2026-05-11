from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from sqlalchemy.dialects.mysql import BIGINT

db = SQLAlchemy()

class User(UserMixin, db.Model):
    __tablename__ = 'users'

    id = db.Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(180), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(24))
    role = db.Column(db.Enum('collector', 'admin', 'seller'), nullable=False, default='collector')
    profile_handle = db.Column(db.String(80), nullable=False, unique=True)
    loyalty_tier = db.Column(db.Enum('bronze', 'silver', 'gold', 'black'), nullable=False, default='bronze')
    verified = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    status = db.Column(db.Enum('active', 'suspended', 'deleted'), nullable=False, default='active')

    # Relationships
    carts = db.relationship('Cart', backref='user', lazy=True)
    orders = db.relationship('Order', backref='user', lazy=True)
    wishlist = db.relationship('Wishlist', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'full_name': self.full_name,
            'email': self.email,
            'phone': self.phone,
            'role': self.role,
            'profile_handle': self.profile_handle,
            'loyalty_tier': self.loyalty_tier,
            'verified': self.verified,
            'created_at': self.created_at.isoformat(),
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'status': self.status
        }

class Session(db.Model):
    __tablename__ = 'sessions'

    id = db.Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    user_id = db.Column(BIGINT(unsigned=True), db.ForeignKey('users.id'), nullable=False)
    session_token = db.Column(db.String(128), nullable=False, unique=True)
    refresh_token = db.Column(db.String(128), nullable=False, unique=True)
    access_token = db.Column(db.String(512), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    refresh_expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    last_used_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', backref='sessions', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'session_token': self.session_token,
            'expires_at': self.expires_at.isoformat(),
            'refresh_expires_at': self.refresh_expires_at.isoformat(),
            'created_at': self.created_at.isoformat(),
            'last_used_at': self.last_used_at.isoformat()
        }

    def is_expired(self):
        return datetime.utcnow() > self.expires_at

    def is_refresh_expired(self):
        return datetime.utcnow() > self.refresh_expires_at

    def update_last_used(self):
        self.last_used_at = datetime.utcnow()
        db.session.commit()

class Sneaker(db.Model):
    __tablename__ = 'sneakers'

    id = db.Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    sku = db.Column(db.String(40), nullable=False, unique=True)
    name = db.Column(db.String(160), nullable=False)
    brand = db.Column(db.String(80), nullable=False)
    model = db.Column(db.String(120), nullable=False)
    colorway = db.Column(db.String(120), nullable=False)
    release_year = db.Column(db.Integer, nullable=False)
    rarity = db.Column(db.String(80), nullable=False)
    category = db.Column(db.Enum('running', 'basketball', 'lifestyle', 'luxury', 'skate', 'retro', 'high-fashion'), nullable=False, default='lifestyle')
    condition = db.Column(db.Enum('deadstock', 'brand_new', 'near_mint', 'used'), nullable=False, default='deadstock')
    msrp_inr = db.Column(db.Integer)
    current_price_inr = db.Column(db.Integer, nullable=False)
    market_value_inr = db.Column(db.Integer)
    description = db.Column(db.Text)
    image_path = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    sizes = db.relationship('SneakerSize', backref='sneaker', lazy=True)
    inventory = db.relationship('Inventory', backref='sneaker', lazy=True)
    cart_items = db.relationship('CartItem', backref='sneaker', lazy=True)
    order_items = db.relationship('OrderItem', backref='sneaker', lazy=True)
    wishlist_items = db.relationship('Wishlist', backref='sneaker', lazy=True)
    price_history = db.relationship('PriceHistory', backref='sneaker', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'sku': self.sku,
            'name': self.name,
            'brand': self.brand,
            'model': self.model,
            'colorway': self.colorway,
            'release_year': self.release_year,
            'rarity': self.rarity,
            'category': self.category,
            'condition': self.condition,
            'msrp_inr': self.msrp_inr,
            'current_price_inr': self.current_price_inr,
            'market_value_inr': self.market_value_inr,
            'description': self.description,
            'image_path': self.image_path,
            'created_at': self.created_at.isoformat()
        }

class SneakerSize(db.Model):
    __tablename__ = 'sneaker_sizes'

    id = db.Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    sneaker_id = db.Column(BIGINT(unsigned=True), db.ForeignKey('sneakers.id'), nullable=False)
    size_label = db.Column(db.String(24), nullable=False)
    us_size = db.Column(db.Numeric(4, 1), nullable=False)
    uk_size = db.Column(db.Numeric(4, 1))
    eu_size = db.Column(db.Numeric(4, 1))
    available = db.Column(db.Boolean, nullable=False, default=True)
    price_adjustment = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    inventory = db.relationship('Inventory', backref='size', lazy=True)
    cart_items = db.relationship('CartItem', backref='size', lazy=True)
    order_items = db.relationship('OrderItem', backref='size', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'sneaker_id': self.sneaker_id,
            'size_label': self.size_label,
            'us_size': float(self.us_size),
            'uk_size': float(self.uk_size) if self.uk_size else None,
            'eu_size': float(self.eu_size) if self.eu_size else None,
            'available': self.available,
            'price_adjustment': self.price_adjustment
        }

class Inventory(db.Model):
    __tablename__ = 'inventory'

    id = db.Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    sneaker_id = db.Column(BIGINT(unsigned=True), db.ForeignKey('sneakers.id'), nullable=False)
    size_id = db.Column(BIGINT(unsigned=True), db.ForeignKey('sneaker_sizes.id'), nullable=False)
    warehouse_location = db.Column(db.String(120), nullable=False, default='Mumbai Vault')
    stock_quantity = db.Column(db.SmallInteger, nullable=False, default=0)
    lot_status = db.Column(db.Enum('available', 'reserved', 'sold', 'inspection'), nullable=False, default='available')
    condition_notes = db.Column(db.String(255))
    last_audit_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'sneaker_id': self.sneaker_id,
            'size_id': self.size_id,
            'warehouse_location': self.warehouse_location,
            'stock_quantity': self.stock_quantity,
            'lot_status': self.lot_status,
            'condition_notes': self.condition_notes,
            'last_audit_at': self.last_audit_at.isoformat() if self.last_audit_at else None
        }

class Cart(db.Model):
    __tablename__ = 'carts'

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=False)
    session_token = db.Column(db.String(128))
    status = db.Column(db.Enum('active', 'abandoned', 'converted'), nullable=False, default='active')
    reserved_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    items = db.relationship('CartItem', backref='cart', lazy=True)
    order = db.relationship('Order', backref='cart', uselist=False, lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'session_token': self.session_token,
            'status': self.status,
            'reserved_at': self.reserved_at.isoformat() if self.reserved_at else None,
            'created_at': self.created_at.isoformat()
        }

class CartItem(db.Model):
    __tablename__ = 'cart_items'

    id = db.Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    cart_id = db.Column(BIGINT(unsigned=True), db.ForeignKey('carts.id'), nullable=False)
    sneaker_id = db.Column(BIGINT(unsigned=True), db.ForeignKey('sneakers.id'), nullable=False)
    size_id = db.Column(BIGINT(unsigned=True), db.ForeignKey('sneaker_sizes.id'), nullable=False)
    quantity = db.Column(db.SmallInteger, nullable=False, default=1)
    price_inr = db.Column(db.Integer, nullable=False)
    added_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'cart_id': self.cart_id,
            'sneaker_id': self.sneaker_id,
            'size_id': self.size_id,
            'quantity': self.quantity,
            'price_inr': self.price_inr,
            'added_at': self.added_at.isoformat()
        }

class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    user_id = db.Column(BIGINT(unsigned=True), db.ForeignKey('users.id'), nullable=False)
    cart_id = db.Column(BIGINT(unsigned=True), db.ForeignKey('carts.id'))
    order_number = db.Column(db.String(40), nullable=False, unique=True)
    status = db.Column(db.Enum('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'), nullable=False, default='pending')
    payment_method = db.Column(db.Enum('card', 'upi', 'netbanking', 'wallet', 'cash_on_delivery'), nullable=False, default='card')
    payment_status = db.Column(db.Enum('pending', 'authorized', 'captured', 'failed', 'refunded'), nullable=False, default='authorized')
    order_total_inr = db.Column(db.Integer, nullable=False)
    shipping_fee_inr = db.Column(db.Integer, nullable=False, default=0)
    handling_fee_inr = db.Column(db.Integer, nullable=False, default=0)
    tax_inr = db.Column(db.Integer, nullable=False, default=0)
    shipping_address = db.Column(db.Text, nullable=False)
    placed_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    shipped_at = db.Column(db.DateTime)
    delivered_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    items = db.relationship('OrderItem', backref='order', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'cart_id': self.cart_id,
            'order_number': self.order_number,
            'status': self.status,
            'payment_method': self.payment_method,
            'payment_status': self.payment_status,
            'order_total_inr': self.order_total_inr,
            'shipping_fee_inr': self.shipping_fee_inr,
            'handling_fee_inr': self.handling_fee_inr,
            'tax_inr': self.tax_inr,
            'shipping_address': self.shipping_address,
            'placed_at': self.placed_at.isoformat(),
            'shipped_at': self.shipped_at.isoformat() if self.shipped_at else None,
            'delivered_at': self.delivered_at.isoformat() if self.delivered_at else None
        }

class OrderItem(db.Model):
    __tablename__ = 'order_items'

    id = db.Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    order_id = db.Column(BIGINT(unsigned=True), db.ForeignKey('orders.id'), nullable=False)
    sneaker_id = db.Column(BIGINT(unsigned=True), db.ForeignKey('sneakers.id'), nullable=False)
    size_id = db.Column(BIGINT(unsigned=True), db.ForeignKey('sneaker_sizes.id'), nullable=False)
    quantity = db.Column(db.SmallInteger, nullable=False, default=1)
    unit_price_inr = db.Column(db.Integer, nullable=False)
    total_price_inr = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'sneaker_id': self.sneaker_id,
            'size_id': self.size_id,
            'quantity': self.quantity,
            'unit_price_inr': self.unit_price_inr,
            'total_price_inr': self.total_price_inr,
            'created_at': self.created_at.isoformat()
        }

class Wishlist(db.Model):
    __tablename__ = 'wishlist'

    id = db.Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    user_id = db.Column(BIGINT(unsigned=True), db.ForeignKey('users.id'), nullable=False)
    sneaker_id = db.Column(BIGINT(unsigned=True), db.ForeignKey('sneakers.id'), nullable=False)
    priority = db.Column(db.SmallInteger, nullable=False, default=1)
    added_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'sneaker_id': self.sneaker_id,
            'priority': self.priority,
            'added_at': self.added_at.isoformat()
        }

class PriceHistory(db.Model):
    __tablename__ = 'price_history'

    id = db.Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    sneaker_id = db.Column(BIGINT(unsigned=True), db.ForeignKey('sneakers.id'), nullable=False)
    recorded_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    price_inr = db.Column(db.Integer, nullable=False)
    source = db.Column(db.String(140), default='market_feed')
    note = db.Column(db.String(255))

    def to_dict(self):
        return {
            'id': self.id,
            'sneaker_id': self.sneaker_id,
            'recorded_at': self.recorded_at.isoformat(),
            'price_inr': self.price_inr,
            'source': self.source,
            'note': self.note
        }