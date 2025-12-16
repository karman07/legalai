// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// API client with common headers
async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  return handleResponse<T>(response);
}

// Audio Lessons API
export interface AudioLesson {
  _id: string;
  title: string;
  description?: string;
  audioUrl: string;
  fileName: string;
  fileSize: number;
  category?: string;
  tags: string[];
  isActive: boolean;
  language?: string;
  transcriptionStatus: 'pending' | 'processing' | 'completed' | 'failed';
  transcript?: string;
  transcriptionError?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AudioLessonsResponse {
  items: AudioLesson[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const audioLessonsAPI = {
  getAudioLessons: async (page = 1, limit = 10): Promise<AudioLessonsResponse> => {
    return apiClient<AudioLessonsResponse>(`/audio-lessons?page=${page}&limit=${limit}`);
  },
};

export default apiClient;
