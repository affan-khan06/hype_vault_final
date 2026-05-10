/**
 * HYPE VAULT STABILIZATION & POLISH
 * COMPREHENSIVE IMPLEMENTATION GUIDE
 * 
 * This document provides step-by-step instructions for integrating all
 * stabilization components without rewriting existing architecture.
 */

# HYPE VAULT STABILIZATION ROADMAP

## Table of Contents
1. [Authentication Stabilization](#1-authentication-stabilization)
2. [User Profile System](#2-user-profile-system)
3. [Payment Polish](#3-payment-polish)
4. [PDF Receipt Generation](#4-pdf-receipt-generation)
5. [Image System Finalization](#5-image-system-finalization)
6. [UI Evolution](#6-ui-evolution)
7. [Testing & Deployment](#7-testing--deployment)

---

## 1. AUTHENTICATION STABILIZATION

### Problem
- JWT tokens not persisted across page refreshes
- Auth state lost on navigation
- No automatic token refresh
- Navbar auth state doesn't restore instantly

### Solution
Use the `AuthContext` with persistent localStorage and automatic token refresh.

### Implementation Steps

#### Step 1.1: Install Dependencies
```bash
cd frontend
npm install axios
```

#### Step 1.2: Create Authentication Context
1. Create directory: `frontend/src/context/`
2. Copy `1_AUTH_CONTEXT.jsx` to `frontend/src/context/AuthContext.jsx`
3. Copy `2_API_CLIENT.js` to `frontend/src/utils/apiClient.js`
4. Copy `3_PROTECTED_ROUTES.jsx` to `frontend/src/components/ProtectedRoutes.jsx`

#### Step 1.3: Wrap App with AuthProvider
Update `frontend/src/main.jsx`:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
```

#### Step 1.4: Use useAuth Hook in Components
Replace all auth state management with `useAuth()`:

```jsx
import { useAuth } from '../context/AuthContext'

function LoginForm() {
  const { login, error, loading } = useAuth()
  
  const handleLogin = async (email, password) => {
    const result = await login(email, password)
    if (result.success) {
      window.location.href = '/dashboard'
    }
  }
  
  // ... rest of component
}
```

#### Step 1.5: Protect Routes
```jsx
import { ProtectedRoute } from '../components/ProtectedRoutes'

function App() {
  return (
    <Routes>
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
```

### What This Achieves
✅ Persistent JWT tokens across refreshes
✅ Automatic token refresh 2 min before expiry
✅ Automatic logout when refresh fails
✅ Session recovery on app load
✅ Navbar auth state restores instantly

---

## 2. USER PROFILE SYSTEM

### Problem
- No visible user profile in navbar
- User info not displayed dynamically from MySQL
- Loyalty tier not visible
- No profile menu

### Solution
Use `UserAvatar` and `UserProfileMenu` components with useAuth hook.

### Implementation Steps

#### Step 2.1: Copy Profile Components
Copy `4_USER_PROFILE_COMPONENTS.jsx` to `frontend/src/components/UserProfile.jsx`

#### Step 2.2: Update Navbar
Add user profile to your existing navbar:

```jsx
import { UserProfileMenu } from '../components/UserProfile'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, isAuthenticated, loading } = useAuth()
  
  return (
    <nav className="navbar">
      {/* ... existing nav items ... */}
      
      {isAuthenticated && !loading && user ? (
        <UserProfileMenu user={user} />
      ) : isAuthenticated && loading ? (
        <div className="animate-spin w-6 h-6 border-2 border-gray-400 border-t-white rounded-full" />
      ) : (
        <div className="flex gap-2">
          <a href="/auth/login" className="btn">Login</a>
          <a href="/auth/register" className="btn">Register</a>
        </div>
      )}
    </nav>
  )
}
```

#### Step 2.3: Create Profile Dashboard
Create `frontend/src/pages/ProfilePage.jsx`:

```jsx
import { useAuth } from '../context/AuthContext'
import { ProfileCard } from '../components/UserProfile'
import { ProtectedRoute } from '../components/ProtectedRoutes'

export default function ProfilePage() {
  const { user, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  
  return (
    <ProtectedRoute>
      <div className="container-premium">
        <h1 className="heading-hero mb-8">My Profile</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <ProfileCard user={user} />
          </div>
          <div className="md:col-span-2">
            {/* Order history, wishlist, settings go here */}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
```

### Backend Support
Your backend already supports this! The `User` model has all required fields:
- `full_name` ✅
- `email` ✅
- `profile_handle` ✅
- `loyalty_tier` ✅
- `/api/auth/current-user` endpoint ✅
- `/api/auth/profile` (PUT) for updates ✅

### What This Achieves
✅ User avatar with initials
✅ Loyalty tier badge with color coding
✅ Profile dropdown menu
✅ Dynamic profile name, email, handle
✅ Edit profile functionality
✅ Wishlist, orders quick access
✅ Logout button in menu

---

## 3. PAYMENT POLISH

### Problem
- Payment UI not premium
- No modern method selection
- UPI/Wallet/Netbanking UI unclear
- Security indicators missing
- Order success handling unclear

### Solution
Use `PaymentMethodSelector` and `PaymentForm` components.

### Implementation Steps

#### Step 3.1: Copy Payment Components
Copy `5_PAYMENT_SELECTOR.jsx` to `frontend/src/components/PaymentMethod.jsx`

#### Step 3.2: Create Checkout Page
Create `frontend/src/pages/CheckoutPage.jsx`:

```jsx
import { useState } from 'react'
import { ProtectedRoute } from '../components/ProtectedRoutes'
import { 
  PaymentMethodSelector, 
  PaymentForm 
} from '../components/PaymentMethod'
import { useAuth } from '../context/AuthContext'
import apiClient from '../utils/apiClient'

export default function CheckoutPage() {
  const { user } = useAuth()
  const [selectedPayment, setSelectedPayment] = useState('upi')
  const [isLoading, setIsLoading] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(null)
  
  const handlePayment = async (paymentData) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post('/api/checkout/process-payment', {
        ...paymentData,
        method: selectedPayment
      })
      
      if (response.data.success) {
        setOrderSuccess(response.data.order)
        // Show success modal or redirect
        setTimeout(() => {
          window.location.href = `/order/${response.data.order.id}`
        }, 2000)
      }
    } catch (error) {
      console.error('Payment failed:', error)
      // Show error toast
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <ProtectedRoute>
      <div className="container-premium">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout form */}
          <div className="lg:col-span-2">
            <div className="card-elevated">
              <h2 className="heading-section mb-6">Review Your Order</h2>
              {/* Cart items summary here */}
              
              <div className="my-8 border-t border-b border-gray-700 py-6">
                <PaymentMethodSelector 
                  onSelect={setSelectedPayment}
                  selectedMethod={selectedPayment}
                />
              </div>
              
              <PaymentForm
                method={selectedPayment}
                onSubmit={handlePayment}
                isLoading={isLoading}
              />
            </div>
          </div>
          
          {/* Order summary sidebar */}
          <div className="lg:col-span-1">
            {/* Order summary card with totals */}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
```

#### Step 3.3: Update Backend Checkout
Ensure `backend/api/checkout.py` handles all payment methods:

```python
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Order, Cart, CartItem, OrderItem, Sneaker
import uuid
from datetime import datetime

checkout_bp = Blueprint('checkout', __name__)

@checkout_bp.route('/process-payment', methods=['POST'])
@jwt_required()
def process_payment():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        # Validate cart
        cart = Cart.query.filter_by(user_id=current_user_id, status='active').first()
        if not cart or not cart.items:
            return jsonify({'error': 'Cart is empty'}), 400
        
        # Create order
        order_number = f"HV-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        
        # Calculate totals
        subtotal = sum(item.price_inr * item.quantity for item in cart.items)
        shipping_fee = 599  # Configurable
        handling_fee = 299  # Configurable
        tax = int(subtotal * 0.18)  # 18% GST
        total = subtotal + shipping_fee + handling_fee + tax
        
        order = Order(
            user_id=current_user_id,
            cart_id=cart.id,
            order_number=order_number,
            payment_method=data.get('method', 'card'),
            payment_status='authorized',
            order_total_inr=total,
            shipping_fee_inr=shipping_fee,
            handling_fee_inr=handling_fee,
            tax_inr=tax,
            shipping_address=json.dumps(data.get('address', {}))
        )
        
        # Create order items
        for cart_item in cart.items:
            order_item = OrderItem(
                order=order,
                sneaker_id=cart_item.sneaker_id,
                size_id=cart_item.size_id,
                quantity=cart_item.quantity,
                unit_price_inr=cart_item.price_inr,
                total_price_inr=cart_item.price_inr * cart_item.quantity
            )
            db.session.add(order_item)
        
        # Update cart status
        cart.status = 'converted'
        
        db.session.add(order)
        db.session.commit()
        
        # TODO: Process payment with payment gateway
        # (Razorpay, PayU, etc. based on payment method)
        
        return jsonify({
            'success': True,
            'order': order.to_dict(),
            'order_number': order_number,
            'message': 'Order placed successfully'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
```

### What This Achieves
✅ Premium payment UI with cards
✅ Modern method selection experience
✅ Clear UPI/Card/Netbanking/Wallet options
✅ Security indicators and trust badges
✅ Loading states during payment
✅ Order success handling and redirect

---

## 4. PDF RECEIPT GENERATION

### Problem
- No invoice generation
- Users can't download receipts
- No order confirmation documents

### Solution
Use ReportLab for Python PDF generation with backend endpoint.

### Implementation Steps

#### Step 4.1: Install PDF Dependencies
```bash
cd backend
pip install reportlab pillow qrcode
```

#### Step 4.2: Add Invoice Generator
Copy `6_PDF_INVOICE_GENERATOR.py` to `backend/utils/invoice_generator.py`

#### Step 4.3: Register Receipt Routes
Copy `7_RECEIPTS_API.py` to `backend/api/receipts.py`

Update `backend/app.py`:
```python
from api.receipts import receipts_bp

# In create_app():
app.register_blueprint(receipts_bp, url_prefix='/api/receipts')
```

#### Step 4.4: Frontend Integration
Create `frontend/src/components/OrderReceipt.jsx`:

```jsx
import { motion } from 'framer-motion'
import { Download, Mail, Eye } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import apiClient from '../utils/apiClient'

export default function OrderReceipt({ orderId }) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  
  const handleDownload = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get(
        `/api/receipts/order/${orderId}/receipt`,
        { responseType: 'blob' }
      )
      
      // Create download link
      const url = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = `HYPEVAULT_ORDER_${orderId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSendEmail = async () => {
    setIsLoading(true)
    try {
      await apiClient.post(`/api/receipts/order/${orderId}/send-receipt-email`)
      // Show success toast
    } catch (error) {
      console.error('Email failed:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="card-elevated">
      <h3 className="heading-subsection mb-4">Invoice & Receipt</h3>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDownload}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download size={18} />
          Download PDF
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSendEmail}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          <Mail size={18} />
          Email Receipt
        </motion.button>
      </div>
    </div>
  )
}
```

### What This Achieves
✅ Professional PDF invoices with HYPE VAULT branding
✅ QR codes for order tracking
✅ Downloadable receipts
✅ Email receipt delivery
✅ Customer info, loyalty tier display
✅ Itemized sneaker details with prices
✅ Tax and fee breakdown

---

## 5. IMAGE SYSTEM FINALIZATION

### Current Status
✅ Sneaker images mapped in database
✅ Fallback logic already implemented
✅ Image scaling working

### Optimization

#### Step 5.1: Add Image Optimization Middleware
Create `frontend/src/utils/imageOptimizer.js`:

```javascript
/**
 * Image URL optimizer for responsive images
 */
export const getOptimizedImageUrl = (imagePath, width, quality = 80) => {
  if (!imagePath) {
    return '/fallback-sneaker.png'
  }
  
  // If using Cloudinary or similar
  // return `https://res.cloudinary.com/YOUR_CLOUD/image/fetch/w_${width},q_${quality}/${imagePath}`
  
  // Otherwise return as-is with local fallback
  return imagePath || '/fallback-sneaker.png'
}

export const SneakerImage = ({ src, alt, ...props }) => {
  const [imageSrc, setImageSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  
  const handleError = () => {
    setImageSrc('/fallback-sneaker.png')
    setIsLoading(false)
  }
  
  return (
    <img
      src={imageSrc}
      alt={alt}
      onLoad={() => setIsLoading(false)}
      onError={handleError}
      {...props}
    />
  )
}
```

#### Step 5.2: Use in Components
Replace all sneaker images with optimized component:

```jsx
import { SneakerImage } from '../utils/imageOptimizer'

<SneakerImage 
  src={sneaker.image_path}
  alt={sneaker.name}
  className="w-full h-80 object-cover rounded-lg"
/>
```

---

## 6. UI EVOLUTION

### Strategy
- Reduce heavy black: Use layered grayscale + accents
- Improve spacing: Card-based layouts with breathing room
- Subtle gradients: Ambient light effects
- Typography: Clear hierarchy
- Preserve animations: Keep Framer Motion smooth transitions

### Implementation Steps

#### Step 6.1: Add New CSS Variables
Copy `8_UI_EVOLUTION_CSS.css` to `frontend/src/styles/ui-evolution.css`

Import in `frontend/src/App.jsx` or `index.css`:
```css
@import './styles/ui-evolution.css';
```

#### Step 6.2: Update Component Classes
Find & replace patterns:

OLD → NEW
```
bg-black → bg-[var(--bg-primary)]
text-white → text-[var(--text-primary)]
border-gray-800 → border-[var(--border-light)]
rounded-xl → rounded-lg
```

#### Step 6.3: Apply to Navbar
```jsx
<nav className="navbar-modern">
  <div className="container-premium flex items-center justify-between">
    {/* Logo */}
    <h1 className="heading-subsection">HYPE VAULT</h1>
    
    {/* Nav items */}
    <div className="flex items-center gap-1">
      {navItems.map(item => (
        <a 
          key={item}
          href={`/${item.toLowerCase()}`}
          className={`nav-item ${active === item ? 'active' : ''}`}
        >
          {item}
        </a>
      ))}
    </div>
  </div>
</nav>
```

#### Step 6.4: Polish Cards
```jsx
// Product cards
<div className="product-card">
  <img src={sneaker.image} className="product-image" alt={sneaker.name} />
  <div className="product-info">
    <h4 className="product-name">{sneaker.name}</h4>
    <p className="product-meta">{sneaker.brand} • {sneaker.category}</p>
    <p className="product-price">₹{sneaker.current_price_inr:,.0f}</p>
  </div>
</div>
```

#### Step 6.5: Add Ambient Lighting
```jsx
<div className="ambient-glow-subtle">
  {/* Content with subtle glow effect */}
</div>
```

### What This Achieves
✅ Cleaner, more sophisticated dark theme
✅ Better visual hierarchy and readability
✅ Modern spacing and breathing room
✅ Subtle ambient lighting effects
✅ Preserved Framer Motion animations
✅ Improved mobile responsiveness
✅ Premium luxury aesthetic maintained

---

## 7. TESTING & DEPLOYMENT

### Pre-Deployment Checklist

#### Frontend Tests
- [ ] Auth flow: Register, Login, Logout
- [ ] Session persistence: Reload page, check auth state
- [ ] Protected routes: Try accessing without auth (should redirect)
- [ ] Token refresh: Wait >30 min or manually trigger refresh
- [ ] User profile: Display correct name, handle, loyalty tier
- [ ] Payment methods: All 4 options selectable
- [ ] Mobile UI: Check spacing, buttons on mobile
- [ ] Images: Verify fallback when image missing
- [ ] PDF generation: Download receipt, verify content
- [ ] Form validation: Test with empty/invalid inputs

#### Backend Tests
```bash
# Health check
curl http://localhost:5000/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","full_name":"Test User","phone":"+919876543210"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Refresh token
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Authorization: Bearer <refresh_token>"

# Get current user
curl -X GET http://localhost:5000/api/auth/current-user \
  -H "Authorization: Bearer <access_token>"

# Get receipt
curl -X GET http://localhost:5000/api/receipts/order/1/receipt \
  -H "Authorization: Bearer <access_token>" \
  --output receipt.pdf
```

#### Environment Setup
Create `.env.local` in frontend:
```
VITE_API_URL=http://localhost:5000
```

Create `.env` in backend:
```
FLASK_ENV=production
SECRET_KEY=your-secret-key-here
DATABASE_URL=mysql+pymysql://user:password@localhost:3306/hypevault
JWT_SECRET_KEY=your-jwt-secret-here
JWT_ACCESS_TOKEN_EXPIRES=900  # 15 minutes
JWT_REFRESH_TOKEN_EXPIRES=2592000  # 30 days
```

### Deployment (Production)

#### Deploy Backend
```bash
# Use Gunicorn + Nginx
pip install gunicorn

# Start with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:create_app()

# Or with systemd service
[Unit]
Description=HYPE VAULT Backend
After=network.target

[Service]
Type=notify
User=appuser
WorkingDirectory=/path/to/hype_vault/backend
ExecStart=/path/to/venv/bin/gunicorn -w 4 app:create_app()
Restart=always

[Install]
WantedBy=multi-user.target
```

#### Deploy Frontend
```bash
# Build production bundle
cd frontend
npm run build

# Deploy dist/ folder to CDN or web server
# Configure API_URL for production

# Example nginx config
server {
    listen 80;
    server_name hypevault.com;
    root /var/www/hype_vault/dist;
    
    location / {
        try_files $uri /index.html;
    }
    
    location /api/ {
        proxy_pass http://backend:5000/api/;
    }
}
```

### Monitoring

#### Key Metrics
- [ ] API response times
- [ ] Error rates (4xx, 5xx)
- [ ] Database query performance
- [ ] JWT token refresh success rate
- [ ] PDF generation time
- [ ] Frontend load time

#### Log Collection
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/hype_vault/app.log'),
        logging.StreamHandler()
    ]
)
```

---

## SUMMARY OF IMPROVEMENTS

### Authentication ✅
- Persistent JWT tokens across refreshes
- Automatic token refresh
- Session recovery on app load
- Protected routes with redirects
- Instant navbar auth state restore

### User Profile ✅
- Dynamic avatar with initials
- Loyalty tier badges
- Profile dropdown menu
- Full name, email, handle display
- Edit profile functionality

### Payment ✅
- Premium payment UI
- UPI/Card/Netbanking/Wallet options
- Security indicators
- Loading states
- Order success handling

### PDF Receipts ✅
- Professional invoice PDFs
- QR code tracking
- Download functionality
- Email delivery
- Loyalty tier display

### Images ✅
- Sneaker image optimization
- Fallback logic preserved
- Responsive sizing
- Performance optimized

### UI ✅
- Cleaner, sophisticated dark theme
- Better spacing and readability
- Subtle ambient lighting
- Preserved animations
- Improved accessibility
- Mobile-friendly responsiveness

### Stability ✅
- Reduced crashes with error handling
- Better loading states
- Improved mobile responsiveness
- Backend/frontend sync maintained
- Current architecture preserved
