# BoatCheckPro API Documentation

## Overview
BoatCheckPro is a complete SaaS backend for managing boat inspections. It provides REST APIs for authentication, user management, inspections, payments, and admin features.

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. Authentication (`/auth`)

#### Register
```
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "role": "cliente" // or "tecnico"
}

Response: 201
{
  "message": "User registered successfully",
  "user": { ... },
  "token": "eyJhbGc..."
}
```

#### Login
```
POST /auth/login
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}

Response: 200
{
  "message": "Login successful",
  "user": { ... },
  "token": "eyJhbGc..."
}
```

#### Verify Email
```
GET /auth/verify-email/:token
Response: 200
{
  "message": "Email verified successfully"
}
```

#### Resend Verification Email
```
POST /auth/resend-verification
{
  "email": "john@example.com"
}
Response: 200
{
  "message": "Verification email sent"
}
```

#### Refresh Token
```
POST /auth/refresh-token
Headers: Authorization: Bearer <token>
Response: 200
{
  "token": "new_jwt_token"
}
```

---

### 2. Users (`/users`)

#### Get My Profile
```
GET /users/profile/me
Headers: Authorization: Bearer <token>
Response: 200
{
  "user": { ... }
}
```

#### Update My Profile
```
PUT /users/profile/me
Headers: Authorization: Bearer <token>
{
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "305-555-0000",
  "address": "123 Main St",
  "city": "Miami",
  "state": "FL",
  "zipCode": "33139",
  "country": "USA",
  "companyName": "My Company"
}
Response: 200
{
  "message": "Profile updated successfully",
  "user": { ... }
}
```

#### Get My Inspections
```
GET /users/me/inspections?page=1&limit=10&status=completada
Headers: Authorization: Bearer <token>
Response: 200
{
  "inspections": [ ... ],
  "pagination": { ... }
}
```

#### Get My Statistics
```
GET /users/me/statistics
Headers: Authorization: Bearer <token>
Response: 200
{
  "statistics": {
    "totalInspections": 5,
    "completedInspections": 3,
    "pendingInspections": 2,
    "inspectionsByType": [ ... ]
  }
}
```

#### Get All Users (Admin)
```
GET /users?role=cliente&page=1&limit=10&search=john
Headers: Authorization: Bearer <admin_token>
Response: 200
{
  "users": [ ... ],
  "pagination": { ... }
}
```

#### Update User (Admin)
```
PUT /users/:id
Headers: Authorization: Bearer <admin_token>
{
  "firstName": "John",
  "lastName": "Smith",
  "role": "tecnico",
  "isActive": true
}
Response: 200
{
  "message": "User updated successfully",
  "user": { ... }
}
```

#### Delete User (Admin)
```
DELETE /users/:id
Headers: Authorization: Bearer <admin_token>
Response: 200
{
  "message": "User deleted successfully"
}
```

---

### 3. Inspections (`/inspections`)

#### Create Inspection
```
POST /inspections
Headers: Authorization: Bearer <token>
{
  "boatName": "Seabreeze",
  "boatModel": "Grady-White 25",
  "boatYear": 2018,
  "inspectionType": "pre-compra", // pre-compra, mantenimiento, seguridad, anual, otro
  "description": "Pre-purchase inspection",
  "location": "Miami Marina",
  "scheduledDate": "2024-03-15",
  "price": 450.00
}
Response: 201
{
  "message": "Inspection created successfully",
  "inspection": { ... }
}
```

#### List Inspections
```
GET /inspections?page=1&limit=10&status=completada&inspectionType=pre-compra
Headers: Authorization: Bearer <token>
Response: 200
{
  "inspections": [ ... ],
  "pagination": { ... }
}
```

#### Get Inspection Details
```
GET /inspections/:id
Headers: Authorization: Bearer <token>
Response: 200
{
  "inspection": { ... }
}
```

#### Update Inspection
```
PUT /inspections/:id
Headers: Authorization: Bearer <token>
{
  "boatName": "Seabreeze",
  "status": "confirmada",
  "scheduledDate": "2024-03-20"
}
Response: 200
{
  "message": "Inspection updated successfully",
  "inspection": { ... }
}
```

#### Assign Technician (Admin)
```
POST /inspections/:id/assign-technician
Headers: Authorization: Bearer <admin_token>
{
  "technicianId": "uuid-of-technician"
}
Response: 200
{
  "message": "Technician assigned successfully",
  "inspection": { ... }
}
```

#### Complete Inspection
```
POST /inspections/:id/complete
Headers: Authorization: Bearer <tecnico_token>
Response: 200
{
  "message": "Inspection completed",
  "inspection": { ... }
}
```

#### Rate Inspection
```
POST /inspections/:id/rate
Headers: Authorization: Bearer <client_token>
{
  "rating": 4.5,
  "comment": "Great service, very professional"
}
Response: 200
{
  "message": "Inspection rated successfully",
  "inspection": { ... }
}
```

#### Cancel Inspection
```
POST /inspections/:id/cancel
Headers: Authorization: Bearer <admin_token>
Response: 200
{
  "message": "Inspection cancelled",
  "inspection": { ... }
}
```

#### Delete Inspection
```
DELETE /inspections/:id
Headers: Authorization: Bearer <token>
Response: 200
{
  "message": "Inspection deleted successfully"
}
```

---

### 4. Technicians (`/technicians`)

#### List Technicians (Public)
```
GET /technicians?page=1&limit=10&specialization=Motor&minRating=4.5&search=michael&city=Miami
Response: 200
{
  "technicians": [ ... ],
  "pagination": { ... }
}
```

#### Get Technician Profile (Public)
```
GET /technicians/:id
Response: 200
{
  "technician": { ... }
}
```

#### Create Technician Profile
```
POST /technicians/profile/create
Headers: Authorization: Bearer <tecnico_token>
{
  "licenseNumber": "LIC-2024-001",
  "licenseExpiry": "2026-12-31",
  "specialization": "Motor Boats",
  "yearsOfExperience": 8,
  "certifications": ["ABYC", "Marine Survey"],
  "bio": "Experienced motor boat inspector",
  "hourlyRate": 150,
  "weeklySchedule": { "monday": ["09:00-17:00"], ... },
  "serviceArea": ["Miami", "Miami Beach", "Coral Gables"]
}
Response: 201
{
  "message": "Technician profile created",
  "technician": { ... }
}
```

#### Update Technician Profile
```
PUT /technicians/profile/update
Headers: Authorization: Bearer <tecnico_token>
{
  "specialization": "Motor Boats",
  "bio": "Updated bio",
  "isAvailable": true
}
Response: 200
{
  "message": "Technician profile updated",
  "technician": { ... }
}
```

#### Get My Inspections (Technician)
```
GET /technicians/me/inspections?page=1&limit=10&status=confirmada
Headers: Authorization: Bearer <tecnico_token>
Response: 200
{
  "inspections": [ ... ],
  "pagination": { ... }
}
```

#### Get My Statistics (Technician)
```
GET /technicians/me/statistics
Headers: Authorization: Bearer <tecnico_token>
Response: 200
{
  "statistics": {
    "totalInspections": 45,
    "completedInspections": 42,
    "upcomingInspections": 2,
    "pendingInspections": 1,
    "averageRating": 4.8,
    "inspectionsByType": [ ... ]
  }
}
```

#### Update Availability
```
PUT /technicians/me/availability
Headers: Authorization: Bearer <tecnico_token>
{
  "isAvailable": true,
  "weeklySchedule": {
    "monday": ["09:00-17:00"],
    "tuesday": ["09:00-17:00"],
    ...
  }
}
Response: 200
{
  "message": "Availability updated",
  "technician": { ... }
}
```

#### Get Calendar
```
GET /technicians/me/calendar?month=3&year=2024
Headers: Authorization: Bearer <tecnico_token>
Response: 200
{
  "month": 3,
  "year": 2024,
  "inspections": [ ... ]
}
```

---

### 5. Payments (`/payments`)

#### Create Payment Intent
```
POST /payments/create-intent
Headers: Authorization: Bearer <token>
{
  "inspectionId": "uuid",
  "amount": 450.00
}
Response: 200
{
  "message": "Payment intent created",
  "clientSecret": "pi_test_secret",
  "payment": { ... }
}
```

#### Confirm Payment
```
POST /payments/confirm
Headers: Authorization: Bearer <token>
{
  "paymentIntentId": "pi_test_001"
}
Response: 200
{
  "message": "Payment confirmed successfully",
  "payment": { ... },
  "invoiceUrl": "https://..."
}
```

#### Get Payment History
```
GET /payments/history?page=1&limit=10&status=completado
Headers: Authorization: Bearer <token>
Response: 200
{
  "payments": [ ... ],
  "pagination": { ... }
}
```

#### Get Payment Details
```
GET /payments/:id
Headers: Authorization: Bearer <token>
Response: 200
{
  "payment": { ... }
}
```

#### Refund Payment (Admin)
```
POST /payments/:id/refund
Headers: Authorization: Bearer <admin_token>
Response: 200
{
  "message": "Refund processed successfully",
  "refundId": "re_test_001",
  "payment": { ... }
}
```

#### Get Revenue Stats (Admin)
```
GET /payments/admin/revenue-stats?startDate=2024-01-01&endDate=2024-12-31
Headers: Authorization: Bearer <admin_token>
Response: 200
{
  "totalRevenue": 15450.50,
  "paymentCount": 32,
  "averagePayment": 482.52,
  "paymentsByStatus": [ ... ]
}
```

#### Stripe Webhook
```
POST /payments/webhook
Content-Type: application/json
X-Stripe-Signature: <signature>

{ webhook payload from Stripe }

Response: 200
{
  "received": true
}
```

---

### 6. Admin (`/admin`)

#### Get Dashboard
```
GET /admin/dashboard
Headers: Authorization: Bearer <admin_token>
Response: 200
{
  "dashboard": {
    "users": { "total": 45, "clients": 30, "technicians": 15 },
    "inspections": { "total": 127, "completed": 95, "pending": 20, "inProgress": 12 },
    "revenue": { "total": 45230.50 },
    "recentInspections": [ ... ]
  }
}
```

#### Get System Metrics
```
GET /admin/system-metrics
Headers: Authorization: Bearer <admin_token>
Response: 200
{
  "metrics": {
    "totalUsers": 45,
    "activeUsers": 42,
    "totalInspections": 127,
    "thisMonthInspections": 23,
    "completionRate": 74.8,
    "systemHealth": "operational"
  }
}
```

#### Get All Technicians (Admin)
```
GET /admin/technicians?page=1&limit=10&isAvailable=true
Headers: Authorization: Bearer <admin_token>
Response: 200
{
  "technicians": [ ... ],
  "pagination": { ... }
}
```

#### Manage Technician
```
PUT /admin/technicians/:id
Headers: Authorization: Bearer <admin_token>
{
  "isAvailable": true,
  "specialization": "Sailing Yachts",
  "hourlyRate": 180
}
Response: 200
{
  "message": "Technician updated",
  "technician": { ... }
}
```

#### Get Inspection Reports
```
GET /admin/inspection-reports?status=completada&startDate=2024-01-01&page=1&limit=10
Headers: Authorization: Bearer <admin_token>
Response: 200
{
  "inspections": [ ... ],
  "inspectionsByType": [ ... ],
  "pagination": { ... }
}
```

#### Get Revenue Analytics
```
GET /admin/revenue-analytics?startDate=2024-01-01&endDate=2024-12-31
Headers: Authorization: Bearer <admin_token>
Response: 200
{
  "totalRevenue": 45230.50,
  "paymentCount": 95,
  "averagePayment": 476.11,
  "revenueByInspectionType": [ ... ],
  "monthlyRevenue": [ ... ]
}
```

#### Get User Management
```
GET /admin/users?role=cliente&page=1&limit=10&search=john
Headers: Authorization: Bearer <admin_token>
Response: 200
{
  "users": [ ... ],
  "pagination": { ... }
}
```

#### Deactivate User
```
POST /admin/users/:id/deactivate
Headers: Authorization: Bearer <admin_token>
Response: 200
{
  "message": "User deactivated",
  "user": { ... }
}
```

#### Activate User
```
POST /admin/users/:id/activate
Headers: Authorization: Bearer <admin_token>
Response: 200
{
  "message": "User activated",
  "user": { ... }
}
```

---

## Error Handling

All errors return appropriate HTTP status codes with error messages:

```
{
  "error": "Error message description"
}
```

Common status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

---

## Data Models

### User
- `id`: UUID (primary key)
- `firstName`: String
- `lastName`: String
- `email`: String (unique)
- `password`: String (hashed)
- `phone`: String
- `role`: Enum (cliente, tecnico, admin)
- `emailVerified`: Boolean
- `isActive`: Boolean
- `createdAt`: Date
- `updatedAt`: Date

### Inspection
- `id`: UUID
- `clientId`: UUID (foreign key)
- `technicianId`: UUID (foreign key, nullable)
- `boatName`: String
- `boatModel`: String
- `boatYear`: Integer
- `inspectionType`: Enum
- `status`: Enum
- `price`: Decimal
- `scheduledDate`: Date
- `completedDate`: Date
- `rating`: Decimal (1-5)
- `createdAt`: Date

### Payment
- `id`: UUID
- `inspectionId`: UUID (foreign key)
- `userId`: UUID (foreign key)
- `amount`: Decimal
- `currency`: String
- `stripePaymentIntentId`: String
- `status`: Enum
- `invoiceNumber`: String
- `paidAt`: Date
- `createdAt`: Date

### Technician
- `id`: UUID
- `userId`: UUID (foreign key, unique)
- `licenseNumber`: String
- `specialization`: String
- `yearsOfExperience`: Integer
- `averageRating`: Decimal
- `totalInspections`: Integer
- `isAvailable`: Boolean
- `hourlyRate`: Decimal

---

## Testing

Use the included test data or Postman to test endpoints. Sample credentials:

```
Admin: admin@boatcheck.pro / AdminPassword123!
Client: john.smith@example.com / Password123!
Technician: michael.brown@boatcheck.pro / Password123!
```

---

## Installation & Setup

1. Install dependencies: `npm install`
2. Configure `.env` with database and Stripe credentials
3. Run migrations: Already handled by Sequelize sync
4. Seed database: `npm run seed`
5. Start server: `npm start` (or `npm run dev` for development)

---

## Notes

- JWT tokens expire in 7 days (configurable in `.env`)
- Email verification required for account activation
- Stripe webhook signature verification is required for payment updates
- All dates are in ISO 8601 format (UTC)
