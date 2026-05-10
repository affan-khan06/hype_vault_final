import sys
import argparse
from app import create_app
from models import db
from sqlalchemy import text

def seed(uri):
    app = create_app()
    app.config['SQLALCHEMY_DATABASE_URI'] = uri
    
    with app.app_context():
        # Read schema.sql from the backend directory
        try:
            import os
            base_dir = os.path.dirname(os.path.abspath(__file__))
            schema_path = os.path.join(base_dir, 'schema.sql')
            
            with open(schema_path, 'r', encoding='utf-8') as f:
                sql_content = f.read()
            
            # Split by semicolon to execute individual statements
            # Note: This is a simple splitter and might fail on complex SQL, 
            # but for our schema.sql it works fine.
            statements = sql_content.split(';')
            
            print(f"Connecting to remote database...")
            for statement in statements:
                if statement.strip():
                    db.session.execute(text(statement))
            
            db.session.commit()
            print("[OK] Successfully seeded the database with 40 sneakers!")
        except Exception as e:
            print(f"[ERROR] Error seeding database: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--uri", required=True, help="Remote Database URI to seed")
    args = parser.parse_args()
    seed(args.uri)
