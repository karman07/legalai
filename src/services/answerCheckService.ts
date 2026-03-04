import apiClient from './api';

export interface AnswerCheckResult {
  _id: string;
  question: string;
  totalMarks: number;
  scoredMarks: number;
  percentage: number;
  feedback: string;
  fileName: string;
  fileType: string;
  suggestions?: string;
  gradingCriteria?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnswerCheckHistory {
  results: AnswerCheckResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class AnswerCheckService {
  async checkAnswer(
    file: File,
    question: string,
    totalMarks: number,
    gradingCriteria?: string
  ): Promise<AnswerCheckResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('question', question);
    formData.append('totalMarks', totalMarks.toString());
    if (gradingCriteria) {
      formData.append('gradingCriteria', gradingCriteria);
    }

    const token = localStorage.getItem('accessToken');
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const response = await fetch(`${API_BASE_URL}/answer-check/check`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to check answer');
    }

    return response.json();
  }

  async getHistory(page = 1, limit = 10): Promise<AnswerCheckHistory> {
    return apiClient(`/answer-check/history?page=${page}&limit=${limit}`);
  }

  async getById(id: string): Promise<AnswerCheckResult> {
    return apiClient(`/answer-check/${id}`);
  }
}

export default new AnswerCheckService();
