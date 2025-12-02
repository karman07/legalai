/**
 * User and Application Constants
 */

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export const REGISTRATION_TYPES = {
  PERSONAL: 'personal',
  INSTITUTE: 'institute',
} as const;

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export const VERIFICATION_STATUS = {
  VERIFIED: 'verified',
  UNVERIFIED: 'unverified',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMIT_OPTIONS: [10, 20, 50, 100],
} as const;

export const CHART_COLORS = {
  PRIMARY: '#3b82f6',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#6366f1',
  PURPLE: '#a855f7',
  PINK: '#ec4899',
  TEAL: '#14b8a6',
} as const;

export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export const LOCAL_STORAGE_KEYS = {
  ADMIN_TOKEN: 'admin_token',
  THEME: 'theme',
  USER_DATA: 'user_data',
} as const;

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
} as const;

export const ADMIN_CREDENTIALS = {
  DEFAULT_EMAIL: 'admin@legalpadhai.com',
  DEFAULT_PASSWORD: 'Admin@123456',
} as const;

export const RATE_LIMITS = {
  SEARCH: 100, // requests per minute
  CREATE_USER: 10,
  UPDATE_OPERATIONS: 30,
  DELETE_USER: 5,
  GET_OPERATIONS: 200,
} as const;
