import apiClient from './api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.legalpadhai.ai/api';

export interface ResourceItem {
  _id: string;
  title: string;
  description?: string;
  fileType: 'pdf' | 'md';
  fileName: string;
  fileUrl: string;
  originalName?: string;
  category?: string;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceListResponse {
  items: ResourceItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

class ResourcesService {
  async getResources(params?: {
    page?: number;
    limit?: number;
    search?: string;
    fileType?: 'pdf' | 'md';
    category?: string;
  }): Promise<ResourceListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.fileType) queryParams.append('fileType', params.fileType);
    if (params?.category) queryParams.append('category', params.category);

    const queryString = queryParams.toString();
    return apiClient<ResourceListResponse>(`/resources${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  }

  async getCategories(): Promise<string[]> {
    return apiClient<string[]>('/resources/categories', {
      method: 'GET',
    });
  }

  getFileUrl(fileUrl: string): string {
    if (!fileUrl) return '';
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) return fileUrl;
    const cleanUrl = fileUrl.startsWith('/') ? fileUrl.substring(1) : fileUrl;
    const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;
    return `${baseUrl}/${cleanUrl}`;
  }
}

export default new ResourcesService();
