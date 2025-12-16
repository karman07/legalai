import apiClient from './api';

export interface QuizQuestion {
  text: string;
  options: string[];
  explanation?: string;
}

export interface Quiz {
  _id: string;
  title: string;
  topic: string;
  type?: 'pyq' | 'mocktest';
  description: string;
  isPublished: boolean;
  questions: QuizQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizListResponse {
  items: Quiz[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QuizSubmitRequest {
  answers: number[];
}

export interface QuizResultDetail {
  question: string;
  selectedIndex: number;
  correctIndex: number;
  correct: boolean;
  explanation: string;
}

export interface QuizSubmitResponse {
  quizId: string;
  totalQuestions: number;
  score: number;
  percentage: number;
  details: QuizResultDetail[];
}

class QuizService {
  /**
   * Get list of published quizzes
   */
  async getQuizzes(params?: {
    topic?: string;
    type?: 'pyq' | 'mocktest';
    page?: number;
    limit?: number;
  }): Promise<QuizListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.topic) queryParams.append('topic', params.topic);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/quizzes${queryString ? `?${queryString}` : ''}`;

    return apiClient<QuizListResponse>(endpoint, {
      method: 'GET',
    });
  }

  /**
   * Get a specific published quiz
   */
  async getQuiz(id: string): Promise<Quiz> {
    return apiClient<Quiz>(`/quizzes/${id}`, {
      method: 'GET',
    });
  }

  /**
   * Submit quiz answers
   */
  async submitQuiz(id: string, answers: number[]): Promise<QuizSubmitResponse> {
    return apiClient<QuizSubmitResponse>(`/quizzes/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  /**
   * Generate AI quiz (JWT required)
   */
  async generateAIQuiz(topic: string, count: number): Promise<Quiz> {
    return apiClient<Quiz>(`/ai/quizzes/generate`, {
      method: 'POST',
      body: JSON.stringify({ topic, count }),
    });
  }
}

export default new QuizService();
