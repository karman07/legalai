# LegalPadhai Authentication System

A comprehensive authentication system built with NestJS, MongoDB, Firebase, and JWT tokens.

## Features

### User Features
- ✅ User registration (Personal ID or Institute ID)
- ✅ Email verification
- ✅ Login with JWT tokens
- ✅ Forgot password
- ✅ Reset password
- ✅ Resend verification email
- ✅ User profile access
- ✅ Firebase integration for user data storage

### Admin Features
- ✅ Create users manually
- ✅ Verify users
- ✅ View all users (with pagination)
- ✅ View user passwords (hashed)
- ✅ Update user passwords
- ✅ Delete users
- ✅ Toggle user active/inactive status
- ✅ Search users
- ✅ View user statistics

## Setup Instructions

### 1. Environment Configuration

Copy `.env.example` to `.env` and update the following values:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://karmansingharora03_db_user:8813917626$Karman@cluster0.seuk7if.mongodb.net/
DATABASE_NAME=legalpadhai

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=7d

# Firebase Configuration (Get from Firebase Console)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=LegalPadhai <noreply@legalpadhai.com>

# Application
PORT=3000
FRONTEND_URL=http://localhost:3000
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Authentication (Email/Password)
4. Enable Firestore Database
5. Enable Storage
6. Go to Project Settings → Service Accounts
7. Generate a new private key
8. Copy the values to your `.env` file:
   - `FIREBASE_PROJECT_ID`: Your project ID
   - `FIREBASE_PRIVATE_KEY`: Private key from the JSON file
   - `FIREBASE_CLIENT_EMAIL`: Client email from the JSON file

### 3. Gmail App Password (for emails)

1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Generate an App Password for "Mail"
4. Use this password in `EMAIL_PASSWORD`

### 4. Installation

```bash
npm install
```

### 5. Run the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Endpoints

### Authentication Endpoints (`/api/auth`)

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "registrationType": "personal",  // or "institute"
  "personalId": "AADHAAR123456",   // required for personal
  "phoneNumber": "+91234567890",
  "address": "123 Street, City"
}
```

#### Register with Institute ID
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@university.edu",
  "password": "securepassword123",
  "registrationType": "institute",
  "instituteId": "STU2024001",      // required for institute
  "instituteName": "ABC University"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification-token-from-email"
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "newsecurepassword123"
}
```

#### Resend Verification Email
```http
POST /api/auth/resend-verification
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Get Profile (Authenticated)
```http
GET /api/auth/profile
Authorization: Bearer <jwt-token>
```

### Admin Endpoints (`/api/admin`) - Requires Admin Role

#### Create User
```http
POST /api/admin/users
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "user",  // or "admin"
  "registrationType": "personal",
  "personalId": "ID123456"
}
```

#### Get All Users (with pagination)
```http
GET /api/admin/users?page=1&limit=10
Authorization: Bearer <admin-jwt-token>
```

#### Search Users
```http
GET /api/admin/users/search?q=john
Authorization: Bearer <admin-jwt-token>
```

#### Get User Statistics
```http
GET /api/admin/users/stats
Authorization: Bearer <admin-jwt-token>
```

#### Get User by ID
```http
GET /api/admin/users/:id
Authorization: Bearer <admin-jwt-token>
```

#### Get User with Password
```http
GET /api/admin/users/:id/password
Authorization: Bearer <admin-jwt-token>
```

#### Verify User
```http
PUT /api/admin/users/:id/verify
Authorization: Bearer <admin-jwt-token>
```

#### Update User Password
```http
PUT /api/admin/users/:id/password
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "password": "newpassword123"
}
```

#### Toggle User Active/Inactive Status
```http
PUT /api/admin/users/:id/toggle-status
Authorization: Bearer <admin-jwt-token>
```

#### Delete User
```http
DELETE /api/admin/users/:id
Authorization: Bearer <admin-jwt-token>
```

## Creating First Admin User

You can create an admin user by directly inserting into MongoDB or by registering a user and updating the role:

### Method 1: Using MongoDB Compass or Shell
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin", isVerified: true } }
)
```

### Method 2: After Registration
1. Register a normal user via `/api/auth/register`
2. Update the user's role in MongoDB to "admin"
3. Update `isVerified` to `true`

## Security Best Practices Implemented

1. ✅ Password hashing with bcrypt
2. ✅ JWT token authentication
3. ✅ Role-based access control (RBAC)
4. ✅ Email verification
5. ✅ Password reset with tokens
6. ✅ Token expiration
7. ✅ Input validation with class-validator
8. ✅ CORS configuration
9. ✅ Environment variable protection
10. ✅ Firebase integration for additional security

## Project Structure

```
src/
├── admin/              # Admin module
│   ├── dto/
│   ├── admin.controller.ts
│   ├── admin.service.ts
│   └── admin.module.ts
├── auth/               # Authentication module
│   ├── decorators/
│   ├── dto/
│   ├── guards/
│   ├── strategies/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── common/
│   └── enums/
│       └── user-role.enum.ts
├── email/              # Email service
│   ├── email.service.ts
│   └── email.module.ts
├── firebase/           # Firebase integration
│   ├── firebase.service.ts
│   └── firebase.module.ts
├── schemas/            # MongoDB schemas
│   └── user.schema.ts
├── app.module.ts
└── main.ts
```

## Testing with Postman/Thunder Client

1. Register a user
2. Check email for verification link
3. Verify email using the token
4. Login to get JWT token
5. Use JWT token in Authorization header for protected routes
6. Create an admin user in database
7. Login as admin to access admin endpoints

## Troubleshooting

### MongoDB Connection Issues
- Verify your MongoDB URI is correct
- Check if IP address is whitelisted in MongoDB Atlas
- Ensure password doesn't contain special characters that need URL encoding

### Firebase Issues
- Verify all Firebase credentials are correct
- Check if Firebase services are enabled
- Ensure private key is properly formatted (replace `\n` with actual newlines)

### Email Issues
- Use Gmail App Password, not your regular password
- Enable "Less secure app access" if using regular password (not recommended)
- Check SMTP settings for other email providers

## License

MIT
