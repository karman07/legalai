export interface AudioLesson {
  _id: string;
  title: string;
  description?: string;
  category: string;
  tags?: string[];
  language?: string;
  duration?: number;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  transcriptUrl?: string;
  transcriptStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PDF {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  caseTitle?: string;
  caseNumber?: string;
  year?: number;
  court?: {
    id: string;
    name: string;
    level: string;
  };
  keywords?: string[];
  judges?: string[];
  summary?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedAudioResponse {
  audioLessons: AudioLesson[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedPDFResponse {
  pdfs: PDF[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Category {
  id: string;
  name: string;
  count?: number;
}
