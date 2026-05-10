from app import create_app
from models import db
from sqlalchemy import text

app = create_app()
with app.app_context():
    with db.engine.connect() as conn:
        result = conn.execute(text("SHOW CREATE TABLE users"))
        print("USERS TABLE SCHEMA:")
        print(result.fetchone()[1])
        
        result = conn.execute(text("SHOW CREATE TABLE carts"))
        print("\nCARTS TABLE SCHEMA:")
        print(result.fetchone()[1])
