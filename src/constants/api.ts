/**
 * API Configuration Constants
 * LegalPadhai Admin Panel
 */

export const API_CONFIG = {
  BASE_URL: 'http://82.112.231.134:7001/api',
  TIMEOUT: 30000,
} as const;

export const API_ENDPOINTS = {
  // Admin Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
  },
  
  // Admin User Management
  ADMIN: {
    USERS: '/admin/users',
    USER_BY_ID: (userId: string) => `/admin/users/${userId}`,
    USER_SEARCH: '/admin/users/search',
    USER_STATS: '/admin/users/stats',
    USER_PASSWORD: (userId: string) => `/admin/users/${userId}/password`,
    USER_VERIFY: (userId: string) => `/admin/users/${userId}/verify`,
    USER_ROLE: (userId: string) => `/admin/users/${userId}/role`,
    USER_TOGGLE_STATUS: (userId: string) => `/admin/users/${userId}/toggle-status`,
  },
  
  // Admin Quiz Management
  QUIZZES: {
    LIST: '/admin/quizzes',
    CREATE: '/admin/quizzes',
    BY_ID: (quizId: string) => `/admin/quizzes/${quizId}`,
    UPDATE: (quizId: string) => `/admin/quizzes/${quizId}`,
    DELETE: (quizId: string) => `/admin/quizzes/${quizId}`,
  },
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;
