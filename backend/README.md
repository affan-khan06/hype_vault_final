# HYPE VAULT Backend

A comprehensive Flask REST API backend for the HYPE VAULT sneaker marketplace, featuring authentication, inventory management, cart functionality, checkout, wishlist, and order history.

## Features

- **User Authentication**: JWT-based authentication with registration, login, and profile management
- **Sneaker Management**: CRUD operations for sneakers with filtering, search, and price history
- **Cart System**: Add, update, remove items with inventory validation and reservation
- **Checkout Process**: Complete order processing with payment integration hooks
- **Wishlist**: User wishlists with priority levels
- **Order History**: Complete order tracking and management
- **Inventory Management**: Stock tracking, low-stock alerts, and warehouse management
- **Production Ready**: Clean architecture with proper error handling and validation

## Tech Stack

- **Framework**: Flask 2.3.3
- **Database**: MySQL with SQLAlchemy ORM
- **Authentication**: JWT (Flask-JWT-Extended)
- **CORS**: Flask-CORS for frontend integration
- **Password Hashing**: Werkzeug security

## Project Structure

```
backend/
├── api/                    # API blueprints
│   ├── auth.py            # Authentication endpoints
│   ├── sneakers.py        # Sneaker CRUD and search
│   ├── cart.py            # Cart management
│   ├── checkout.py        # Order processing
│   ├── wishlist.py        # Wishlist management
│   ├── orders.py          # Order history
│   └── inventory.py       # Inventory management
├── app.py                 # Flask application factory
├── config.py              # Configuration settings
├── models.py              # SQLAlchemy models
├── requirements.txt       # Python dependencies
└── schema.sql            # MySQL database schema
```

## Setup Instructions

### Prerequisites

- Python 3.8+
- MySQL 8.0+
- pip package manager

### 1. Clone and Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Database Setup

1. Create a MySQL database named `hype_vault`
2. Run the schema.sql file to create tables and insert sample data:

```bash
mysql -u your_username -p hype_vault < schema.sql
```

### 3. Environment Configuration

A `.env` file has been created with default development settings. Update it with your MySQL credentials:

```env
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
SQLALCHEMY_DATABASE_URI=mysql+pymysql://username:password@localhost/hype_vault
FLASK_ENV=development
```

### 4. Database Setup

1. Create a MySQL database named `hype_vault`
2. Run the schema.sql file to create tables and insert sample data:

```bash
mysql -u your_username -p hype_vault < schema.sql
```

### 5. Initialize Database Tables

After setting up the database, uncomment the database table creation in `app.py`:

```python
# In app.py, uncomment these lines:
with app.app_context():
    db.create_all()
```

### 6. Run the Application

```bash
python app.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Sneakers
- `GET /api/sneakers` - List sneakers with filtering
- `GET /api/sneakers/<id>` - Get sneaker details
- `GET /api/sneakers/brands` - Get available brands
- `GET /api/sneakers/categories` - Get sneaker categories
- `GET /api/sneakers/<id>/price-history` - Get price history
- `POST /api/sneakers` - Create sneaker (admin/seller only)
- `PUT /api/sneakers/<id>` - Update sneaker (admin/seller only)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/<item_id>` - Update cart item quantity
- `DELETE /api/cart/remove/<item_id>` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart
- `POST /api/cart/reserve` - Reserve cart items

### Checkout
- `GET /api/checkout/preview` - Preview order totals
- `POST /api/checkout` - Process checkout
- `POST /api/checkout/payment/webhook` - Payment webhook

### Wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist/add/<sneaker_id>` - Add to wishlist
- `DELETE /api/wishlist/remove/<sneaker_id>` - Remove from wishlist
- `PUT /api/wishlist/update/<sneaker_id>` - Update priority
- `GET /api/wishlist/check/<sneaker_id>` - Check if in wishlist
- `DELETE /api/wishlist/clear` - Clear wishlist

### Orders
- `GET /api/orders` - Get order history
- `GET /api/orders/<id>` - Get order details
- `POST /api/orders/<id>/cancel` - Cancel order
- `GET /api/orders/<id>/status` - Get order status
- `GET /api/orders/stats` - Get order statistics

### Inventory (Admin/Seller only)
- `GET /api/inventory` - Get inventory items
- `PUT /api/inventory/<id>` - Update inventory
- `POST /api/inventory/add` - Add inventory
- `DELETE /api/inventory/<id>` - Remove inventory
- `GET /api/inventory/low-stock` - Get low stock alerts
- `GET /api/inventory/stats` - Get inventory statistics

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Sample Data

The schema.sql file includes 40 sample sneakers with realistic pricing in INR, covering various brands like Nike, Adidas, Jordan, and more.

## Frontend Integration

The Flask backend is designed to work with the existing frontend in the `frontend/` directory. The API includes:

- CORS enabled for cross-origin requests
- JWT authentication for secure API access
- RESTful endpoints that match typical frontend requirements
- Proper error handling and validation

To connect the frontend to this backend:

1. Ensure the frontend makes API calls to `http://localhost:5000/api/*`
2. Include JWT tokens in Authorization headers for protected endpoints
3. Handle authentication flows (login/register/logout) in the frontend

## Production Deployment

For production deployment:

1. Set `FLASK_ENV=production` in environment variables
2. Use a production WSGI server like Gunicorn
3. Configure proper database connection pooling
4. Set up proper logging and monitoring
5. Implement rate limiting and security headers
6. Use environment variables for all secrets
7. Set up SSL/TLS certificates

## Contributing

1. Follow the existing code structure and naming conventions
2. Add proper error handling and validation
3. Include docstrings for new functions
4. Test API endpoints thoroughly
5. Update this README for any new features

## License

This project is part of the HYPE VAULT sneaker marketplace application.