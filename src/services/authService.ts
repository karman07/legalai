import apiClient from './api';

export interface RegisterPersonalRequest {
  name: string;
  email: string;
  password: string;
  registrationType: 'personal';
  phoneNumber?: string;
  address?: string;
}

export interface RegisterInstituteRequest {
  name: string;
  email: string;
  password: string;
  registrationType: 'institute';
  instituteId: string;
  instituteName?: string;
  phoneNumber?: string;
  address?: string;
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

export interface GoogleSignInRequest {
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
  address?: string;
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
   * Sign in with Google (via Firebase ID token)
   */
  async googleSignIn(data: GoogleSignInRequest): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/auth/google-signin', {
      method: 'POST',
      body: JSON.stringify(data),
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
