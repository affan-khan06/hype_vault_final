from app import app
from models import db, User, Order, OrderItem, Sneaker, SneakerSize, Inventory, Session

with app.app_context():
    print("\n=== USERS ===")
    users = User.query.all()
    for u in users:
        print(f"  id={u.id}  email={u.email}  name={u.full_name}  tier={u.loyalty_tier}")

    print("\n=== SNEAKERS (first 5) ===")
    sneakers = Sneaker.query.limit(5).all()
    for s in sneakers:
        print(f"  id={s.id}  name={s.name}  brand={s.brand}  price=INR {s.current_price_inr}")

    print("\n=== ORDERS ===")
    orders = Order.query.all()
    if not orders:
        print("  (no orders placed yet)")
    for o in orders:
        print(f"  order={o.order_number}  user_id={o.user_id}  total=INR {o.order_total_inr}  status={o.status}")

    print("\n=== INVENTORY (first 5) ===")
    inv = Inventory.query.limit(5).all()
    for i in inv:
        print(f"  sneaker_id={i.sneaker_id}  size_id={i.size_id}  qty={i.stock_quantity}  status={i.lot_status}")

    print("\n=== ACTIVE SESSIONS ===")
    sessions = Session.query.all()
    if not sessions:
        print("  (no active sessions)")
    for s in sessions:
        print(f"  user_id={s.user_id}  expires={s.expires_at}")
