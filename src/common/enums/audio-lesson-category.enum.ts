export interface AudioLessonCategory {
  id: string;
  name: string;
  description: string;
  sections: number;
}

export const AUDIO_LESSON_CATEGORIES: AudioLessonCategory[] = [
  { id: 'constitution', name: 'Constitution of India', description: 'Fundamental law of India', sections: 470 },
  { id: 'ipc', name: 'Indian Penal Code (IPC)', description: 'Criminal offenses and punishments', sections: 511 },
  { id: 'bns', name: 'Bharatiya Nyaya Sanhita (BNS)', description: 'New criminal code replacing IPC', sections: 358 },
  { id: 'crpc', name: 'Code of Criminal Procedure (CrPC)', description: 'Criminal procedure code', sections: 484 },
  { id: 'bnss', name: 'Bharatiya Nagarik Suraksha Sanhita (BNSS)', description: 'New criminal procedure code', sections: 531 },
  { id: 'iea', name: 'Indian Evidence Act', description: 'Law of evidence', sections: 167 },
  { id: 'bse', name: 'Bharatiya Sakshya Adhiniyam (BSE)', description: 'New evidence law', sections: 170 },
  { id: 'cpc', name: 'Civil Procedure Code (CPC)', description: 'Civil court procedures', sections: 158 },
  { id: 'contract', name: 'Indian Contract Act', description: 'Law of contracts', sections: 238 },
  { id: 'companies', name: 'Companies Act', description: 'Corporate law', sections: 470 },
];

export const VALID_CATEGORY_IDS = AUDIO_LESSON_CATEGORIES.map(cat => cat.id);

export function getCategoryById(id: string): AudioLessonCategory | undefined {
  return AUDIO_LESSON_CATEGORIES.find(cat => cat.id === id);
}

export function getCategoryByName(name: string): AudioLessonCategory | undefined {
  return AUDIO_LESSON_CATEGORIES.find(cat => cat.name.toLowerCase() === name.toLowerCase());
}
