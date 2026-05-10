from app import create_app
from models import db, User, Order

app = create_app()
with app.app_context():
    user = User.query.first()
    if user:
        orders = Order.query.filter_by(user_id=user.id).order_by(Order.placed_at.desc()).all()
        print(f"Recent orders for {user.email}:")
        for order in orders[:5]:
            print(f" - Order {order.order_number}, Placed at {order.placed_at}, Total: {order.order_total_inr}")
