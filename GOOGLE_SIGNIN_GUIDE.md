# Google Sign-In with Firebase Integration Guide

## ✅ What Changed

1. **Removed Email Verification** - Users are auto-verified on registration
2. **Removed Password Reset** - Use Firebase Auth UI for password reset
3. **Added Google Sign-In** - One-click authentication with Google

## 🔧 Backend Setup (Already Done)

- ✅ Google Sign-In endpoint: `POST /api/auth/google-signin`
- ✅ Auto-verification on registration
- ✅ Firebase token validation
- ✅ Automatic user creation from Google account

## 🌐 Frontend Integration

### 1. Install Firebase SDK

```bash
npm install firebase
```

### 2. Initialize Firebase

```javascript
// firebase.config.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "legal-239c5.firebaseapp.com",
  projectId: "legal-239c5",
  storageBucket: "legal-239c5.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
```

### 3. Implement Google Sign-In

```javascript
// GoogleSignIn.jsx (React example)
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from './firebase.config';

async function handleGoogleSignIn() {
  try {
    // Sign in with Google popup
    const result = await signInWithPopup(auth, googleProvider);
    
    // Get Firebase ID token
    const idToken = await result.user.getIdToken();
    
    // Send to backend
    const response = await fetch('http://localhost:3000/api/auth/google-signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });
    
    const data = await response.json();
    
    // Save JWT token
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    console.log('Signed in successfully!', data.user);
    // Redirect to dashboard
    
  } catch (error) {
    console.error('Google Sign-In failed:', error);
  }
}

// In your component
<button onClick={handleGoogleSignIn}>
  Sign in with Google
</button>
```

### 4. Email/Password Sign-In (Still Available)

```javascript
// Regular email/password sign-in
async function handleEmailSignIn(email, password) {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  localStorage.setItem('token', data.accessToken);
  localStorage.setItem('user', JSON.stringify(data.user));
}
```

## 🔑 Firebase Console Setup

### Enable Google Sign-In:
1. Go to: https://console.firebase.google.com/project/legal-239c5/authentication/providers
2. Click **Google** provider
3. Click **Enable**
4. Set **Project support email**
5. Click **Save**

### Get Firebase Config:
1. Go to: https://console.firebase.google.com/project/legal-239c5/settings/general
2. Scroll to **Your apps**
3. Click **Web app** icon (</>) to create a web app
4. Copy the config object

## 🧪 Testing in Postman

### Test Google Sign-In:
1. First, get an ID token from frontend (or use Firebase Auth REST API)
2. In Postman, send:

```json
POST http://localhost:3000/api/auth/google-signin
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE..."
}
```

### Test Regular Login:
```json
POST http://localhost:3000/api/auth/login
{
  "email": "karman@example.com",
  "password": "Karman@123456"
}
```

## 📱 Complete Flow

### Google Sign-In Flow:
```
1. User clicks "Sign in with Google" button
2. Google popup appears
3. User selects Google account
4. Frontend gets Firebase ID token
5. Frontend sends idToken to backend
6. Backend verifies token with Firebase
7. Backend creates/finds user in MongoDB
8. Backend returns JWT token
9. User is authenticated
```

### Email/Password Flow:
```
1. User registers with email/password
2. User is auto-verified (no email required)
3. User can login immediately
4. Backend returns JWT token
5. User is authenticated
```

## ✨ API Endpoints

### Available Endpoints:
- `POST /api/auth/register` - Register with email/password (auto-verified)
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google-signin` - Sign in with Google
- `GET /api/auth/profile` - Get user profile (requires JWT token)

### Removed Endpoints:
- ~~`POST /api/auth/verify-email`~~ (Not needed)
- ~~`POST /api/auth/forgot-password`~~ (Use Firebase Auth UI)
- ~~`POST /api/auth/reset-password`~~ (Use Firebase Auth UI)
- ~~`POST /api/auth/resend-verification`~~ (Not needed)

## 🎯 Advantages

✅ **No Email Verification** - Users can login immediately
✅ **Google Sign-In** - One-click authentication
✅ **Simpler Flow** - Less complexity, better UX
✅ **Firebase Managed** - Secure token validation
✅ **Auto User Creation** - Google users auto-registered

## 🔒 Security Notes

- Firebase validates all Google ID tokens
- JWT tokens expire in 7 days
- Google users get auto-verified status
- All data stored in MongoDB
- Firebase UID links accounts

## 📝 Next Steps

1. ✅ **Backend Ready** - All endpoints configured
2. 🔧 **Enable Google in Firebase Console** - Follow steps above
3. 💻 **Build Frontend** - Implement Google Sign-In button
4. 🧪 **Test** - Register and login with both methods
5. 🚀 **Deploy** - Push to production
