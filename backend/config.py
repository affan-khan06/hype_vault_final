import os
from datetime import timedelta
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    db_url = os.environ.get('SQLALCHEMY_DATABASE_URI') or os.environ.get('DATABASE_URL')
    
    if db_url:
        # Clean up URL
        db_url = db_url.strip().strip('"').strip("'")
        if db_url.startswith("mysql://"):
            db_url = db_url.replace("mysql://", "mysql+pymysql://", 1)
        
        # Log success (masked)
        print(f"✅ Database URI configured for {db_url.split('@')[-1]}")
    else:
        print("⚠️ WARNING: No DATABASE_URL found!")

    SQLALCHEMY_DATABASE_URI = db_url or 'mysql+pymysql://root:password@localhost/hype_vault'
    
    # Robust SSL for Aiven (handles 'REQUIRED' mode without CA file)
    SQLALCHEMY_ENGINE_OPTIONS = {
        "connect_args": {
            "ssl": {
                "check_hostname": False,
                "fake_user": "true"
            }
        } if db_url and "aiven" in db_url else {}
    }

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key-change-in-production'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)  # Extended for development/demo persistence
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=90)  # Long refresh token for extended sessions

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}