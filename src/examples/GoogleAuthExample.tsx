// @ts-nocheck
/**
 * Google Sign-In Integration Example
 * 
 * ⚠️ THIS IS AN EXAMPLE FILE - NOT READY TO USE
 * 
 * This file demonstrates how to integrate Google Sign-In using Firebase
 * with the LegalPadhai backend API.
 * 
 * SETUP STEPS:
 * 1. Install Firebase: npm install firebase
 * 2. Create a Firebase project at https://console.firebase.google.com
 * 3. Enable Google Sign-In in Authentication > Sign-in method
 * 4. Add your domain to Authorized domains
 * 5. Copy your Firebase config
 * 6. Add Firebase config to .env:
 *    VITE_FIREBASE_API_KEY=your-api-key
 *    VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
 *    VITE_FIREBASE_PROJECT_ID=your-project-id
 * 7. Remove this file from src/examples/ and move to src/components/
 */

/* 
 * Uncomment these imports after installing firebase:
 * 
 * import { initializeApp } from 'firebase/app';
 * import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
 * import { useAuth } from '../contexts/AuthContext';
 * import { useNavigate } from 'react-router-dom';
 * import { useState } from 'react';
 */

// Placeholder to prevent TypeScript errors
// Remove this after uncommenting the imports above
const initializeApp = (config: any) => ({});
const getAuth = (app: any) => ({});
const signInWithPopup = async (auth: any, provider: any) => ({ user: { getIdToken: async () => '' } });
const GoogleAuthProvider = class {};
const useAuth = () => ({ googleSignIn: async (token: string) => {} });
const useNavigate = () => (path: string) => {};
const useState = (initial: any) => [initial, (v: any) => {}];

// Firebase configuration (use environment variables in production)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function GoogleAuthExample() {
  const { googleSignIn } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      // Step 1: Sign in with Google using Firebase
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Step 2: Get the ID token from Firebase
      const idToken = await result.user.getIdToken();

      // Step 3: Send the ID token to your backend
      await googleSignIn(idToken);

      // Step 4: Redirect to dashboard on success
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg border border-gray-300 transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {loading ? 'Signing in...' : 'Continue with Google'}
      </button>

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}

/**
 * USAGE IN Auth.tsx:
 * 
 * Add this button below the regular login/signup form:
 * 
 * import GoogleAuthExample from './GoogleAuthExample';
 * 
 * // Inside the form component, after the submit button:
 * <div className="relative my-4">
 *   <div className="absolute inset-0 flex items-center">
 *     <div className="w-full border-t border-slate-600"></div>
 *   </div>
 *   <div className="relative flex justify-center text-sm">
 *     <span className="px-2 bg-slate-900 text-slate-400">Or continue with</span>
 *   </div>
 * </div>
 * 
 * <GoogleAuthExample />
 */

/**
 * API ENDPOINT CALLED:
 * POST /auth/google-signin
 * 
 * Request Body:
 * {
 *   "idToken": "firebase-id-token-from-frontend"
 * }
 * 
 * Response:
 * {
 *   "accessToken": "jwt-token",
 *   "user": {
 *     "id": "user-id",
 *     "email": "user@gmail.com",
 *     "name": "User Name",
 *     "role": "user",
 *     "isVerified": true,
 *     "registrationType": "personal"
 *   }
 * }
 */

/**
 * ENVIRONMENT VARIABLES (.env):
 * 
 * # Backend API
 * VITE_API_URL=http://localhost:3000/api
 * 
 * # Firebase Configuration
 * VITE_FIREBASE_API_KEY=AIzaSy...
 * VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
 * VITE_FIREBASE_PROJECT_ID=your-project-id
 */
