/**
 * TypeScript Types and Interfaces
 * LegalPadhai Admin Panel
 */

export type UserRole = 'admin' | 'user';
export type RegistrationType = 'personal' | 'institute';
export type ThemeMode = 'light' | 'dark';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  registrationType: RegistrationType;
  instituteId?: string | null;
  instituteName?: string | null;
  phoneNumber?: string;
  address?: string;
  firebaseUid?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  adminUsers: number;
  regularUsers: number;
  personalRegistrations: number;
  instituteRegistrations: number;
}

export interface PaginatedResponse<T> {
  users: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  registrationType: RegistrationType;
  instituteId?: string;
  instituteName?: string;
  phoneNumber?: string;
  address?: string;
}

export interface UpdateUserRolePayload {
  role: UserRole;
}

export interface UpdatePasswordPayload {
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    isVerified: boolean;
    registrationType: RegistrationType;
  };
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

export interface SearchResponse {
  users: User[];
  count: number;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Quiz Types
export type QuizType = 'pyq' | 'mocktest';

export interface QuizQuestion {
  text: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

export interface Quiz {
  _id: string;
  title: string;
  topic: string;
  type: QuizType;
  description?: string;
  isPublished: boolean;
  questions: QuizQuestion[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateQuizPayload {
  title: string;
  topic: string;
  type: QuizType;
  description?: string;
  isPublished?: boolean;
  questions: QuizQuestion[];
}

export interface UpdateQuizPayload {
  title?: string;
  topic?: string;
  type?: QuizType;
  description?: string;
  isPublished?: boolean;
  questions?: QuizQuestion[];
}

export interface PaginatedQuizResponse {
  quizzes: Quiz[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages?: number;
    totalPages?: number;
  };
}
