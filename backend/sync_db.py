import sys
import argparse
from app import create_app
from models import db

app = create_app()

def sync(uri=None):
    with app.app_context():
        if uri:
            app.config['SQLALCHEMY_DATABASE_URI'] = uri
        db.create_all()
        print(f"Database tables synchronized on {uri if uri else 'local DB'}.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--uri", help="Remote Database URI to sync")
    args = parser.parse_args()
    sync(args.uri)
