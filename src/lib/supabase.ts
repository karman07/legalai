// Type definitions for the application
// Note: No database connection configured

export type UserProfile = {
  id: string;
  full_name: string;
  email: string;
  role: 'student' | 'educator' | 'admin';
  institution: string | null;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: string;
  email: string;
};

export type MCQCategory = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type MCQQuestion = {
  id: string;
  category_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string | null;
  difficulty_level: 'easy' | 'medium' | 'hard';
  created_at: string;
};

export type Court = {
  id: string;
  name: string;
  level: 'supreme' | 'high' | 'district';
  state: string | null;
  created_at: string;
};

export type CaseLaw = {
  id: string;
  case_title: string;
  case_number: string;
  court_id: string | null;
  judgment_date: string;
  year: number;
  citation: string | null;
  judges: string[] | null;
  summary: string;
  full_text: string | null;
  keywords: string[] | null;
  category: string | null;
  created_at: string;
};

export type TTSContent = {
  id: string;
  title: string;
  text_content: string;
  audio_url: string | null;
  category: string | null;
  duration_seconds: number | null;
  language: string;
  created_at: string;
};

export type ChatbotConversation = {
  id: string;
  user_id: string;
  chatbot_type: 'general' | 'legal_expert';
  message: string;
  response: string;
  created_at: string;
};

export type ScannedAnswer = {
  id: string;
  user_id: string;
  question_text: string;
  image_url: string;
  evaluation_status: 'pending' | 'evaluated' | 'in_review';
  marks_obtained: number | null;
  total_marks: number;
  feedback: string | null;
  evaluated_by: string | null;
  evaluated_at: string | null;
  submitted_at: string;
};

export type Note = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string | null;
  tags: string[] | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
};

export type Doubt = {
  id: string;
  student_id: string;
  title: string;
  question: string;
  subject: string | null;
  status: 'pending' | 'answered' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
};

export type DoubtResponse = {
  id: string;
  doubt_id: string;
  teacher_id: string;
  response: string;
  created_at: string;
};

export type MCQTestSession = {
  id: string;
  user_id: string;
  mode: 'pyq' | 'mock' | 'custom';
  category_id: string | null;
  title: string;
  total_questions: number;
  total_marks: number;
  obtained_marks: number;
  accuracy_percentage: number;
  time_allocated_minutes: number | null;
  time_taken_seconds: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  started_at: string;
  completed_at: string | null;
  created_at: string;
};

export type MCQSessionQuestion = {
  id: string;
  session_id: string;
  question_id: string;
  selected_answer: 'A' | 'B' | 'C' | 'D' | null;
  is_correct: boolean | null;
  confidence_level: 'high' | 'medium' | 'low' | null;
  is_marked_for_review: boolean;
  time_spent_seconds: number;
  answered_at: string | null;
};

export type QuestionNote = {
  id: string;
  user_id: string;
  question_id: string;
  note_text: string;
  created_at: string;
  updated_at: string;
};

export type QuestionFlag = {
  id: string;
  user_id: string;
  question_id: string;
  flag_type: 'incorrect_answer' | 'unclear_question' | 'typo' | 'other';
  description: string | null;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
};

export type UserGamification = {
  user_id: string;
  total_points: number;
  current_streak_days: number;
  longest_streak_days: number;
  last_activity_date: string | null;
  level: number;
  badges: Badge[];
  created_at: string;
  updated_at: string;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
};

export type SavedChat = {
  id: string;
  user_id: string;
  chatbot_type: 'general' | 'legal_expert';
  title: string;
  conversation_data: ChatMessage[];
  is_bookmarked: boolean;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};
