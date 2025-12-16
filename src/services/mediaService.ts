import axios, { AxiosInstance } from 'axios';
import { toast } from 'sonner';
import { API_CONFIG } from '../constants/api';
import { LOCAL_STORAGE_KEYS } from '../constants/app';
import type { AudioLesson, PDF, PaginatedAudioResponse, PaginatedPDFResponse, Category } from '../types/media';

class MediaService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: 60000,
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem(LOCAL_STORAGE_KEYS.ADMIN_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        const message = error.response?.data?.message || 'Request failed';
        toast.error(message);
        return Promise.reject(error);
      }
    );
  }

  // Audio APIs
  async uploadAudio(formData: FormData): Promise<AudioLesson> {
    const { data } = await this.api.post('/admin/audio-lessons', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    toast.success('Audio uploaded successfully');
    return data;
  }

  async listAudio(params?: { page?: number; limit?: number }): Promise<PaginatedAudioResponse> {
    const { data } = await this.api.get('/admin/audio-lessons', { params });
    return {
      audioLessons: data.audioLessons || data.items || [],
      pagination: {
        page: data.pagination?.page ?? 1,
        limit: data.pagination?.limit ?? 10,
        total: data.pagination?.total ?? 0,
        totalPages: data.pagination?.totalPages ?? 0,
      },
    };
  }

  async getAudioById(id: string): Promise<AudioLesson> {
    const { data } = await this.api.get(`/admin/audio-lessons/${id}`);
    return data;
  }

  async updateAudio(id: string, formData: FormData): Promise<AudioLesson> {
    const { data } = await this.api.put(`/admin/audio-lessons/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    toast.success('Audio updated successfully');
    return data;
  }

  async deleteAudio(id: string): Promise<void> {
    await this.api.delete(`/admin/audio-lessons/${id}`);
    toast.success('Audio deleted successfully');
  }

  async retryTranscription(id: string): Promise<void> {
    await this.api.post(`/admin/audio-lessons/${id}/retry-transcription`);
    toast.success('Transcription retry initiated');
  }

  async getCategories(): Promise<Category[]> {
    const { data } = await this.api.get('/admin/audio-lessons/categories');
    return data.categories || data;
  }

  // PDF APIs
  async uploadPDF(formData: FormData): Promise<PDF> {
    const { data } = await this.api.post('/admin/pdfs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    toast.success('PDF uploaded successfully');
    return data;
  }

  async listPDFs(params?: { page?: number; limit?: number; isActive?: boolean }): Promise<PaginatedPDFResponse> {
    const { data } = await this.api.get('/admin/pdfs', { params });
    return {
      pdfs: data.pdfs || data.items || [],
      pagination: {
        page: data.pagination?.page ?? 1,
        limit: data.pagination?.limit ?? 10,
        total: data.pagination?.total ?? 0,
        totalPages: data.pagination?.totalPages ?? 0,
      },
    };
  }

  async getPDFById(id: string): Promise<PDF> {
    const { data } = await this.api.get(`/admin/pdfs/${id}`);
    return data;
  }

  async updatePDF(id: string, formData: FormData): Promise<PDF> {
    const { data } = await this.api.put(`/admin/pdfs/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    toast.success('PDF updated successfully');
    return data;
  }

  async deletePDF(id: string): Promise<void> {
    await this.api.delete(`/admin/pdfs/${id}`);
    toast.success('PDF deleted successfully');
  }
}

export const mediaService = new MediaService();
