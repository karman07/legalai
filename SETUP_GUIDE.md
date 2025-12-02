# Quick Start Guide - LegalPadhai Auth System

## Prerequisites
- Node.js installed
- MongoDB Atlas account (or local MongoDB)
- Firebase account
- Gmail account (for sending emails)

## Step-by-Step Setup

### 1. Install Dependencies
Already installed! ✅

### 2. Configure Environment Variables

Edit the `.env` file with your actual credentials:

#### MongoDB (Already configured)
```
MONGODB_URI=mongodb+srv://karmansingharora03_db_user:8813917626$Karman@cluster0.seuk7if.mongodb.net/
DATABASE_NAME=legalpadhai
```

#### JWT Secrets (Change these!)
```
JWT_SECRET=ChangeMeToSomethingVerySecure123!@#
JWT_EXPIRATION=7d
```

#### Firebase Setup
1. Go to https://console.firebase.google.com/
2. Create a new project (or select existing)
3. Click the gear icon → Project Settings
4. Go to "Service Accounts" tab
5. Click "Generate New Private Key"
6. Open the downloaded JSON file
7. Copy these values to `.env`:
   ```
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nKey\nHere\n-----END PRIVATE KEY-----\n"
   ```

#### Email Setup (Gmail)
1. Go to https://myaccount.google.com/
2. Security → 2-Step Verification → Enable it
3. Security → App passwords → Create new app password
4. Copy the password to `.env`:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```

### 3. Create First Admin User

Run this command to create an admin account:
```bash
npm run create:admin
```

This will create an admin with:
- Email: admin@legalpadhai.com
- Password: Admin@123456

**⚠️ Change this password after first login!**

### 4. Start the Application

```bash
# Development mode (with auto-reload)
npm run start:dev

# Production build
npm run build
npm run start:prod
```

The API will be available at: `http://localhost:3000/api`

### 5. Test the API

#### Option A: Using cURL

**Register a new user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test@123456",
    "registrationType": "personal",
    "personalId": "TEST123456"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@legalpadhai.com",
    "password": "Admin@123456"
  }'
```

#### Option B: Using Postman/Thunder Client

Import these endpoints:

1. **Register User** - POST `http://localhost:3000/api/auth/register`
2. **Login** - POST `http://localhost:3000/api/auth/login`
3. **Verify Email** - POST `http://localhost:3000/api/auth/verify-email`
4. **Get Profile** - GET `http://localhost:3000/api/auth/profile` (with JWT token)
5. **Admin - Get All Users** - GET `http://localhost:3000/api/admin/users` (with admin JWT)

## Available Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/verify-email` - Verify email with token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/resend-verification` - Resend verification email
- `GET /api/auth/profile` - Get user profile (authenticated)

### Admin (Requires Admin Role)
- `POST /api/admin/users` - Create user
- `GET /api/admin/users` - List all users (paginated)
- `GET /api/admin/users/search?q=query` - Search users
- `GET /api/admin/users/stats` - Get user statistics
- `GET /api/admin/users/:id` - Get user by ID
- `GET /api/admin/users/:id/password` - Get user with password
- `PUT /api/admin/users/:id/verify` - Verify user
- `PUT /api/admin/users/:id/password` - Update user password
- `PUT /api/admin/users/:id/toggle-status` - Activate/Deactivate user
- `DELETE /api/admin/users/:id` - Delete user

## User Registration Types

### Personal ID Registration
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Secure@123456",
  "registrationType": "personal",
  "personalId": "AADHAAR1234567890"
}
```

### Institute ID Registration
```json
{
  "name": "Jane Smith",
  "email": "jane@university.edu",
  "password": "Secure@123456",
  "registrationType": "institute",
  "instituteId": "STU2024001",
  "instituteName": "ABC University"
}
```

## Common Issues & Solutions

### MongoDB Connection Error
**Error:** `MongooseServerSelectionError`
**Solution:** 
- Check if your IP is whitelisted in MongoDB Atlas
- Verify the connection string is correct
- Check if the password contains special characters (URL encode them)

### Firebase Error
**Error:** `Failed to initialize Firebase`
**Solution:**
- Verify all Firebase credentials are correct
- Check if the private key is properly formatted
- Enable Authentication, Firestore, and Storage in Firebase Console

### Email Not Sending
**Error:** `Error sending email`
**Solution:**
- Use App Password, not regular Gmail password
- Enable 2-Step Verification first
- Check if EMAIL_HOST and EMAIL_PORT are correct

### JWT Token Invalid
**Error:** `Unauthorized`
**Solution:**
- Ensure you're sending the token in the Authorization header: `Bearer <token>`
- Check if JWT_SECRET in .env matches
- Token may have expired (check JWT_EXPIRATION)

## Security Checklist

- ✅ Change default JWT_SECRET
- ✅ Change admin password after creation
- ✅ Use strong passwords (min 8 characters)
- ✅ Enable 2FA on Firebase and email accounts
- ✅ Don't commit `.env` file to Git
- ✅ Use HTTPS in production
- ✅ Keep dependencies updated

## Next Steps

1. ✅ Complete `.env` configuration
2. ✅ Create admin user: `npm run create:admin`
3. ✅ Start the server: `npm run start:dev`
4. ✅ Test registration endpoint
5. ✅ Test login endpoint
6. ✅ Test admin endpoints
7. Build your frontend application
8. Deploy to production

## Support

For detailed API documentation, see `API_DOCUMENTATION.md`

## Production Deployment

Before deploying to production:

1. Set `NODE_ENV=production` in `.env`
2. Use strong JWT secrets
3. Configure CORS properly (update FRONTEND_URL)
4. Use production MongoDB cluster
5. Enable Firebase security rules
6. Set up proper logging
7. Use environment-specific .env files
8. Enable HTTPS

---

**Questions?** Check the API_DOCUMENTATION.md file for more details!
