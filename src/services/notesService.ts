import apiClient from './api';

export interface Note {
  _id: string;
  title: string;
  content: string;
  reference: {
    type: 'pdf' | 'audio' | 'quiz' | 'video';
    id: string;
    metadata?: {
      page?: number;
      timestamp?: number;
      [key: string]: any;
    };
  };
  userId: string;
  tags: string[];
  isBookmarked: boolean;
  isFavourite: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteDto {
  title: string;
  content: string;
  reference: {
    type: string;
    id: string;
    metadata?: any;
  };
  tags?: string[];
  isBookmarked?: boolean;
  isFavourite?: boolean;
}

const notesService = {
  async createNote(data: CreateNoteDto): Promise<Note> {
    return apiClient<Note>('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getNotes(params?: {
    page?: number;
    limit?: number;
    referenceType?: string;
    referenceId?: string;
    isBookmarked?: boolean;
    isFavourite?: boolean;
    tags?: string;
  }): Promise<{ items: Note[]; total: number; page: number; limit: number; totalPages: number }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.referenceType) queryParams.append('referenceType', params.referenceType);
    if (params?.referenceId) queryParams.append('referenceId', params.referenceId);
    if (params?.isBookmarked !== undefined) queryParams.append('isBookmarked', params.isBookmarked.toString());
    if (params?.isFavourite !== undefined) queryParams.append('isFavourite', params.isFavourite.toString());
    if (params?.tags) queryParams.append('tags', params.tags);

    const queryString = queryParams.toString();
    return apiClient<{ items: Note[]; total: number; page: number; limit: number; totalPages: number }>(
      `/notes${queryString ? `?${queryString}` : ''}`,
      { method: 'GET' }
    );
  },

  async getNotesByReference(type: string, id: string): Promise<Note[]> {
    return apiClient<Note[]>(`/notes/reference/${type}/${id}`, {
      method: 'GET',
    });
  },

  async getNote(id: string): Promise<Note> {
    return apiClient<Note>(`/notes/${id}`, {
      method: 'GET',
    });
  },

  async updateNote(id: string, data: Partial<CreateNoteDto>): Promise<Note> {
    return apiClient<Note>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async toggleBookmark(id: string): Promise<Note> {
    return apiClient<Note>(`/notes/${id}/bookmark`, {
      method: 'PUT',
    });
  },

  async toggleFavourite(id: string): Promise<Note> {
    return apiClient<Note>(`/notes/${id}/favourite`, {
      method: 'PUT',
    });
  },

  async deleteNote(id: string): Promise<void> {
    return apiClient<void>(`/notes/${id}`, {
      method: 'DELETE',
    });
  },

  async getTags(): Promise<string[]> {
    return apiClient<string[]>('/notes/tags', {
      method: 'GET',
    });
  },
};

export default notesService;
