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
  diary_no?: string;
  case_no?: string;
  pet?: string;
  pet_adv?: string;
  res_adv?: string;
  bench?: string;
  judgement_by?: string;
  judgment_dates?: Date;
  link?: string;
  file?: string;
  fileUrl?: string;
  createdAt?: string;
  updatedAt?: string;
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
  }): Promise<PDFListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

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
   * Get available case numbers
   */
  async getCaseNumbers(): Promise<{ caseNumbers: string[] }> {
    return apiClient<{ caseNumbers: string[] }>('/pdfs/case-numbers', {
      method: 'GET',
    });
  }

  /**
   * Get full file URL for viewing
   */
  getFileUrl(fileUrl: string): string {
    const cleanUrl = fileUrl.startsWith('/') ? fileUrl.substring(1) : fileUrl;
    return `${API_BASE_URL.replace('/api', '')}/${cleanUrl}`;
  }
}

export default new PDFService();
