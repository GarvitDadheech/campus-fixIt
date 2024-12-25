# Campus FixIt - Campus Issue Reporting System

A full-stack mobile application for reporting and managing campus issues, built with React Native (Expo) and Node.js.

---

## IMPORTANT LINKS

**SCREENSHOTS AND DEMONSTRATION:**
Find all screenshots, screen recordings, and UI demonstrations at: [https://thirsty-othnielia-edb.notion.site/Campus-FixIt-App-Screenshots-2d4263da714480aba4a9ca685f207af9]

**API DOCUMENTATION:**
Complete API documentation with all endpoints, request/response formats, and examples can be found in: `server/README.md`

---

## Project Overview

Campus FixIt is a comprehensive issue reporting and management system designed for educational institutions. The application allows students to report various campus issues (electrical, water, internet, infrastructure) and enables administrators to track, manage, and resolve these issues efficiently.

The project consists of two main components:
- **Frontend**: React Native mobile application built with Expo
- **Backend**: Node.js REST API server with Express and TypeScript

---

## Technology Stack

### Frontend
- **React Native** with Expo
- **Expo Router** for navigation (Stack and Tab navigation)
- **Redux Toolkit** for state management
- **React Context API** for authentication state
- **Axios** for API communication
- **AsyncStorage** for token persistence
- **TypeScript** for type safety
- **React Native Toast Message** for notifications

### Backend
- **Node.js** with Express
- **TypeScript**
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Cloudinary** for image uploads
- **Nodemailer** for email notifications
- **Winston** for logging
- **Zod** for validation
- **Nodemon** for development

---

## Features

### Student Features

#### Authentication
- User registration with email, password, and optional student details (student ID, department, phone)
- Secure login with JWT authentication
- Automatic token refresh
- Password change functionality
- Profile management

#### Issue Reporting
- Create new issues with:
  - Title and detailed description
  - Category selection (Electrical, Water, Internet, Infrastructure)
  - Priority levels (Low, Medium, High, Critical)
  - Optional location information
  - Image attachment support
- View all reported issues with real-time status updates
- Filter issues by status (All, Open, In Progress, Resolved)
- Search functionality
- Edit open issues (title, description, category, priority, location, image)
- Delete open issues
- View detailed issue information including:
  - Status history with timestamps
  - Admin remarks
  - Resolution details

#### Dashboard
- Personal dashboard showing:
  - Total issues reported
  - Open issues count
  - In Progress issues count
  - Resolved issues count
- Quick actions to create new issues or view all issues
- Real-time data refresh on screen focus

#### Profile Management
- View profile information
- Update profile details (name, phone, department, student ID)
- Upload and change profile avatar
- Change password

### Admin Features

#### Dashboard
- Comprehensive admin dashboard with:
  - Total issues statistics
  - Issues by status (Open, In Progress, Resolved)
  - Additional metrics (resolved this month, average resolution time)
  - User statistics (total users, students, admins, active/inactive users)
- Quick navigation to all issues and user management

#### Issue Management
- View all reported issues from all users
- Filter issues by status
- Update issue status (Open, In Progress, Resolved)
- Add remarks to issues
- Assign issues to specific admins
- Mark issues as resolved with remarks
- View complete issue details including:
  - Reporter information
  - Status history
  - All remarks and updates
  - Attached images

#### User Management
- View all registered users
- Filter users by role (All, Students, Admins)
- Toggle user active/inactive status
- Update user roles (promote student to admin or vice versa)
- Delete users
- View user details

#### Statistics
- Real-time dashboard statistics
- Issue breakdown by category and priority
- User activity metrics

---

## UI/UX Features

### Design
- Clean, modern interface with light blue (cyan) and white color scheme
- Consistent design language throughout the application
- Responsive layouts for different screen sizes
- Intuitive navigation with tab-based interface
- Role-based UI that adapts based on user permissions

### User Experience
- Pull-to-refresh functionality on all list screens
- Real-time data updates when navigating between screens
- Loading states and error handling
- Toast notifications for user feedback
- Field-specific validation error messages
- Form data preservation on validation errors
- Smooth navigation transitions
- Empty state messages for better UX

### Accessibility
- Clear visual feedback for user actions
- Consistent button styles and interactions
- Readable typography and spacing
- Color-coded status indicators
- Icon-based navigation

---

## Project Structure

```
CampusFixIt/
├── app/                    # React Native app (Expo Router)
│   ├── (auth)/            # Authentication screens
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/            # Main app screens
│   │   ├── index.tsx      # Student dashboard
│   │   ├── my-issues.tsx
│   │   ├── create-issue.tsx
│   │   ├── issue-details.tsx
│   │   ├── edit-issue.tsx
│   │   ├── profile.tsx
│   │   ├── edit-profile.tsx
│   │   ├── change-password.tsx
│   │   ├── admin-dashboard.tsx
│   │   ├── admin-all-issues.tsx
│   │   ├── admin-issue-details.tsx
│   │   └── admin-users.tsx
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
│   └── ui/               # Button, Input, Card, Loading, etc.
├── constants/            # App constants and configuration
├── context/              # React Context providers
│   └── AuthContext.tsx
├── services/             # API service layer
│   └── api.ts
├── store/                # Redux store
│   ├── authSlice.ts
│   └── index.ts
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
│   └── toast.ts
└── server/               # Backend server
    ├── src/
    │   ├── config/       # Configuration files
    │   ├── controllers/  # Route controllers
    │   ├── middlewares/  # Express middlewares
    │   ├── models/       # MongoDB models
    │   ├── routes/       # API routes
    │   ├── services/     # Business logic
    │   ├── types/        # TypeScript types
    │   └── utils/        # Utility functions
    └── README.md         # API documentation
```



### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   - MongoDB connection string
   - JWT secrets
   - Cloudinary credentials (for image uploads)
   - Email credentials (Gmail App Password)

4. Start MongoDB:
   ```bash
   # Using mongod
   npm run db
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. Seed admin user:
   ```bash
   npm run seed
   ```
   Default admin credentials:
   - Email: admin@campusfixit.com
   - Password: admin123

6. Start development server:
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the project root:
   ```bash
   cd /path/to/CampusFixIt
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure API endpoint:
   Edit `constants/config.ts` and update `BASE_URL` if needed:
   ```typescript
   export const BASE_URL = 'base_url'

4. Start Expo development server:
   ```bash
   npx expo start
   ```

5. Run on device/emulator:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

---

## Available Scripts

### Frontend
- `npm start` - Start Expo development server
- `npm run android` - Start on Android emulator
- `npm run ios` - Start on iOS simulator
- `npm run web` - Start web version
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run seed` - Seed database with admin user
- `npm run db` - Start MongoDB with local data directory

---

## API Documentation

Complete API documentation including:
- All available endpoints
- Request/response formats
- Authentication requirements
- Error handling
- Query parameters and filters

Can be found in: `server/README.md`

---

## Key Features Implementation

### Authentication Flow
- JWT-based authentication with access and refresh tokens
- Automatic token refresh on expiry
- Secure token storage using AsyncStorage
- Protected routes with role-based access control

### Real-time Updates
- Automatic data refresh when screens come into focus
- Pull-to-refresh functionality
- Optimistic UI updates

### Image Handling
- Image picker integration
- Cloudinary upload for image storage
- Image display with proper loading states
- Image deletion when issues are deleted

### Error Handling
- Comprehensive error handling throughout the app
- User-friendly error messages
- Field-specific validation errors
- Network error handling with retry mechanisms

### State Management
- Redux Toolkit for global state (authentication)
- React Context for auth-related functions
- Local state for component-specific data
- Optimized re-renders

---

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token-based authentication
- Role-based access control (Student/Admin)
- Input validation on all endpoints
- CORS configuration
- Secure token storage
- Protected API routes

---

## Email Notifications

The system sends automatic email notifications for:
- Welcome email on user registration
- Issue creation confirmation
- Issue status updates (when status changes)

Email configuration uses Gmail with App Passwords for secure authentication.

---

## Development Notes

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Consistent code formatting
- Modular architecture with separation of concerns
- Reusable component library

### Best Practices
- MVC architecture in backend
- Service layer for business logic
- Middleware for cross-cutting concerns
- Error handling middleware
- Request validation with Zod
- Structured logging with Winston

---

## Testing

To test the application:

1. Start the backend server
2. Start the frontend Expo app
3. Register a new student account
4. Login with the account
5. Create test issues
6. Login as admin (admin@campusfixit.com / admin123)
7. Manage issues and users from admin dashboard

---
