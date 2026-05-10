/**
 * HYPE VAULT STABILIZATION QUICK-START CHECKLIST
 * Print this out and check off items as you complete them
 * Estimated time: 2-3 days for complete implementation
 */

# PHASE 1: AUTHENTICATION (Priority: CRITICAL) - Est. 4 hours

## Frontend Setup
- [ ] Create `frontend/src/context/AuthContext.jsx` from file 1
- [ ] Create `frontend/src/utils/apiClient.js` from file 2
- [ ] Create `frontend/src/components/ProtectedRoutes.jsx` from file 3
- [ ] Install axios: `npm install axios`
- [ ] Wrap App with `<AuthProvider>` in main.jsx
- [ ] Create environment file: `frontend/.env.local`
  ```
  VITE_API_URL=http://localhost:5000
  ```
- [ ] Test login: Register user, reload page, check if logged in
- [ ] Test logout: Verify localStorage cleared
- [ ] Test protected routes: Try accessing without auth

## Backend Verification
- [ ] Verify JWT endpoints are working:
  - [ ] POST /api/auth/register
  - [ ] POST /api/auth/login
  - [ ] POST /api/auth/refresh
  - [ ] GET /api/auth/current-user
- [ ] Check JWT token expiry in config.py (15-30 min for access)
- [ ] Verify CORS is enabled for frontend URL

## Status: ________________
Start Time: _________ Completion Time: _________


---

# PHASE 2: USER PROFILE SYSTEM (Priority: HIGH) - Est. 3 hours

## Frontend Components
- [ ] Create `frontend/src/components/UserProfile.jsx` from file 4
- [ ] Add `UserProfileMenu` to existing navbar
- [ ] Add `UserAvatar` component to navbar
- [ ] Create `/profile` route with `ProfileCard`
- [ ] Create Profile page: `frontend/src/pages/ProfilePage.jsx`
- [ ] Test profile menu: Click on avatar, verify options
- [ ] Test loyalty tier display: Check color coding
- [ ] Test profile load: Refresh page, verify user info persists

## Backend Integration (Already exists!)
- [ ] Verify User model has all fields:
  - [ ] full_name
  - [ ] email
  - [ ] phone
  - [ ] profile_handle
  - [ ] loyalty_tier
- [ ] Test GET /api/auth/current-user returns complete user
- [ ] Test PUT /api/auth/profile updates user fields

## Status: ________________
Start Time: _________ Completion Time: _________


---

# PHASE 3: PAYMENT POLISH (Priority: HIGH) - Est. 3 hours

## Frontend Components
- [ ] Create `frontend/src/components/PaymentMethod.jsx` from file 5
- [ ] Create `frontend/src/pages/CheckoutPage.jsx` with payment flow
- [ ] Add to checkout:
  - [ ] Cart summary
  - [ ] `PaymentMethodSelector` component
  - [ ] `PaymentForm` component (based on selected method)
  - [ ] Order total display (subtotal + shipping + tax)
- [ ] Test all 4 payment methods:
  - [ ] UPI - form shows UPI ID field
  - [ ] Card - form shows card fields
  - [ ] Netbanking - form shows bank selector
  - [ ] Wallet - form shows wallet selector
- [ ] Test security badge display
- [ ] Test responsive layout on mobile

## Backend Endpoint
- [ ] Create/verify POST /api/checkout/process-payment
- [ ] Implement payment method handling
- [ ] Calculate totals correctly (18% GST):
  - [ ] Subtotal from cart items
  - [ ] Add ₹599 shipping fee
  - [ ] Add ₹299 handling fee
  - [ ] Add 18% tax on subtotal
  - [ ] Total = subtotal + shipping + handling + tax
- [ ] Create Order record on success
- [ ] Create OrderItem records for cart items
- [ ] Mark cart as 'converted'

## Status: ________________
Start Time: _________ Completion Time: _________


---

# PHASE 4: PDF RECEIPTS (Priority: MEDIUM) - Est. 2 hours

## Backend Setup
- [ ] Install dependencies: `pip install reportlab pillow qrcode`
- [ ] Create `backend/utils/invoice_generator.py` from file 6
- [ ] Create `backend/api/receipts.py` from file 7
- [ ] Register receipts blueprint in `backend/app.py`:
  ```python
  from api.receipts import receipts_bp
  app.register_blueprint(receipts_bp, url_prefix='/api/receipts')
  ```
- [ ] Test PDF generation:
  - [ ] POST /api/receipts/order/<id>/receipt (should download PDF)
  - [ ] GET /api/receipts/order/<id>/receipt-preview (should return base64)
  - [ ] POST /api/receipts/order/<id>/send-receipt-email (needs mail config)

## Frontend Integration
- [ ] Create `frontend/src/components/OrderReceipt.jsx`
- [ ] Add to order confirmation page:
  - [ ] Download PDF button
  - [ ] Email receipt button
  - [ ] View receipt inline option
- [ ] Test download: Click button, verify PDF downloads
- [ ] Open PDF: Verify formatting, customer info, order items
- [ ] Check QR code: Scan and verify it points to order tracking

## Status: ________________
Start Time: _________ Completion Time: _________


---

# PHASE 5: IMAGE OPTIMIZATION (Priority: LOW) - Est. 1 hour

## Frontend Setup
- [ ] Create `frontend/src/utils/imageOptimizer.js` from guide
- [ ] Create fallback image: `frontend/public/fallback-sneaker.png`
- [ ] Replace all sneaker image tags with `<SneakerImage>` component
- [ ] Test with missing image: Verify fallback displays
- [ ] Test with valid image: Verify image loads normally

## Status: ________________
Start Time: _________ Completion Time: _________


---

# PHASE 6: UI EVOLUTION (Priority: MEDIUM) - Est. 2 hours

## CSS Setup
- [ ] Create `frontend/src/styles/ui-evolution.css` from file 8
- [ ] Import in App.jsx or index.css
- [ ] Test CSS variables load properly
- [ ] Verify no conflicts with existing styles

## Component Updates (NO REWRITES!)
- [ ] Find & replace in components:
  - [ ] `bg-black` → Use `bg-[var(--bg-primary)]` or keep as is
  - [ ] Add `card-modern` to card elements
  - [ ] Add `product-card` to product listings
  - [ ] Update button classes to `btn-primary`, `btn-secondary`, etc.
  - [ ] Add `heading-*` classes to headings
  - [ ] Add `text-body`, `text-caption` to text

## Testing
- [ ] Test dark mode appearance
- [ ] Test responsive behavior on mobile
- [ ] Verify animations still work smoothly
- [ ] Check hover states on buttons/cards
- [ ] Test focus states for accessibility
- [ ] Verify color contrast (WCAG AA)

## Status: ________________
Start Time: _________ Completion Time: _________


---

# PHASE 7: FINAL TESTING & DEPLOYMENT (Priority: CRITICAL) - Est. 2 hours

## Frontend Testing
- [ ] Auth Flow Test
  - [ ] Register new user
  - [ ] Verify email unique constraint
  - [ ] Login with correct credentials
  - [ ] Try login with wrong password (should fail)
  - [ ] Logout
  - [ ] Try accessing protected page (should redirect)

- [ ] Session Persistence Test
  - [ ] Login
  - [ ] Refresh page (F5)
  - [ ] Verify still logged in
  - [ ] Close browser tab, reopen
  - [ ] Navigate back to site
  - [ ] Verify still logged in (cached profile shown)

- [ ] Profile Test
  - [ ] Click on user avatar
  - [ ] Verify dropdown menu shows
  - [ ] Verify name, handle, email display correct
  - [ ] Verify loyalty tier badge shows
  - [ ] Click "My Profile" → should navigate
  - [ ] Edit profile → update name
  - [ ] Verify profile updates in real-time

- [ ] Payment Test
  - [ ] Add items to cart
  - [ ] Go to checkout
  - [ ] Test all 4 payment methods (UI switch)
  - [ ] Fill in payment details
  - [ ] Submit payment
  - [ ] Verify order created in DB

- [ ] Receipt Test
  - [ ] After order, download PDF receipt
  - [ ] Verify PDF opens correctly
  - [ ] Check: HYPE VAULT branding, customer info, items, totals
  - [ ] Check: QR code present at bottom
  - [ ] Test email receipt (if mail configured)

- [ ] Mobile Test
  - [ ] Open on mobile/tablet
  - [ ] Check navbar responsive
  - [ ] Check payment form fields responsive
  - [ ] Check button sizes (min 44px touch target)
  - [ ] Check orientation change (landscape/portrait)

- [ ] Performance Test
  - [ ] Measure page load time
  - [ ] Check for console errors
  - [ ] Verify no memory leaks (DevTools)
  - [ ] Check image loading optimization

## Backend Testing
```bash
# Test all endpoints
curl -X GET http://localhost:5000/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","full_name":"Test","phone":"+919876543210"}'

# Login & get tokens
RESPONSE=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}')

ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.access_token')

# Get current user
curl -X GET http://localhost:5000/api/auth/current-user \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Test receipt generation
curl -X GET http://localhost:5000/api/receipts/order/1/receipt \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  --output test-receipt.pdf
```

## Database Verification
- [ ] Check users table for new registrations
- [ ] Check orders table for test orders
- [ ] Verify order items created
- [ ] Check loyalty tier assignments
- [ ] Verify JWT tokens have correct expiry

## Checklist
- [ ] All auth endpoints returning correct status codes
- [ ] All errors have descriptive messages
- [ ] Database transactions rollback on error
- [ ] No sensitive data in logs
- [ ] CORS headers correct for frontend

## Status: ________________
Start Time: _________ Completion Time: _________


---

# DEPLOYMENT CHECKLIST

## Pre-Production
- [ ] Set FLASK_ENV=production
- [ ] Change SECRET_KEY to random string
- [ ] Set JWT_SECRET_KEY to random string
- [ ] Update database URL to production DB
- [ ] Update VITE_API_URL to production API URL
- [ ] Run database migrations
- [ ] Build frontend: `npm run build`
- [ ] Test production bundle locally

## Security
- [ ] Enable HTTPS/SSL
- [ ] Set secure cookie flags
- [ ] Add CORS whitelist (specific domains only)
- [ ] Enable rate limiting on auth endpoints
- [ ] Add CSRF protection if needed
- [ ] Validate all user inputs
- [ ] Sanitize error messages (no internal details)

## Performance
- [ ] Enable gzip compression
- [ ] Configure caching headers
- [ ] Use CDN for static assets
- [ ] Optimize database indexes
- [ ] Set up connection pooling
- [ ] Monitor API response times

## Monitoring & Logs
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure structured logging
- [ ] Set up database backups
- [ ] Create uptime monitoring
- [ ] Set up alert notifications

## Status: ________________
Deployment Date: _________


---

# QUICK REFERENCE: IMPORTANT ENDPOINTS

## Auth Endpoints
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- POST /api/auth/refresh - Refresh access token
- GET /api/auth/current-user - Get authenticated user
- PUT /api/auth/profile - Update user profile

## Checkout Endpoints
- POST /api/checkout/process-payment - Process payment
- GET /api/receipts/order/<id>/receipt - Download PDF receipt
- GET /api/receipts/order/<id>/receipt-preview - Preview receipt as base64
- POST /api/receipts/order/<id>/send-receipt-email - Email receipt

## Frontend Routes
- /auth/login - Login page
- /auth/register - Register page
- /dashboard - User dashboard (protected)
- /profile - User profile (protected)
- /checkout - Checkout page (protected)
- /order/<id> - Order details page (protected)
- /receipts - My receipts (protected)


---

# NOTES & OBSERVATIONS

## What's Already Working ✅
- Database schema with User, Order, OrderItem tables
- JWT authentication endpoints (register, login, refresh, profile)
- Basic API structure with blueprints
- Cart and wishlist models
- Product catalog with images

## What We Added ✅
- Persistent JWT tokens in localStorage
- Automatic token refresh with queue management
- Protected routes with redirects
- User profile display components
- Premium payment method selector
- PDF receipt generation
- Enhanced UI CSS for minimalist luxury style

## Known Limitations
- Payment gateway integration not implemented (Razorpay, PayU, etc.)
- Email service not configured (needs Flask-Mail setup)
- No image CDN (uses local image paths)
- No advanced analytics/tracking
- No admin dashboard

## Future Enhancements
- Wishlist sharing/collaboration
- Price drop notifications
- AI-powered recommendations
- Seller dashboard for inventory
- Advanced search with filters
- Order tracking integration
- Customer reviews & ratings
- Loyalty rewards program
- Mobile app (React Native)


---

## TOTAL ESTIMATED TIME: 15-20 hours
## RECOMMENDED APPROACH: Complete one phase per day
## EXPECTED OUTCOME: Production-ready marketplace with modern auth, profiles, payments, and receipts

Good luck! 🚀
