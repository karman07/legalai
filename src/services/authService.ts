import apiClient from './api';

export interface RegisterPersonalRequest {
  name: string;
  email: string;
  password: string;
  registrationType: 'personal';
  phoneNumber?: string;
}

export interface RegisterInstituteRequest {
  name: string;
  email: string;
  password: string;
  registrationType: 'institute';
  instituteId: string;
  instituteName?: string;
  phoneNumber?: string;
}

export type RegisterRequest = RegisterPersonalRequest | RegisterInstituteRequest;

export interface RegisterResponse {
  message: string;
  userId: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface FirebaseSignInRequest {
  idToken: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    registrationType: 'personal' | 'institute';
    isVerified: boolean;
  };
}

export interface UserProfile {
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
  firebaseUid?: string;
  createdAt: string;
  lastLogin?: string;
}

class AuthService {
  /**
   * Register a new user (Personal or Institute)
   * Returns a message and userId, user must login after registration
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return apiClient<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Login with email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Unified Firebase Sign-In (bridging ANY Firebase login to backend)
   */
  async firebaseSignIn(data: FirebaseSignInRequest): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/auth/firebase-signin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Trigger themed LegalAI HTML reset email
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /**
   * Get current user profile
   * Requires authentication token
   */
  async getProfile(): Promise<UserProfile> {
    return apiClient<UserProfile>('/auth/profile', {
      method: 'GET',
    });
  }

  /**
   * Reset user password (verification-based, no current password required)
   * Providing idToken will deep-bind the account to Firebase
   */
  async resetPassword(email: string, newPassword: string, idToken?: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword, idToken }),
    });
  }

  /**
   * Sync email verification status from Firebase to backend
   */
  async verifyEmail(email: string): Promise<{ isVerified: boolean; message: string }> {
    return apiClient<{ isVerified: boolean; message: string }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /**
   * Save auth token to localStorage
   */
  saveToken(token: string): void {
    localStorage.setItem('accessToken', token);
  }

  /**
   * Remove auth token from localStorage
   */
  removeToken(): void {
    localStorage.removeItem('accessToken');
  }

  /**
   * Get auth token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export default new AuthService();
