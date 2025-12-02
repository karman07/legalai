# 🚀 LegalPadhai API - Quick Reference

## 📍 Base URL
```
http://localhost:3000/api
```

## 🔐 Authentication Routes

### 1️⃣ Register (Personal)
```typescript
POST /auth/register

// Request
{
  "name": "Karman Singh",
  "email": "karman@example.com",
  "password": "Karman@123456",
  "registrationType": "personal",
  "phoneNumber": "+919876543210",  // optional
  "address": "123 Street, Delhi"    // optional
}

// Response
{
  "message": "Registration successful. You can now login.",
  "userId": "507f1f77bcf86cd799439011",
  "email": "karman@example.com"
}
```

### 2️⃣ Register (Institute)
```typescript
POST /auth/register

// Request
{
  "name": "Karman Singh",
  "email": "karman@university.edu",
  "password": "Karman@123456",
  "registrationType": "institute",
  "instituteId": "STU2024001",
  "instituteName": "Delhi University", // optional
  "phoneNumber": "+919876543210",      // optional
  "address": "123 Street, Delhi"       // optional
}

// Response (same as personal)
```

### 3️⃣ Login
```typescript
POST /auth/login

// Request
{
  "email": "karman@example.com",
  "password": "Karman@123456"
}

// Response
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

### 4️⃣ Google Sign-In
```typescript
POST /auth/google-signin

// Request
{
  "idToken": "firebase-id-token-from-frontend"
}

// Response (same as login)
```

### 5️⃣ Get Profile
```typescript
GET /auth/profile
Headers: { Authorization: "Bearer {token}" }

// Response
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
  "createdAt": "2024-12-02T10:30:00.000Z",
  "lastLogin": "2024-12-02T14:20:00.000Z"
}
```

---

## 💻 Frontend Usage

### Using AuthContext (Recommended)
```tsx
import { useAuth } from './contexts/AuthContext';

function App() {
  const { user, loading, signIn, signUp, signOut } = useAuth();

  // Register
  const handleSignUp = async () => {
    try {
      const result = await signUp(email, password, name, role, institution);
      alert(result.message); // "Registration successful..."
      // User is auto-switched to login view
    } catch (error) {
      console.error(error.message);
    }
  };

  // Login
  const handleSignIn = async () => {
    try {
      await signIn(email, password);
      // Auto-redirects to /dashboard
    } catch (error) {
      console.error(error.message);
    }
  };

  // Logout
  const handleSignOut = async () => {
    await signOut();
  };

  // Check auth status
  if (loading) return <div>Loading...</div>;
  if (!user) return <LoginPage />;
  
  return <Dashboard user={user} />;
}
```

### Using AuthService Directly
```tsx
import authService from './services/authService';

// Register
const result = await authService.register({
  name: "Karman",
  email: "karman@example.com",
  password: "Karman@123456",
  registrationType: "personal"
});
console.log(result.message);

// Login
const auth = await authService.login({
  email: "karman@example.com",
  password: "Karman@123456"
});
authService.saveToken(auth.accessToken);

// Get Profile
const profile = await authService.getProfile();

// Check if logged in
if (authService.isAuthenticated()) {
  // User is logged in
}

// Logout
authService.removeToken();
```

---

## 🎨 Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid credentials/token) |
| 404 | Not Found |
| 409 | Conflict (email already exists) |
| 500 | Internal Server Error |

---

## 🔑 Token Storage

```javascript
// Saved to localStorage after login
localStorage.setItem('accessToken', token);

// Retrieved automatically on API calls
localStorage.getItem('accessToken');

// Removed on logout
localStorage.removeItem('accessToken');
```

---

## ⚡ Quick Test

```bash
# 1. Start backend
cd backend
npm start

# 2. Start frontend
cd frontend
npm run dev

# 3. Open browser
http://localhost:5173

# 4. Register a user
# 5. Login with same credentials
# 6. Check localStorage for token
# 7. Refresh page (should stay logged in)
```

---

## 📱 Frontend Files

```
src/
├── services/
│   ├── api.ts              # Base API client
│   └── authService.ts      # Auth methods
├── contexts/
│   └── AuthContext.tsx     # Global auth state
├── components/
│   └── Auth.tsx            # Login/Signup UI
└── examples/
    └── GoogleAuthExample.tsx  # Firebase integration
```

---

## 🛠️ Environment (.env)

```env
VITE_API_URL=http://localhost:3000/api

# Optional: For Google Sign-In
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

---

## 📖 Full Documentation

- **API_INTEGRATION_GUIDE.md** - Complete integration guide
- **TESTING_GUIDE.md** - Testing instructions
- **IMPLEMENTATION_SUMMARY.md** - What was implemented

---

## ✅ Checklist

- ✅ All 5 user routes implemented
- ✅ Token management setup
- ✅ Auto-login on refresh
- ✅ Error handling
- ✅ TypeScript types
- ✅ Documentation
- ⬜ Start backend server
- ⬜ Test registration
- ⬜ Test login
- ⬜ (Optional) Setup Firebase

---

**Ready to use! Start your backend and test the flows. 🚀**
