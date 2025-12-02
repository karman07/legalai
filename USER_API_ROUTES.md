# LegalPadhai User API Routes

## Base URL
```
http://localhost:3000/api
```

## Authentication Routes

### 1. Register User (Personal)
**Endpoint:** `POST /auth/register`

**Description:** Register a new user with personal account (no institute ID required)

**Request Body:**
```json
{
  "name": "Karman Singh",
  "email": "karman@example.com",
  "password": "Karman@123456",
  "registrationType": "personal",
  "phoneNumber": "+919876543210",
  "address": "123 Street, Delhi, India"
}
```

**Response:**
```json
{
  "message": "Registration successful. You can now login.",
  "userId": "507f1f77bcf86cd799439011",
  "email": "karman@example.com"
}
```

---

### 2. Register User (Institute)
**Endpoint:** `POST /auth/register`

**Description:** Register a new user with institute account (requires institute ID)

**Request Body:**
```json
{
  "name": "Karman Singh",
  "email": "karman.student@university.edu",
  "password": "Karman@123456",
  "registrationType": "institute",
  "instituteId": "STU2024001",
  "instituteName": "Delhi University",
  "phoneNumber": "+919876543210",
  "address": "123 Street, Delhi, India"
}
```

**Response:**
```json
{
  "message": "Registration successful. You can now login.",
  "userId": "507f1f77bcf86cd799439012",
  "email": "karman.student@university.edu"
}
```

---

### 3. Login
**Endpoint:** `POST /auth/login`

**Description:** Login with email and password

**Request Body:**
```json
{
  "email": "karman@example.com",
  "password": "Karman@123456"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "karman@example.com",
    "name": "Karman Singh",
    "role": "user",
    "isVerified": true,
    "registrationType": "personal"
  }
}
```

---

### 4. Google Sign-In
**Endpoint:** `POST /auth/google-signin`

**Description:** Sign in or register using Google account via Firebase

**Request Body:**
```json
{
  "idToken": "firebase-id-token-from-frontend"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439013",
    "email": "user@gmail.com",
    "name": "User Name",
    "role": "user",
    "isVerified": true,
    "registrationType": "personal"
  }
}
```

**Note:** Get the `idToken` from Firebase Auth on the frontend after Google Sign-In.

---

### 5. Get My Profile
**Endpoint:** `GET /auth/profile`

**Description:** Get current user's profile information

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "karman@example.com",
  "name": "Karman Singh",
  "role": "user",
  "registrationType": "personal",
  "phoneNumber": "+919876543210",
  "address": "123 Street, Delhi, India",
  "isVerified": true,
  "isActive": true,
  "firebaseUid": "firebase-uid-123",
  "createdAt": "2024-12-02T10:30:00.000Z",
  "lastLogin": "2024-12-02T14:20:00.000Z"
}
```

---

## Field Descriptions

### Registration Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | User's full name |
| `email` | string | Yes | Valid email address |
| `password` | string | Yes | Minimum 8 characters |
| `registrationType` | string | Yes | Either "personal" or "institute" |
| `instituteId` | string | Conditional | Required if registrationType is "institute" |
| `instituteName` | string | No | Name of the institute |
| `phoneNumber` | string | No | Phone number with country code |
| `address` | string | No | Full address |

### User Object Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` / `_id` | string | Unique user identifier |
| `email` | string | User's email address |
| `name` | string | User's full name |
| `role` | string | User role: "user" or "admin" |
| `registrationType` | string | "personal" or "institute" |
| `instituteId` | string | Institute ID (if applicable) |
| `instituteName` | string | Institute name (if applicable) |
| `phoneNumber` | string | Contact number |
| `address` | string | User's address |
| `isVerified` | boolean | Email verification status (auto-verified) |
| `isActive` | boolean | Account status |
| `firebaseUid` | string | Firebase authentication UID |
| `createdAt` | string | Account creation timestamp |
| `lastLogin` | string | Last login timestamp |

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation error message",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "User with this email already exists",
  "error": "Conflict"
}
```

---

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token expires in **7 days** by default.

---

## Notes

- ✅ **No Email Verification Required** - Users are auto-verified upon registration
- ✅ **Dual Registration Types** - Support for both personal and institute accounts
- ✅ **Google Sign-In** - One-click authentication via Firebase
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **CORS Enabled** - All origins allowed for development

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Karman Singh",
    "email": "karman@example.com",
    "password": "Karman@123456",
    "registrationType": "personal"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "karman@example.com",
    "password": "Karman@123456"
  }'
```

### Get Profile
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Frontend Integration Example

### React/Next.js Example

```javascript
// Register User
async function registerUser(userData) {
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  const data = await response.json();
  return data;
}

// Login User
async function loginUser(email, password) {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  // Save token
  localStorage.setItem('token', data.accessToken);
  localStorage.setItem('user', JSON.stringify(data.user));
  
  return data;
}

// Google Sign-In
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

async function googleSignIn(auth) {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken();
  
  const response = await fetch('http://localhost:3000/api/auth/google-signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken }),
  });
  
  const data = await response.json();
  localStorage.setItem('token', data.accessToken);
  return data;
}

// Get Profile
async function getProfile() {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:3000/api/auth/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data = await response.json();
  return data;
}
```

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid credentials or token) |
| 404 | Not Found |
| 409 | Conflict (email already exists) |
| 500 | Internal Server Error |
