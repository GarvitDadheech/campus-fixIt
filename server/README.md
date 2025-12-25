# Campus FixIt - Backend Server

A robust Node.js + Express + TypeScript backend for the Campus Issue Reporting System.

## Features

- **JWT Authentication** with access & refresh tokens
- **Role-based Authorization** (Student & Admin)
- **CRUD Operations** for issues
- **Image Upload** via Cloudinary
- **Email Notifications** on status changes
- **Push Notifications** via Firebase Cloud Messaging
- **Issue Priority Levels** (Low, Medium, High, Critical)
- **Issue Categories** (Electrical, Water, Internet, Infrastructure)
- **Status Tracking** (Open, In Progress, Resolved)
- **Pagination & Filtering** for all list endpoints
- **Input Validation** using Zod
- **Proper Error Handling** with custom error classes
- **Winston Logger** for structured logging
- **Nodemon** for development hot-reload

## Project Structure

```
server/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.ts   # MongoDB connection
│   │   ├── env.ts        # Environment variables
│   │   ├── cloudinary.ts # Cloudinary setup
│   │   └── firebase.ts   # Firebase Admin setup
│   ├── controllers/      # Route controllers
│   │   ├── auth.controller.ts
│   │   ├── issue.controller.ts
│   │   ├── admin.controller.ts
│   │   └── user.controller.ts
│   ├── middlewares/      # Express middlewares
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── upload.middleware.ts
│   │   └── validate.middleware.ts
│   ├── models/           # MongoDB models
│   │   ├── user.model.ts
│   │   └── issue.model.ts
│   ├── routes/           # API routes
│   │   ├── auth.routes.ts
│   │   ├── issue.routes.ts
│   │   ├── admin.routes.ts
│   │   └── user.routes.ts
│   ├── services/         # Business logic
│   │   ├── auth.service.ts
│   │   ├── issue.service.ts
│   │   ├── email.service.ts
│   │   ├── notification.service.ts
│   │   ├── upload.service.ts
│   │   └── user.service.ts
│   ├── types/            # TypeScript types
│   │   └── index.ts
│   ├── utils/            # Utility functions
│   │   ├── ApiError.ts
│   │   ├── ApiResponse.ts
│   │   ├── asyncHandler.ts
│   │   ├── constants.ts
│   │   └── helpers.ts
│   ├── scripts/          # Utility scripts
│   │   └── seed.ts       # Database seeding
│   └── index.ts          # App entry point
├── .env.example          # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

### Prerequisites

- Node.js >= 18
- MongoDB >= 6.0
- npm or yarn

### Setup

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB:**
   ```bash
   # Using mongod
   mongod --dbpath /path/to/data
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

4. **Seed admin user:**
   ```bash
   npm run seed
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run seed` | Seed database with admin user |

## Default Admin Credentials

After running `npm run seed`:
- **Email:** admin@campusfixit.com
- **Password:** admin123

**Change the password after first login!**

---

# API Documentation

Base URL: `http://localhost:3000/api`

## Authentication

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "studentId": "STU001",
  "department": "Computer Science",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      ...
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "currentPassword": "oldPassword",
  "newPassword": "newPassword123"
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

---

## Issues (Student)

### Create Issue
```http
POST /api/issues
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

title: "Broken AC in Room 101"
description: "The air conditioner in Room 101 is not working properly..."
category: "electrical"  // electrical | water | internet | infrastructure
priority: "high"        // low | medium | high | critical
location: "Building A, Room 101"
image: <file>           // Optional
```

### Get My Issues
```http
GET /api/issues/my?page=1&limit=10&status=open&category=electrical
Authorization: Bearer <access_token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10, max: 100) |
| sortBy | string | Sort field (default: createdAt) |
| sortOrder | asc/desc | Sort order (default: desc) |
| category | string | Filter by category |
| status | string | Filter by status |
| priority | string | Filter by priority |

### Get Issue by ID
```http
GET /api/issues/:id
Authorization: Bearer <access_token>
```

### Update Issue (Only when status is "open")
```http
PUT /api/issues/:id
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

title: "Updated Title"
description: "Updated description..."
```

### Delete Issue (Only when status is "open")
```http
DELETE /api/issues/:id
Authorization: Bearer <access_token>
```

### Search Issues
```http
GET /api/issues/search?q=broken&page=1&limit=10
Authorization: Bearer <access_token>
```

---

## Admin Endpoints

All admin endpoints require `admin` role.

### Get All Issues
```http
GET /api/admin/issues?page=1&limit=10&status=open
Authorization: Bearer <admin_token>
```

### Update Issue Status
```http
PATCH /api/admin/issues/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "in_progress",  // open | in_progress | resolved
  "remarks": "Our team is working on this"
}
```

### Assign Issue to Self
```http
PATCH /api/admin/issues/:id/assign
Authorization: Bearer <admin_token>
```

### Assign Issue to Admin
```http
PATCH /api/admin/issues/:id/assign/:adminId
Authorization: Bearer <admin_token>
```

### Add Remarks
```http
PATCH /api/admin/issues/:id/remarks
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "remarks": "Parts ordered, will be fixed by tomorrow"
}
```

### Resolve Issue
```http
PATCH /api/admin/issues/:id/resolve
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "remarks": "Issue has been fixed successfully"
}
```

### Get All Users
```http
GET /api/admin/users?page=1&limit=10&role=student&isActive=true&search=john
Authorization: Bearer <admin_token>
```

### Toggle User Status
```http
PATCH /api/admin/users/:id/toggle-status
Authorization: Bearer <admin_token>
```

### Update User Role
```http
PATCH /api/admin/users/:id/role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role": "admin"  // student | admin
}
```

### Delete User
```http
DELETE /api/admin/users/:id
Authorization: Bearer <admin_token>
```

### Get Dashboard Statistics
```http
GET /api/admin/stats
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "issues": {
      "total": 150,
      "byStatus": {
        "open": 45,
        "in_progress": 30,
        "resolved": 75
      },
      "byCategory": {
        "electrical": 40,
        "water": 30,
        "internet": 50,
        "infrastructure": 30
      },
      "byPriority": {
        "low": 20,
        "medium": 60,
        "high": 50,
        "critical": 20
      },
      "resolvedThisMonth": 25,
      "averageResolutionTime": 48
    },
    "users": {
      "total": 500,
      "students": 495,
      "admins": 5,
      "activeUsers": 480,
      "inactiveUsers": 20
    }
  }
}
```

---

## User Profile

### Get Profile
```http
GET /api/users/profile
Authorization: Bearer <access_token>
```

### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

name: "John Updated"
phone: "+1234567890"
department: "Electronics"
image: <file>  // Avatar image
```

### Update FCM Token
```http
PUT /api/users/fcm-token
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "fcmToken": "firebase-cloud-messaging-token..."
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (e.g., duplicate email) |
| 500 | Internal Server Error |

---

## Notifications

### Email Notifications

Emails are sent automatically for:
- Welcome email on registration
- Issue created confirmation
- Issue status updates

### Push Notifications

Push notifications (via Firebase) are sent for:
- New issue reported (to admins)
- Issue status changed (to reporter)
- Issue assigned (to assigned admin)

To enable push notifications:
1. Set up Firebase project
2. Configure Firebase credentials in `.env`
3. Store user's FCM token via `/api/users/fcm-token`

---

## Security

- Passwords are hashed using bcrypt (12 rounds)
- JWT tokens with configurable expiry
- Input validation on all endpoints
- Role-based access control
- CORS configuration

---

