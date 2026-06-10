const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.legalpadhai.ai/api';

function getToken(): string | null {
  return localStorage.getItem('accessToken');
}

export type ProgressEventType =
  | 'law_read'
  | 'audio_listened'
  | 'quiz_taken'
  | 'case_viewed'
  | 'minutes_studied';

export interface DailyProgress {
  date: string;
  lawsRead: number;
  audioListened: number;
  quizzesTaken: number;
  casesViewed: number;
  minutesStudied: number;
}

export interface ProgressStats {
  daily: DailyProgress[];
  streak: number;
}

async function post(type: ProgressEventType, count = 1): Promise<void> {
  const token = getToken();
  if (!token) return;
  try {
    await fetch(`${API_BASE_URL}/progress/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ type, count }),
    });
  } catch {
    // silent — progress tracking is non-critical
  }
}

async function getStats(days = 30): Promise<ProgressStats | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/progress/stats?days=${days}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return res.json() as Promise<ProgressStats>;
  } catch {
    return null;
  }
}

const progressService = { track: post, getStats };
export default progressService;
