import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { UserProfile, RegisterRequest } from '../services/authService';
import { sendEmailVerification, signInWithEmailAndPassword, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../config/firebase';

type AuthContextType = {
  user: UserProfile | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    registrationType: 'personal' | 'institute',
    instituteName?: string,
    instituteId?: string,
    phoneNumber?: string
  ) => Promise<{ requiresLogin: boolean; message: string }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  firebaseSignIn: (idToken: string) => Promise<void>;
  googleSignIn: (idToken: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  sendVerificationEmail: (email: string, password: string) => Promise<void>;
  sendPasswordResetLink: (email: string) => Promise<void>;
  verifyResetCode: (code: string) => Promise<string>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user profile on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (authService.isAuthenticated()) {
        try {
          const profile = await authService.getProfile();
          // Normalize id field for backward compatibility
          setUser({ ...profile, id: profile._id || profile.id });
        } catch (error) {
          console.error('Failed to load user profile:', error);
          authService.removeToken();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    registrationType: 'personal' | 'institute',
    instituteName?: string,
    instituteId?: string,
    phoneNumber?: string
  ) => {
    setLoading(true);
    try {
      const registerData: RegisterRequest = registrationType === 'institute'
        ? {
          name: fullName,
          email,
          password,
          registrationType: 'institute',
          instituteId: instituteId || '',
          instituteName,
          phoneNumber,
        }
        : {
          name: fullName,
          email,
          password,
          registrationType: 'personal',
          phoneNumber,
        };

      // Register returns message and userId, user must login separately
      const response = await authService.register(registerData);

      // Send verification email via Firebase
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
          await sendEmailVerification(userCredential.user);
          await auth.signOut(); // Sign out from Firebase until they verify and login normally
        }
      } catch (fbError) {
        console.error('Failed to send initial verification email:', fbError);
        // We don't throw here to avoid failing registration if only email fails
      }

      return { requiresLogin: true, message: response.message };
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      authService.saveToken(response.accessToken);
      // Normalize id field for backward compatibility
      setUser({ ...response.user, id: response.user.id, _id: response.user.id } as UserProfile);
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const firebaseSignIn = async (idToken: string) => {
    setLoading(true);
    try {
      const response = await authService.firebaseSignIn({ idToken });
      authService.saveToken(response.accessToken);
      // Normalize id field for backward compatibility
      setUser({ ...response.user, id: response.user.id, _id: response.user.id } as UserProfile);
    } catch (error: any) {
      console.error('Firebase sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const googleSignIn = async (idToken: string) => {
    setLoading(true);
    try {
      const response = await authService.googleSignIn({ idToken });
      authService.saveToken(response.accessToken);
      setUser({ ...response.user, id: response.user.id, _id: response.user.id } as UserProfile);
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    authService.removeToken();
    setUser(null);
  };

  const refreshProfile = async () => {
    if (authService.isAuthenticated()) {
      try {
        const profile = await authService.getProfile();
        // Normalize id field for backward compatibility
        setUser({ ...profile, id: profile._id || profile.id });
      } catch (error) {
        console.error('Failed to refresh profile:', error);
        throw error;
      }
    }
  };

  const sendVerificationEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user);
      }
    } catch (error: any) {
      console.error('Failed to send verification email:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordResetLink = async (email: string) => {
    setLoading(true);
    try {
      await authService.forgotPassword(email);
    } catch (error: any) {
      console.error('Failed to trigger themed reset email:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyResetCode = async (code: string): Promise<string> => {
    try {
      return await verifyPasswordResetCode(auth, code);
    } catch (error: any) {
      console.error('Failed to verify reset code:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, firebaseSignIn, googleSignIn, refreshProfile, sendVerificationEmail, sendPasswordResetLink, verifyResetCode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
