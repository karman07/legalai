# Quick Reference Card - LegalPadhai Auth API

## 🚀 Getting Started (First Time)

```bash
# 1. Install dependencies (already done)
npm install

# 2. Configure .env file
# - Update Firebase credentials
# - Update email credentials  
# - Change JWT_SECRET

# 3. Create admin user
npm run create:admin

# 4. Start server
npm run start:dev
```

## 🔑 Default Admin Credentials
```
Email: admin@legalpadhai.com
Password: Admin@123456
```
⚠️ **Change after first login!**

## 📡 Base URL
```
http://localhost:3000/api
```

## 🔐 Common API Calls

### 1. Login (Get JWT Token)
```bash
POST /api/auth/login
{
  "email": "admin@legalpadhai.com",
  "password": "Admin@123456"
}
```
**Response:** Copy the `accessToken`

### 2. Register User (Personal ID)
```bash
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Secure@123",
  "registrationType": "personal",
  "personalId": "AADHAAR123"
}
```

### 3. Register User (Institute ID)
```bash
POST /api/auth/register
{
  "name": "Jane Smith",
  "email": "jane@uni.edu",
  "password": "Secure@123",
  "registrationType": "institute",
  "instituteId": "STU2024001",
  "instituteName": "ABC University"
}
```

### 4. Get All Users (Admin)
```bash
GET /api/admin/users?page=1&limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

### 5. Verify User (Admin)
```bash
PUT /api/admin/users/:userId/verify
Authorization: Bearer YOUR_JWT_TOKEN
```

### 6. Delete User (Admin)
```bash
DELETE /api/admin/users/:userId
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📋 Environment Variables Checklist

### ✅ Already Configured
- `MONGODB_URI` - Your MongoDB connection
- `DATABASE_NAME` - Database name

### ⚠️ Need to Configure
- `JWT_SECRET` - Change to random string
- `FIREBASE_PROJECT_ID` - From Firebase Console
- `FIREBASE_PRIVATE_KEY` - From Firebase Console  
- `FIREBASE_CLIENT_EMAIL` - From Firebase Console
- `EMAIL_USER` - Your Gmail
- `EMAIL_PASSWORD` - Gmail App Password

## 🛠️ Common Commands

```bash
# Start development server
npm run start:dev

# Create admin user
npm run create:admin

# Build for production
npm run build

# Start production server
npm run start:prod

# Format code
npm run format

# Lint code
npm run lint
```

## 📦 Testing with cURL

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@legalpadhai.com","password":"Admin@123456"}'
```

### Get Users (replace TOKEN)
```bash
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔍 Troubleshooting Quick Fixes

### MongoDB connection error
```bash
# Check .env has correct MONGODB_URI
# Whitelist IP in MongoDB Atlas
```

### Email not sending
```bash
# Use App Password (not regular Gmail password)
# Enable 2-Step Verification first
```

### JWT token invalid
```bash
# Format: Authorization: Bearer <token>
# Check JWT_SECRET matches in .env
```

## 📱 User Registration Types

| Type | Required Fields |
|------|----------------|
| Personal | `personalId` (e.g., Aadhaar) |
| Institute | `instituteId`, `instituteName` |

## 🎯 Password Requirements
- Minimum 8 characters
- At least 1 uppercase
- At least 1 lowercase  
- At least 1 number
- At least 1 special character

## 📊 User Roles
- `user` - Regular user (default)
- `admin` - Administrator (full access)

## ✉️ Email Flow
1. **Registration** → Verification email sent
2. **Verification** → Welcome email sent
3. **Forgot Password** → Reset link sent

## 🔐 Authentication Flow
1. Register → Receive verification email
2. Verify email → Account activated
3. Login → Receive JWT token
4. Use JWT → Access protected routes

## 📁 Important Files
- `.env` - Configuration (DON'T COMMIT)
- `SETUP_GUIDE.md` - Detailed setup
- `API_DOCUMENTATION.md` - Full API docs
- `postman_collection.json` - Postman tests

## 🎨 Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate)

## 🚦 Server Status Check
```bash
# Server is running when you see:
Application is running on: http://localhost:3000
API endpoints available at: http://localhost:3000/api
```

## 📞 Need Help?
1. Check `SETUP_GUIDE.md` for detailed setup
2. Check `API_DOCUMENTATION.md` for API details
3. Check `IMPLEMENTATION_SUMMARY.md` for overview

---

**Quick Test After Setup:**
```bash
# 1. Start server
npm run start:dev

# 2. Create admin
npm run create:admin

# 3. Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@legalpadhai.com","password":"Admin@123456"}'

# 4. If you get a token back, everything works! 🎉
```
