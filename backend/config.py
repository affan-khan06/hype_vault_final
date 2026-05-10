import os
from datetime import timedelta
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    db_url = os.environ.get('SQLALCHEMY_DATABASE_URI') or os.environ.get('DATABASE_URL')
    
    # Strip accidental quotes if they exist
    if db_url:
        db_url = db_url.strip('"').strip("'")
        
    if db_url and db_url.startswith("mysql://"):
        db_url = db_url.replace("mysql://", "mysql+pymysql://", 1)
    
    if not db_url:
        print("⚠️ WARNING: DATABASE_URL not found in environment. Falling back to localhost.")
    else:
        print(f"✅ Database URL loaded (starts with: {db_url[:15]}...)")
    
    SQLALCHEMY_DATABASE_URI = db_url or 'mysql+pymysql://root:password@localhost/hype_vault'
    
    # Aiven-specific SSL handling
    SQLALCHEMY_ENGINE_OPTIONS = {}
    if db_url and "aivencloud.com" in db_url:
        SQLALCHEMY_ENGINE_OPTIONS = {
            "connect_args": {
                "ssl": {"fake_user": "true"}  # This enables SSL for PyMySQL without needing a CA file
            }
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