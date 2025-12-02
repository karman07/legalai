# LegalPadhai API Integration Guide

## Overview
All user authentication routes from the backend API are now fully implemented in the frontend.

## Files Updated

### 1. `src/services/api.ts`
Base API client for all HTTP requests with:
- Automatic token injection from localStorage
- Error handling
- Configurable base URL from environment variables

### 2. `src/services/authService.ts`
Authentication service with all user routes:
- ✅ `register()` - Register new user (personal or institute)
- ✅ `login()` - Login with email and password
- ✅ `googleSignIn()` - Sign in with Google via Firebase
- ✅ `getProfile()` - Get current user profile
- ✅ Token management (save, get, remove, check authentication)

### 3. `src/contexts/AuthContext.tsx`
Global authentication state with:
- ✅ Auto-load user on mount if token exists
- ✅ `signUp()` - Register user (returns message, requires login)
- ✅ `signIn()` - Login user (saves token and user)
- ✅ `googleSignIn()` - Google authentication
- ✅ `signOut()` - Logout user
- ✅ `refreshProfile()` - Reload user profile

### 4. `src/components/Auth.tsx`
Authentication UI with:
- ✅ Login/Signup forms
- ✅ Success/Error messages
- ✅ Auto-switch to login after successful registration
- ✅ Redirect to dashboard after login

## Environment Configuration

Add to `.env`:
```env
# Backend API URL
VITE_API_URL=http://localhost:3000/api

# Firebase (for Google Sign-In)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

## API Routes Implemented

### 1. Register User (Personal)
```typescript
const response = await authService.register({
  name: "Karman Singh",
  email: "karman@example.com",
  password: "Karman@123456",
  registrationType: "personal",
  phoneNumber: "+919876543210", // optional
  address: "123 Street, Delhi, India" // optional
});

// Response: { message: "Registration successful...", userId: "...", email: "..." }
```

### 2. Register User (Institute)
```typescript
const response = await authService.register({
  name: "Karman Singh",
  email: "karman.student@university.edu",
  password: "Karman@123456",
  registrationType: "institute",
  instituteId: "STU2024001",
  instituteName: "Delhi University", // optional
  phoneNumber: "+919876543210", // optional
  address: "123 Street, Delhi, India" // optional
});
```

### 3. Login
```typescript
const response = await authService.login({
  email: "karman@example.com",
  password: "Karman@123456"
});

// Response includes accessToken and user object
authService.saveToken(response.accessToken);
```

### 4. Google Sign-In
```typescript
// Get idToken from Firebase first
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const provider = new GoogleAuthProvider();
const result = await signInWithPopup(auth, provider);
const idToken = await result.user.getIdToken();

// Send to backend
const response = await authService.googleSignIn({ idToken });
authService.saveToken(response.accessToken);
```

### 5. Get Profile
```typescript
// Automatically includes Authorization header
const profile = await authService.getProfile();

// Response: UserProfile with all user details
console.log(profile);
```

## Type Definitions

### RegisterRequest (Personal)
```typescript
{
  name: string;
  email: string;
  password: string;
  registrationType: 'personal';
  phoneNumber?: string;
  address?: string;
}
```

### RegisterRequest (Institute)
```typescript
{
  name: string;
  email: string;
  password: string;
  registrationType: 'institute';
  instituteId: string;
  instituteName?: string;
  phoneNumber?: string;
  address?: string;
}
```

### AuthResponse
```typescript
{
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    registrationType: 'personal' | 'institute';
    isVerified: boolean;
  }
}
```

### UserProfile
```typescript
{
  _id: string;
  id?: string; // For backward compatibility
  name: string;
  email: string;
  role: 'user' | 'admin';
  registrationType: 'personal' | 'institute';
  isVerified: boolean;
  isActive: boolean;
  instituteId?: string;
  instituteName?: string;
  phoneNumber?: string;
  address?: string;
  firebaseUid?: string;
  createdAt: string;
  lastLogin?: string;
}
```

## Usage Examples

### Using AuthContext in Components
```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, loading, signIn, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;
  
  if (!user) {
    return <button onClick={() => signIn('email', 'password')}>Login</button>;
  }

  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <p>Type: {user.registrationType}</p>
      <button onClick={signOut}>Logout</button>
    </div>
  );
}
```

### Direct API Service Usage
```tsx
import authService from '../services/authService';

async function handleLogin() {
  try {
    const response = await authService.login({
      email: 'user@example.com',
      password: 'password123'
    });
    
    // Save token
    authService.saveToken(response.accessToken);
    
    // Use user data
    console.log('Logged in:', response.user);
  } catch (error) {
    console.error('Login failed:', error);
  }
}
```

### Making Authenticated Requests
```tsx
import apiClient from '../services/api';

// Token is automatically added from localStorage
async function fetchUserData() {
  const data = await apiClient('/user/some-endpoint');
  return data;
}
```

## Error Handling

All API errors are thrown with descriptive messages:

```tsx
try {
  await authService.login({ email, password });
} catch (error: any) {
  // Error message from backend
  console.error(error.message);
  
  // Examples:
  // "Invalid credentials"
  // "User with this email already exists"
  // "Validation error message"
}
```

## Authentication Flow

### Registration Flow
1. User fills signup form
2. Frontend calls `authService.register()`
3. Backend creates user account
4. Backend returns success message (NO TOKEN)
5. Frontend shows success message
6. Frontend switches to login view
7. User enters credentials again
8. Frontend calls `authService.login()`
9. Backend returns token + user data
10. Frontend saves token and redirects to dashboard

### Login Flow
1. User fills login form
2. Frontend calls `authService.login()`
3. Backend validates credentials
4. Backend returns token + user data
5. Frontend saves token via `authService.saveToken()`
6. Frontend updates AuthContext user state
7. Frontend redirects to dashboard

### Google Sign-In Flow
1. User clicks "Sign in with Google"
2. Frontend initiates Firebase Google sign-in popup
3. User authenticates with Google
4. Firebase returns ID token
5. Frontend sends ID token to backend via `authService.googleSignIn()`
6. Backend verifies token with Firebase
7. Backend creates/finds user account
8. Backend returns JWT token + user data
9. Frontend saves token and redirects to dashboard

## Protected Routes

Use the `useAuth` hook to protect routes:

```tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/auth" />;

  return children;
}

// In App.tsx
<Route path="/dashboard" element={
  <ProtectedRoute>
    <DashboardPage />
  </ProtectedRoute>
} />
```

## Token Management

Tokens are stored in localStorage and automatically:
- Attached to all API requests via Authorization header
- Retrieved on app mount to restore user session
- Removed on logout

```typescript
// Check if user is authenticated
if (authService.isAuthenticated()) {
  // User has valid token
}

// Get token manually
const token = authService.getToken();

// Remove token (logout)
authService.removeToken();
```

## Backend Requirements

Ensure your backend at `http://localhost:3000/api` implements:

1. **POST** `/auth/register` - Returns `{ message, userId, email }`
2. **POST** `/auth/login` - Returns `{ accessToken, user }`
3. **POST** `/auth/google-signin` - Returns `{ accessToken, user }`
4. **GET** `/auth/profile` - Returns user profile (requires auth header)

All routes should accept/return JSON and handle CORS properly.

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid credentials/token)
- `404` - Not Found
- `409` - Conflict (email already exists)
- `500` - Internal Server Error

## Next Steps

1. ✅ All user routes implemented
2. ✅ Token management setup
3. ✅ AuthContext configured
4. ✅ UI components updated
5. ⏳ Start backend server at `http://localhost:3000/api`
6. ⏳ Test registration flow
7. ⏳ Test login flow
8. ⏳ (Optional) Setup Firebase for Google Sign-In
9. ⏳ Add other feature API routes (notes, MCQ, etc.)
