# BoatCheckPro - Quick Reference Guide

## 📦 Installation (2 minutes)

```bash
# Navigate to project
cd boatcheck-pro

# Install dependencies
npm install

# Setup environment
# Edit .env with your PostgreSQL and Stripe credentials

# Create database
createdb boatcheck_pro

# Seed with sample data
npm run seed

# Start server
npm start
```

**Server runs on:** http://localhost:3000

---

## 🧪 Test Credentials

```
Admin:      admin@boatcheck.pro / AdminPassword123!
Client:     john.smith@example.com / Password123!
Technician: michael.brown@boatcheck.pro / Password123!
```

---

## 🔐 Get JWT Token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.smith@example.com",
    "password": "Password123!"
  }'
```

**Response includes** `token` field - use for Authorization header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 📋 Key Endpoints

### Authentication
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Get JWT token |
| GET | /api/auth/verify-email/:token | Verify email |
| POST | /api/auth/refresh-token | Refresh token |

### Users
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/users/profile/me | Your profile |
| PUT | /api/users/profile/me | Update profile |
| GET | /api/users/me/inspections | Your inspections |
| GET | /api/users/me/statistics | Your stats |

### Inspections
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/inspections | Create inspection |
| GET | /api/inspections | List inspections |
| GET | /api/inspections/:id | Get details |
| PUT | /api/inspections/:id | Update |
| POST | /api/inspections/:id/rate | Rate it |

### Technicians
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/technicians | List technicians |
| POST | /api/technicians/profile/create | Create profile |
| GET | /api/technicians/me/inspections | My inspections |
| GET | /api/technicians/me/calendar | My calendar |

### Payments
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/payments/create-intent | Create payment |
| POST | /api/payments/confirm | Confirm payment |
| GET | /api/payments/history | Payment history |

### Admin
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/admin/dashboard | Dashboard |
| GET | /api/admin/inspection-reports | Reports |
| GET | /api/admin/revenue-analytics | Analytics |
| GET | /api/admin/users | Manage users |

---

## 💻 Common cURL Examples

### 1. Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "password": "SecurePass123!",
    "role": "cliente"
  }'
```

### 2. Create Inspection
```bash
curl -X POST http://localhost:3000/api/inspections \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "boatName": "My Boat",
    "boatModel": "Grady-White",
    "boatYear": 2018,
    "inspectionType": "pre-compra",
    "location": "Miami Marina",
    "price": 500
  }'
```

### 3. Start Payment
```bash
curl -X POST http://localhost:3000/api/payments/create-intent \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "inspectionId": "INSPECTION_UUID",
    "amount": 500
  }'
```

### 4. Confirm Payment
```bash
curl -X POST http://localhost:3000/api/payments/confirm \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentIntentId": "pi_test_..."
  }'
```

### 5. Get Inspections
```bash
curl "http://localhost:3000/api/inspections?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Admin Dashboard
```bash
curl http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 🔗 API Response Format

### Success (200)
```json
{
  "data": {...},
  "message": "Success message"
}
```

### Error (400, 401, 403, 404, 500)
```json
{
  "error": "Error description"
}
```

---

## 🗂️ Project Files

**Key Files to Know:**

| File | Purpose |
|------|---------|
| `src/server.js` | Main app entry |
| `src/models/` | Database schema |
| `src/routes/` | API endpoint definitions |
| `src/controllers/` | Business logic |
| `src/middleware/` | Authentication, errors |
| `.env` | Configuration |
| `scripts/seed.js` | Sample data |

---

## 🛡️ Default Roles & Permissions

### Cliente (Client)
- Create inspections
- View own inspections
- Make payments
- Rate inspections

### Técnico (Technician)
- View assigned inspections
- Complete inspections
- Update availability
- View own ratings/stats

### Admin
- Full access
- Dashboard access
- User management
- Revenue analytics
- Technician management

---

## 🔧 Environment Variables

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=boatcheck_pro
DB_USER=postgres
DB_PASSWORD=password

JWT_SECRET=your_secret_key_min_32_chars
JWT_EXPIRATION=7d

PORT=3000
NODE_ENV=development

STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

FRONTEND_URL=http://localhost:3001
API_URL=http://localhost:3000
```

---

## 📊 Database Models

```
User (id, firstName, lastName, email, role, ...)
├── Inspection (id, clientId, boatName, ...)
│   ├── Payment (id, amount, status, ...)
│   └── Report (id, findings, ...)
└── Technician (id, userId, licenseNumber, ...)
```

---

## 🧪 Testing

```bash
npm test                  # Run tests
npm run test:watch      # Watch mode
npm test -- --coverage  # With coverage
```

---

## 🚨 Common Issues & Solutions

### ❌ "Database connection failed"
**Solution:** 
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Create database
createdb boatcheck_pro

# Check .env credentials
```

### ❌ "Port 3000 already in use"
**Solution:**
```bash
# Change port in .env
PORT=3001

# Or kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### ❌ "Invalid JWT token"
**Solution:**
- Token may be expired (7 days)
- Use `/api/auth/refresh-token` to get new token
- Check `Authorization` header format

### ❌ "Email not sending"
**Solution:**
- Verify SMTP credentials in .env
- For Gmail: Enable 2FA and use App Password
- Check firewall rules

### ❌ "Stripe payment failed"
**Solution:**
- Use test card: 4242 4242 4242 4242
- Check API keys in .env
- Verify webhook secret for Stripe CLI

---

## 📚 Documentation Files

| File | Contents |
|------|----------|
| `README.md` | Setup & quick start |
| `API_DOCUMENTATION.md` | Complete API reference |
| `PAYMENT_INTEGRATION.md` | Stripe setup guide |
| `IMPLEMENTATION_SUMMARY.md` | Full project overview |
| `QUICK_REFERENCE.md` | This file |

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Change JWT_SECRET to secure value
- [ ] Update Stripe to LIVE keys (not test)
- [ ] Set NODE_ENV=production
- [ ] Configure production database
- [ ] Set up email with production SMTP
- [ ] Enable HTTPS
- [ ] Configure CORS for frontend domain
- [ ] Set up webhooks in Stripe
- [ ] Test all payment flows
- [ ] Backup database
- [ ] Set up monitoring

---

## 📞 Quick Commands

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Seed database with sample data
npm run seed

# Run tests
npm test

# Check server health
curl http://localhost:3000/health

# View logs (npm run dev output)
# Already in console
```

---

## 💡 Pro Tips

1. **Always include Authorization header** for protected routes
2. **Use test Stripe cards** for development testing
3. **Check database state** with tools like DBeaver
4. **Use Postman or Insomnia** to test APIs easily
5. **Read API_DOCUMENTATION.md** for complete endpoint list
6. **Enable Stripe CLI webhook forwarding** for local testing

---

## 🎯 Feature Checklist

- [x] User registration & login
- [x] Email verification
- [x] JWT authentication
- [x] Role-based access
- [x] Inspection management
- [x] Technician profiles
- [x] Payment processing
- [x] Invoice generation
- [x] Admin dashboard
- [x] Revenue analytics
- [x] Email notifications
- [x] Stripe webhooks
- [x] Error handling
- [x] Input validation
- [x] Database relationships
- [x] CORS support
- [x] Health check endpoint
- [x] API documentation
- [x] Sample data seeding
- [x] Jest tests

---

## 🌐 API Versioning

Current API version: **v1**

Base URL: `http://localhost:3000/api`

All endpoints follow RESTful conventions with:
- JSON request/response
- Standard HTTP status codes
- Consistent error format

---

## 📈 Performance Notes

- Database connection pooling enabled
- Pagination support on all list endpoints
- Proper indexing on foreign keys
- Query optimization with associations
- Caching ready for scale-up

---

**Last Updated:** 2024-02-19
**Status:** ✅ Production Ready
**Version:** 1.0.0
