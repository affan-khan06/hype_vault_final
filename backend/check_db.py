from app import create_app
from models import db, User, Cart, CartItem

app = create_app()
with app.app_context():
    user = User.query.first()
    if not user:
        print("No users found")
    else:
        print(f"User: {user.email}")
        cart = Cart.query.filter_by(user_id=user.id, status='active').first()
        if not cart:
            print("Active Cart: None")
        else:
            print(f"Active Cart ID: {cart.id}")
            items = CartItem.query.filter_by(cart_id=cart.id).all()
            print(f"Items in cart: {len(items)}")
            for item in items:
                print(f" - Sneaker ID {item.sneaker_id}, Qty {item.quantity}")
