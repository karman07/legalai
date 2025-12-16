import apiClient from './api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Court {
  id: string;
  name: string;
  level: 'supreme' | 'high' | 'district';
  state?: string;
  created_at?: string;
}

export interface PDF {
  _id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadedBy?: string;
  isActive: boolean;
  // Case Law Fields
  caseTitle?: string;
  caseNumber?: string;
  court?: Court;
  judgmentDate?: string;
  year?: number;
  citation?: string;
  judges?: string[];
  summary?: string;
  fullText?: string;
  keywords?: string[];
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PDFListResponse {
  items: PDF[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class PDFService {
  /**
   * Get list of active PDFs with optional filters
   */
  async getPDFs(params?: {
    page?: number;
    limit?: number;
    category?: string;
    year?: number;
    courtLevel?: 'supreme' | 'high' | 'district';
  }): Promise<PDFListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.year) queryParams.append('year', params.year.toString());
    if (params?.courtLevel) queryParams.append('courtLevel', params.courtLevel);

    const queryString = queryParams.toString();
    const endpoint = `/pdfs${queryString ? `?${queryString}` : ''}`;

    return apiClient<PDFListResponse>(endpoint, {
      method: 'GET',
    });
  }

  /**
   * Get a specific PDF by ID
   */
  async getPDF(id: string): Promise<PDF> {
    return apiClient<PDF>(`/pdfs/${id}`, {
      method: 'GET',
    });
  }

  /**
   * Search PDFs by query
   */
  async searchPDFs(query: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<PDFListResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/pdfs/search?${queryParams.toString()}`;

    return apiClient<PDFListResponse>(endpoint, {
      method: 'GET',
    });
  }

  /**
   * Get PDFs by category
   */
  async getPDFsByCategory(category: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<PDFListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/pdfs/category/${encodeURIComponent(category)}${queryString ? `?${queryString}` : ''}`;

    return apiClient<PDFListResponse>(endpoint, {
      method: 'GET',
    });
  }

  /**
   * Get available categories
   */
  async getCategories(): Promise<{ categories: string[] }> {
    return apiClient<{ categories: string[] }>('/pdfs/categories', {
      method: 'GET',
    });
  }

  /**
   * Get full file URL for viewing
   */
  getFileUrl(fileUrl: string): string {
    // Remove leading slash if present
    const cleanUrl = fileUrl.startsWith('/') ? fileUrl.substring(1) : fileUrl;
    return `${API_BASE_URL.replace('/api', '')}/${cleanUrl}`;
  }
}

export default new PDFService();
