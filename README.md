# BoatCheckPro - Backend SaaS API

A complete backend SaaS solution for managing boat inspections. Built with Node.js, Express, PostgreSQL, and Stripe integration.

## 🎯 Features

- **User Authentication**: Register, login, JWT tokens, email verification
- **Role-based Access Control**: Client, Technician, and Admin roles
- **Inspection Management**: Create, schedule, and track boat inspections
- **Payment Integration**: Stripe integration with webhooks
- **Technician Management**: Profiles, ratings, availability scheduling
- **Admin Dashboard**: Analytics, revenue reports, user management
- **Email Notifications**: Verification, invoice, and inspection updates
- **RESTful API**: Complete API documentation included

## 🛠️ Tech Stack

- **Runtime**: Node.js (v22+)
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Payments**: Stripe API
- **Email**: Nodemailer
- **Validation**: express-validator
- **Security**: Helmet, bcryptjs
- **Testing**: Jest, Supertest

## 📋 Prerequisites

- Node.js 22.x or higher
- PostgreSQL 12+
- npm or yarn
- Stripe account (for payment processing)
- Gmail account or SMTP server (for email)

## 🚀 Installation

1. **Clone the repository** (or extract the project files)
   ```bash
   cd boatcheck-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up PostgreSQL database**
   ```bash
   createdb boatcheck_pro
   # Update .env with your DB credentials
   ```

5. **Seed the database with sample data**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

The server should now be running on `http://localhost:3000`

## 📁 Project Structure

```
boatcheck-pro/
├── src/
│   ├── config/          # Database configuration
│   ├── models/          # Database models (User, Inspection, Payment, etc.)
│   ├── routes/          # API route definitions
│   ├── controllers/      # Business logic for each endpoint
│   ├── middleware/      # Authentication, error handling
│   ├── utils/           # Helper functions (email, invoices)
│   ├── services/        # Service layer (to be extended)
│   └── server.js        # Express app initialization
├── scripts/
│   └── seed.js          # Database seeding script
├── __tests__/
│   └── auth.test.js     # Basic authentication tests
├── .env                 # Environment configuration
├── package.json         # Dependencies
├── jest.config.js       # Jest testing configuration
├── API_DOCUMENTATION.md # Complete API reference
└── README.md           # This file
```

## 🔐 Environment Configuration

Create a `.env` file with the following variables:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=boatcheck_pro
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_very_long_secret_key_min_32_chars
JWT_EXPIRATION=7d

# Server
PORT=3000
NODE_ENV=development

# Stripe
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLIC_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_key

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# URLs
FRONTEND_URL=http://localhost:3001
API_URL=http://localhost:3000

# Admin
ADMIN_EMAIL=admin@boatcheck.pro
ADMIN_PASSWORD=SecureAdminPassword123!
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

Current test coverage includes:
- Authentication (register, login, logout)
- Basic error handling
- Database model operations

## 📚 API Documentation

For complete API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Quick API Examples

#### Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePassword123!",
    "role": "cliente"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'
```

#### Create an Inspection (requires token)
```bash
curl -X POST http://localhost:3000/api/inspections \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "boatName": "Seabreeze",
    "boatModel": "Grady-White 25",
    "boatYear": 2018,
    "inspectionType": "pre-compra",
    "location": "Miami Marina",
    "price": 450.00
  }'
```

## 🔑 Test Credentials

After running the seed script, use these credentials to test:

| Role       | Email                          | Password          |
|------------|--------------------------------|-------------------|
| Admin      | admin@boatcheck.pro            | AdminPassword123! |
| Client     | john.smith@example.com         | Password123!      |
| Client     | sarah.j@example.com            | Password123!      |
| Technician | michael.brown@boatcheck.pro    | Password123!      |
| Technician | david.garcia@boatcheck.pro     | Password123!      |

## 🚀 API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/verify-email/:token` - Verify email address
- `POST /api/auth/refresh-token` - Get a new token

### Users
- `GET /api/users/profile/me` - Get current user profile
- `PUT /api/users/profile/me` - Update user profile
- `GET /api/users/me/inspections` - Get user's inspections
- `GET /api/users/me/statistics` - Get user statistics

### Inspections
- `POST /api/inspections` - Create new inspection
- `GET /api/inspections` - List inspections
- `GET /api/inspections/:id` - Get inspection details
- `PUT /api/inspections/:id` - Update inspection
- `POST /api/inspections/:id/rate` - Rate completed inspection
- `POST /api/inspections/:id/complete` - Mark as completed

### Technicians
- `GET /api/technicians` - List available technicians
- `POST /api/technicians/profile/create` - Create technician profile
- `PUT /api/technicians/profile/update` - Update technician info
- `GET /api/technicians/me/inspections` - Get assigned inspections
- `GET /api/technicians/me/calendar` - Get monthly calendar

### Payments
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/history` - Get payment history
- `POST /api/payments/webhook` - Stripe webhook handler

### Admin
- `GET /api/admin/dashboard` - Admin dashboard overview
- `GET /api/admin/system-metrics` - System metrics
- `GET /api/admin/inspection-reports` - Inspection reports
- `GET /api/admin/revenue-analytics` - Revenue analytics
- `GET /api/admin/technicians` - Manage technicians
- `GET /api/admin/users` - Manage users

## 🔐 Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Role-based access control (RBAC)
- Email verification for account activation
- CORS protection
- Helmet.js for HTTP security headers
- Stripe webhook signature verification
- Input validation and sanitization

## 📊 Database Schema

The application includes 5 main models:

1. **User** - Users (clients, technicians, admins)
2. **Inspection** - Boat inspection requests and history
3. **Payment** - Payment records and invoices
4. **Technician** - Technician profiles with ratings
5. **Report** - Detailed inspection reports

See models in `src/models/` directory for complete schema.

## 🚦 Health Check

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-02-19T23:51:00.000Z"
}
```

## 🛠️ Development

### Code Style
- Use ES6+ features
- Follow the existing project structure
- Use async/await for asynchronous operations
- Include proper error handling

### Adding New Endpoints

1. Create a controller in `src/controllers/`
2. Add routes in `src/routes/`
3. Update API documentation
4. Add tests in `__tests__/`

### Database Migrations

The project uses Sequelize ORM with automatic model synchronization. For development, models are auto-synced with `alter: true`. For production, use proper migration tools.

## 📧 Email Configuration

### Gmail Setup
1. Enable 2-factor authentication on your Gmail account
2. Create an App Password (not your regular password)
3. Use the App Password in `EMAIL_PASSWORD` in `.env`

### Other SMTP Servers
Update `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, and `EMAIL_PASSWORD` in `.env`

## 💳 Stripe Integration

1. Get API keys from [Stripe Dashboard](https://dashboard.stripe.com)
2. Add keys to `.env`
3. Set up webhook for payment events:
   - Endpoint: `https://yourapi.com/api/payments/webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

## 🐛 Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists: `createdb boatcheck_pro`

### Email Not Sending
- Verify SMTP credentials
- Check email account security settings
- Enable "Less secure app access" (for Gmail)

### Stripe Webhook Errors
- Verify webhook secret is correct
- Ensure request signature validation passes
- Check Stripe webhook logs in dashboard

## 📝 License

This project is proprietary and confidential.

## 👨‍💻 Support

For issues or questions, contact: support@boatcheck.pro

## 🎉 Getting Started

1. Install dependencies: `npm install`
2. Configure `.env` file
3. Seed database: `npm run seed`
4. Start server: `npm run dev`
5. Visit: http://localhost:3000/health
6. Read: API_DOCUMENTATION.md for complete API reference

---

**BoatCheckPro** - Professional boat inspection management system
