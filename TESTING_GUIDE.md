# Quick Testing Guide

## Test the API Routes

### 1. Start Backend Server
Make sure your backend is running at:
```
http://localhost:3000/api
```

### 2. Test Registration (Personal)

**Using the UI:**
1. Go to the auth page
2. Click "Sign Up"
3. Fill in the form:
   - Full Name: Karman Singh
   - Email: karman@example.com
   - Password: Karman@123456
   - Role: Student
   - Institution: (leave empty for personal)
4. Click "Create Account"
5. You should see: "Registration successful. You can now login. Please login to continue."
6. The form will switch to Login view automatically

**Using Browser Console:**
```javascript
import authService from './services/authService';

const result = await authService.register({
  name: "Karman Singh",
  email: "karman@example.com",
  password: "Karman@123456",
  registrationType: "personal",
  phoneNumber: "+919876543210",
  address: "123 Street, Delhi, India"
});

console.log(result);
// Expected: { message: "Registration successful...", userId: "...", email: "..." }
```

### 3. Test Registration (Institute)

**Using the UI:**
1. Click "Sign Up"
2. Fill in the form:
   - Full Name: John Doe
   - Email: john@university.edu
   - Password: John@123456
   - Role: Student
   - Institution: Delhi University
3. Click "Create Account"

**Note:** You'll need to modify the Auth.tsx component to collect `instituteId` field from the user.

### 4. Test Login

**Using the UI:**
1. Enter your email and password
2. Click "Login"
3. You should be redirected to `/dashboard`
4. Check localStorage: `localStorage.getItem('accessToken')` should have a JWT token

**Using Browser Console:**
```javascript
import authService from './services/authService';

const result = await authService.login({
  email: "karman@example.com",
  password: "Karman@123456"
});

console.log(result);
// Expected: { accessToken: "eyJ...", user: {...} }

// Token should be saved automatically
console.log(authService.getToken());
```

### 5. Test Get Profile

**Using Browser Console:**
```javascript
import authService from './services/authService';

// Make sure you're logged in first
const profile = await authService.getProfile();

console.log(profile);
// Expected: Full user profile with all fields
```

**Check in React DevTools:**
1. Install React DevTools extension
2. Go to Components tab
3. Find AuthProvider
4. Check `user` state - should have your profile data

### 6. Test Authentication State

**Check if user is logged in:**
```javascript
import authService from './services/authService';

console.log(authService.isAuthenticated()); // true if token exists
```

**Get current user from context:**
```javascript
// In any component
import { useAuth } from './contexts/AuthContext';

function TestComponent() {
  const { user, loading } = useAuth();
  
  console.log('User:', user);
  console.log('Loading:', loading);
  
  return <div>Check console</div>;
}
```

### 7. Test Logout

**Using the UI:**
- Implement a logout button in your dashboard/header
- Click logout
- You should be redirected and token should be removed

**Using Browser Console:**
```javascript
import authService from './services/authService';

authService.removeToken();
console.log(authService.isAuthenticated()); // false

// Or use context
import { useAuth } from './contexts/AuthContext';
const { signOut } = useAuth();
await signOut();
```

## Error Testing

### Test Duplicate Email
1. Register a user
2. Try to register again with the same email
3. Should see error: "User with this email already exists"

### Test Invalid Credentials
1. Try to login with wrong password
2. Should see error: "Invalid credentials"

### Test Missing Token
1. Logout
2. Try to access `/auth/profile`
3. Should see 401 Unauthorized error

### Test Invalid Token
1. Set invalid token: `localStorage.setItem('accessToken', 'invalid-token')`
2. Try to access profile
3. Should see 401 Unauthorized error
4. Token should be removed automatically

## Network Debugging

Open browser DevTools > Network tab to see:

### Successful Registration (200/201)
```
POST http://localhost:3000/api/auth/register
Request: { name, email, password, registrationType, ... }
Response: { message, userId, email }
```

### Successful Login (200)
```
POST http://localhost:3000/api/auth/login
Request: { email, password }
Response: { accessToken, user: {...} }
```

### Get Profile (200)
```
GET http://localhost:3000/api/auth/profile
Headers: { Authorization: "Bearer eyJ..." }
Response: { _id, name, email, role, ... }
```

### Error Response (400/401/409)
```
Response: { statusCode, message, error }
```

## Verify Token

Decode your JWT token at https://jwt.io to see:
- User ID
- Email
- Role
- Expiration time (7 days)

## Common Issues

### 1. "Network Error" or "Failed to fetch"
- Backend not running
- Wrong API URL in .env
- CORS not configured on backend

**Fix:**
- Check `VITE_API_URL` in `.env`
- Ensure backend is running on port 3000
- Verify backend has CORS enabled

### 2. "Invalid credentials" on valid password
- User not registered yet
- Wrong email/password
- Backend authentication logic issue

**Fix:**
- Register user first
- Double-check credentials
- Check backend logs

### 3. Token not persisting on refresh
- localStorage not saving
- AuthContext not loading on mount

**Fix:**
- Check browser console for errors
- Verify `useEffect` in AuthContext runs
- Check Application tab > Local Storage in DevTools

### 4. 401 Unauthorized on profile request
- No token in localStorage
- Token expired
- Invalid token format

**Fix:**
- Login again to get fresh token
- Check token in localStorage
- Verify Authorization header format

## Expected localStorage

After successful login, check Application > Local Storage:
```
accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Expected User Object

```javascript
{
  _id: "507f1f77bcf86cd799439011",
  id: "507f1f77bcf86cd799439011", // Added for compatibility
  email: "karman@example.com",
  name: "Karman Singh",
  role: "user",
  registrationType: "personal",
  phoneNumber: "+919876543210",
  address: "123 Street, Delhi, India",
  isVerified: true,
  isActive: true,
  createdAt: "2024-12-02T10:30:00.000Z",
  lastLogin: "2024-12-02T14:20:00.000Z"
}
```

## Next: Google Sign-In Testing

See `src/examples/GoogleAuthExample.tsx` for Firebase integration.

1. Install Firebase: `npm install firebase`
2. Setup Firebase project
3. Get Firebase config
4. Add to .env
5. Import and use GoogleAuthExample component
