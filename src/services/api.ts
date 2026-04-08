// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.legalpadhai.ai/api';

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
export interface AudioFile {
  url: string;
  fileName: string;
  fileSize: number;
  duration?: number;
}

export interface AudioSubsection {
  title: string;
  hindiText?: string;
  englishText?: string;
  easyHindiText?: string;
  easyEnglishText?: string;
  hindiAudio?: AudioFile;
  englishAudio?: AudioFile;
  easyHindiAudio?: AudioFile;
  easyEnglishAudio?: AudioFile;
}

export interface AudioSection {
  title: string;
  totalSubsections?: number;
  hindiText?: string;
  englishText?: string;
  easyHindiText?: string;
  easyEnglishText?: string;
  hindiAudio?: AudioFile;
  englishAudio?: AudioFile;
  easyHindiAudio?: AudioFile;
  easyEnglishAudio?: AudioFile;
  subsections?: AudioSubsection[];
}

export interface AudioLesson {
  _id: string;
  title: string;
  headTitle?: string;
  description?: string;
  totalSections?: number;
  totalSubsections?: number;
  // sections is NOT included in the head response — use audioLessonsAPI.getSections()
  sections?: AudioSection[];
  category?: string;
  tags?: string[];
  isActive: boolean;
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

/** Slim section entry returned by GET /:id/sections (no subsection bodies) */
export interface AudioSectionSlim {
  _index: number;
  title: string;
  totalSubsections: number;
  hasEnglishAudio: boolean;
  hasHindiAudio: boolean;
  hasEasyEnglishAudio: boolean;
  hasEasyHindiAudio: boolean;
  englishTextPreview: string;
}

export interface AudioSectionsResponse {
  items: AudioSectionSlim[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Full section with subsections returned by GET /:id/sections/:index */
export interface AudioSectionDetail extends AudioSection {
  _index: number;
}

export const audioLessonsAPI = {
  getAudioLessons: async (page = 1, limit = 10, category?: string): Promise<AudioLessonsResponse> => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (category) params.append('category', category);
    return apiClient<AudioLessonsResponse>(`/audio-lessons?${params}`);
  },
  /** Returns lesson head (no sections array) */
  getAudioLesson: async (id: string): Promise<AudioLesson> => {
    return apiClient<AudioLesson>(`/audio-lessons/${id}`);
  },
  /** Paginated slim section list — safe for large acts */
  getSections: async (id: string, page = 1, limit = 20): Promise<AudioSectionsResponse> => {
    return apiClient<AudioSectionsResponse>(`/audio-lessons/${id}/sections?page=${page}&limit=${limit}`);
  },
  /** Full section detail including subsections — loaded only when user navigates into a section */
  getSectionDetail: async (id: string, sectionIndex: number): Promise<AudioSectionDetail> => {
    return apiClient<AudioSectionDetail>(`/audio-lessons/${id}/sections/${sectionIndex}`);
  },
};

export default apiClient;
