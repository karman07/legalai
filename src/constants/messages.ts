/**
 * Application Messages Constants
 * Success Messages, Error Messages, and Validation Messages
 */

export const SUCCESS_MESSAGES = {
  // User Management
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  USER_VERIFIED: 'User verified successfully',
  PASSWORD_UPDATED: 'Password updated successfully',
  ROLE_UPDATED: 'User role updated successfully',
  STATUS_UPDATED: 'User status updated successfully',
  
  // Authentication
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logged out successfully',
} as const;

export const ERROR_MESSAGES = {
  // Authentication Errors
  UNAUTHORIZED: 'You are not authorized to perform this action',
  INVALID_CREDENTIALS: 'Invalid email or password',
  SESSION_EXPIRED: 'Your session has expired. Please login again',
  
  // User Management Errors
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User with this email already exists',
  INVALID_USER_DATA: 'Invalid user data provided',
  
  // General Errors
  NETWORK_ERROR: 'Network error. Please check your connection',
  SERVER_ERROR: 'Something went wrong. Please try again later',
  VALIDATION_ERROR: 'Please check the form and try again',
  FORBIDDEN: 'You do not have permission to access this resource',
  
  // Field Validation
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  PASSWORD_WEAK: 'Password must contain uppercase, lowercase, number and special character',
} as const;

export const CONFIRMATION_MESSAGES = {
  DELETE_USER: 'Are you sure you want to delete this user? This action cannot be undone.',
  DEACTIVATE_USER: 'Are you sure you want to deactivate this user?',
  ACTIVATE_USER: 'Are you sure you want to activate this user?',
  CHANGE_ROLE: 'Are you sure you want to change this user\'s role?',
  RESET_PASSWORD: 'Are you sure you want to reset this user\'s password?',
} as const;

export const INFO_MESSAGES = {
  LOADING: 'Loading...',
  NO_DATA: 'No data available',
  NO_USERS_FOUND: 'No users found',
  SEARCH_PLACEHOLDER: 'Search by name, email, or institute ID...',
  EMPTY_STATE: 'Get started by creating your first user',
} as const;
