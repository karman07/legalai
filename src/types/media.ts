export interface AudioFile {
  url: string;
  fileName: string;
  fileSize: number;
  duration?: number;
}

export interface AudioSubsection {
  title: string;
  startTime: number;
  endTime: number;
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
  startTime: number;
  endTime: number;
  hindiText?: string;
  englishText?: string;
  easyHindiText?: string;
  easyEnglishText?: string;
  hindiAudio?: AudioFile;
  englishAudio?: AudioFile;
  easyHindiAudio?: AudioFile;
  easyEnglishAudio?: AudioFile;
  subsections?: AudioSubsection[];
  totalSubsections?: number;
}

export interface AudioLesson {
  _id: string;
  title: string;
  headTitle?: string;
  description?: string;
  category: string;
  tags?: string[];
  sections?: AudioSection[];
  totalSections?: number;
  totalSubsections?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
