/**
 * Admin API Service
 * Handles all API calls to the LegalPadhai backend
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { toast } from 'sonner';
import { API_CONFIG, API_ENDPOINTS, HTTP_STATUS } from '../constants/api';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages';
import { LOCAL_STORAGE_KEYS } from '../constants/app';
import type {
  User,
  UserStats,
  PaginatedResponse,
  CreateUserPayload,
  UpdateUserRolePayload,
  LoginPayload,
  AuthResponse,
  SearchResponse,
  ApiError,
} from '../types';

class AdminService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Initialize token from localStorage
    this.token = localStorage.getItem(LOCAL_STORAGE_KEYS.ADMIN_TOKEN);
    if (this.token) {
      this.setAuthToken(this.token);
    }

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.token = token;
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem(LOCAL_STORAGE_KEYS.ADMIN_TOKEN, token);
  }

  /**
   * Remove authentication token
   */
  removeAuthToken(): void {
    this.token = null;
    delete this.api.defaults.headers.common['Authorization'];
    localStorage.removeItem(LOCAL_STORAGE_KEYS.ADMIN_TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_DATA);
  }

  /**
   * Handle API errors
   */
  private handleError(error: AxiosError<ApiError>): void {
    if (!error.response) {
      toast.error(ERROR_MESSAGES.NETWORK_ERROR);
      return;
    }

    const { status, data } = error.response;

    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED:
        toast.error(ERROR_MESSAGES.SESSION_EXPIRED);
        this.removeAuthToken();
        // Let App component handle redirect to login
        break;
      case HTTP_STATUS.FORBIDDEN:
        toast.error(ERROR_MESSAGES.FORBIDDEN);
        break;
      case HTTP_STATUS.NOT_FOUND:
        toast.error(data.message || ERROR_MESSAGES.USER_NOT_FOUND);
        break;
      case HTTP_STATUS.CONFLICT:
        toast.error(data.message || ERROR_MESSAGES.USER_ALREADY_EXISTS);
        break;
      case HTTP_STATUS.BAD_REQUEST:
        const message = Array.isArray(data.message) ? data.message[0] : data.message;
        toast.error(message || ERROR_MESSAGES.VALIDATION_ERROR);
        break;
      default:
        toast.error(ERROR_MESSAGES.SERVER_ERROR);
    }
  }

  /**
   * Login admin user
   */
  async login(credentials: LoginPayload): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      const { accessToken, user } = response.data;

      // Check if user is admin
      if (user.role !== 'admin') {
        toast.error(ERROR_MESSAGES.FORBIDDEN);
        throw new Error('Not an admin user');
      }

      this.setAuthToken(accessToken);
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      toast.success(SUCCESS_MESSAGES.LOGIN_SUCCESS);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout admin user
   */
  logout(): void {
    this.removeAuthToken();
    toast.success(SUCCESS_MESSAGES.LOGOUT_SUCCESS);
    // Don't redirect here - let the App component handle it
  }

  /**
   * Get all users with pagination
   */
  async getAllUsers(page = 1, limit = 10): Promise<PaginatedResponse<User>> {
    try {
      const response = await this.api.get<any>(
        API_ENDPOINTS.ADMIN.USERS,
        { params: { page, limit } }
      );
      // Map API response to our expected format
      const data = response.data;
      return {
        users: data.users || [],
        total: data.pagination?.total || 0,
        page: data.pagination?.page || page,
        limit: data.pagination?.limit || limit,
        totalPages: data.pagination?.pages || 1,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search users
   */
  async searchUsers(query: string): Promise<SearchResponse> {
    try {
      const response = await this.api.get<SearchResponse>(
        API_ENDPOINTS.ADMIN.USER_SEARCH,
        { params: { q: query } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<UserStats> {
    try {
      const response = await this.api.get<any>(
        API_ENDPOINTS.ADMIN.USER_STATS
      );
      const data = response.data;
      
      // Also fetch users to count registration types accurately
      const usersResponse = await this.api.get<any>(
        API_ENDPOINTS.ADMIN.USERS,
        { params: { page: 1, limit: 1000 } } // Get all users for counting
      );
      
      const users = usersResponse.data.users || [];
      const personalCount = users.filter((u: any) => u.registrationType === 'personal').length;
      const instituteCount = users.filter((u: any) => u.registrationType === 'institute').length;
      
      // Map API response to our expected format
      return {
        totalUsers: data.total || 0,
        activeUsers: data.active || 0,
        inactiveUsers: data.inactive || 0,
        verifiedUsers: data.verified || 0,
        unverifiedUsers: data.unverified || 0,
        adminUsers: data.byRole?.admin || 0,
        regularUsers: data.byRole?.user || 0,
        personalRegistrations: personalCount,
        instituteRegistrations: instituteCount,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    try {
      const response = await this.api.get<User>(
        API_ENDPOINTS.ADMIN.USER_BY_ID(userId)
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user with password (admin only)
   */
  async getUserWithPassword(userId: string): Promise<User & { password: string }> {
    try {
      const response = await this.api.get<User & { password: string }>(
        API_ENDPOINTS.ADMIN.USER_PASSWORD(userId)
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create new user
   */
  async createUser(userData: CreateUserPayload): Promise<{ message: string; userId: string; email: string }> {
    try {
      const response = await this.api.post<{ message: string; userId: string; email: string }>(
        API_ENDPOINTS.ADMIN.USERS,
        userData
      );
      toast.success(SUCCESS_MESSAGES.USER_CREATED);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: UpdateUserRolePayload['role']): Promise<{ message: string; user: User }> {
    try {
      const response = await this.api.put<{ message: string; user: User }>(
        API_ENDPOINTS.ADMIN.USER_ROLE(userId),
        { role }
      );
      toast.success(SUCCESS_MESSAGES.ROLE_UPDATED);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user password
   */
  async updateUserPassword(userId: string, password: string): Promise<{ message: string; userId: string }> {
    try {
      const response = await this.api.put<{ message: string; userId: string }>(
        API_ENDPOINTS.ADMIN.USER_PASSWORD(userId),
        { password }
      );
      toast.success(SUCCESS_MESSAGES.PASSWORD_UPDATED);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify user
   */
  async verifyUser(userId: string): Promise<{ message: string; user: User }> {
    try {
      const response = await this.api.put<{ message: string; user: User }>(
        API_ENDPOINTS.ADMIN.USER_VERIFY(userId)
      );
      toast.success(SUCCESS_MESSAGES.USER_VERIFIED);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Toggle user status (activate/deactivate)
   */
  async toggleUserStatus(userId: string): Promise<{ message: string; user: User }> {
    try {
      const response = await this.api.put<{ message: string; user: User }>(
        API_ENDPOINTS.ADMIN.USER_TOGGLE_STATUS(userId)
      );
      toast.success(SUCCESS_MESSAGES.STATUS_UPDATED);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<{ message: string; userId: string }> {
    try {
      const response = await this.api.delete<{ message: string; userId: string }>(
        API_ENDPOINTS.ADMIN.USER_BY_ID(userId)
      );
      toast.success(SUCCESS_MESSAGES.USER_DELETED);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * Get current admin user data
   */
  getCurrentUser(): AuthResponse['user'] | null {
    const userData = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  }
}

// Export singleton instance
export const adminService = new AdminService();
export default adminService;
