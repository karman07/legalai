/**
 * Quiz API Service (Admin)
 */
import axios, { AxiosInstance, AxiosError } from 'axios';
import { toast } from 'sonner';
import { API_CONFIG, API_ENDPOINTS } from '../constants/api';
import { LOCAL_STORAGE_KEYS } from '../constants/app';
import type {
  Quiz,
  CreateQuizPayload,
  UpdateQuizPayload,
  PaginatedQuizResponse,
} from '../types';

class QuizService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
    });

    // Inject auth token
    this.api.interceptors.request.use((config) => {
      if (!this.token) {
        this.token = localStorage.getItem(LOCAL_STORAGE_KEYS.ADMIN_TOKEN);
      }
      if (this.token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${this.token}`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const message = (error.response?.data as any)?.message || 'Request failed';
        toast.error(message);
        return Promise.reject(error);
      }
    );
  }

  async createQuiz(payload: CreateQuizPayload): Promise<Quiz> {
    const { data } = await this.api.post(API_ENDPOINTS.QUIZZES.CREATE, payload);
    toast.success('Quiz created successfully');
    return data.quiz || data;
  }

  async listQuizzes(params?: {
    topic?: string;
    page?: number;
    limit?: number;
    isPublished?: string | boolean;
  }): Promise<PaginatedQuizResponse> {
    const { data } = await this.api.get(API_ENDPOINTS.QUIZZES.LIST, { params });
    const pagination = data.pagination || {};
    return {
      quizzes: data.quizzes || data.items || [],
      pagination: {
        page: pagination.page ?? 1,
        limit: pagination.limit ?? 10,
        total: pagination.total ?? (data.total ?? 0),
        pages: pagination.pages ?? undefined,
        totalPages: pagination.totalPages ?? pagination.pages ?? 0,
      },
    };
  }

  async getQuizById(quizId: string): Promise<Quiz> {
    const { data } = await this.api.get(API_ENDPOINTS.QUIZZES.BY_ID(quizId));
    return data.quiz || data;
  }

  async updateQuiz(quizId: string, payload: UpdateQuizPayload): Promise<Quiz> {
    const { data } = await this.api.put(API_ENDPOINTS.QUIZZES.UPDATE(quizId), payload);
    toast.success('Quiz updated successfully');
    return data.quiz || data;
  }

  async deleteQuiz(quizId: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.QUIZZES.DELETE(quizId));
    toast.success('Quiz deleted successfully');
  }
}

export const quizService = new QuizService();
