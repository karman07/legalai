export interface AudioLesson {
  _id: string;
  title: string;
  description?: string;
  category: string;
  tags?: string[];
  englishAudio?: {
    url: string;
    fileName: string;
    fileSize: number;
  };
  hindiAudio?: {
    url: string;
    fileName: string;
    fileSize: number;
  };
  englishTranscription?: string;
  hindiTranscription?: string;
  easyEnglishTranscription?: string;
  easyHindiTranscription?: string;
  sections?: Array<{
    title: string;
    startTime: number;
    endTime: number;
    hindiText?: string;
    englishText?: string;
    easyHindiText?: string;
    easyEnglishText?: string;
  }>;
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
