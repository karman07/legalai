export type DashboardMetricKey = 'questionsPracticed' | 'notesCreated' | 'casesViewed';

export interface DashboardMetrics {
  questionsPracticed: number;
  notesCreated: number;
  casesViewed: number;
  studyStreak: number;
  lastUpdated: string | null;
}

const STORAGE_PREFIX = 'legalai.dashboardMetrics';
const HISTORY_PREFIX = 'legalai.activityHistory';

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function shiftDate(dateString: string, days: number): string {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return toDateString(date);
}

function safeParseStringArray(rawValue: string | null): string[] {
  if (!rawValue) return [];
  try {
    const parsed = JSON.parse(rawValue) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
}

function safeParseMetrics(rawValue: string | null): Partial<DashboardMetrics> {
  if (!rawValue) return {};
  try {
    const parsed = JSON.parse(rawValue) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as Partial<DashboardMetrics>;
  } catch {
    return {};
  }
}

function getMetricsKey(userId: string): string {
  return `${STORAGE_PREFIX}.${userId}`;
}

function getHistoryKey(userId: string): string {
  return `${HISTORY_PREFIX}.${userId}`;
}

function getActivityHistory(userId: string): string[] {
  return safeParseStringArray(localStorage.getItem(getHistoryKey(userId)));
}

function saveActivityHistory(userId: string, history: string[]): void {
  localStorage.setItem(getHistoryKey(userId), JSON.stringify(history));
}

function computeStreak(history: string[]): number {
  if (history.length === 0) return 0;

  const uniqueSorted = Array.from(new Set(history)).sort();
  const historySet = new Set(uniqueSorted);
  const today = getTodayDateString();

  let cursor = today;
  let streak = 0;

  while (historySet.has(cursor)) {
    streak += 1;
    cursor = shiftDate(cursor, -1);
  }

  return streak;
}

function getDefaultMetrics(): DashboardMetrics {
  return {
    questionsPracticed: 0,
    notesCreated: 0,
    casesViewed: 0,
    studyStreak: 0,
    lastUpdated: null,
  };
}

function sanitizeNumber(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return value < 0 ? 0 : Math.floor(value);
}

function saveMetrics(userId: string, metrics: DashboardMetrics): void {
  localStorage.setItem(getMetricsKey(userId), JSON.stringify(metrics));
}

export function getDashboardMetrics(userId: string): DashboardMetrics {
  const parsed = safeParseMetrics(localStorage.getItem(getMetricsKey(userId)));
  const history = getActivityHistory(userId);
  const base = getDefaultMetrics();

  return {
    questionsPracticed: sanitizeNumber(parsed.questionsPracticed),
    notesCreated: sanitizeNumber(parsed.notesCreated),
    casesViewed: sanitizeNumber(parsed.casesViewed),
    studyStreak: computeStreak(history),
    lastUpdated: typeof parsed.lastUpdated === 'string' ? parsed.lastUpdated : base.lastUpdated,
  };
}

export function trackDailyActivity(userId: string): DashboardMetrics {
  const today = getTodayDateString();
  const history = getActivityHistory(userId);

  if (!history.includes(today)) {
    history.push(today);
    history.sort();
    saveActivityHistory(userId, history.slice(-365));
  }

  const current = getDashboardMetrics(userId);
  const next: DashboardMetrics = {
    ...current,
    studyStreak: computeStreak(getActivityHistory(userId)),
    lastUpdated: new Date().toISOString(),
  };
  saveMetrics(userId, next);
  return next;
}

export function incrementDashboardMetric(
  userId: string,
  metric: DashboardMetricKey,
  amount = 1
): DashboardMetrics {
  const current = trackDailyActivity(userId);
  const delta = Number.isFinite(amount) ? Math.max(0, Math.floor(amount)) : 0;

  const next: DashboardMetrics = {
    ...current,
    [metric]: sanitizeNumber(current[metric] + delta),
    lastUpdated: new Date().toISOString(),
  };

  saveMetrics(userId, next);
  return next;
}

export function setDashboardMetric(
  userId: string,
  metric: DashboardMetricKey,
  value: number
): DashboardMetrics {
  const current = trackDailyActivity(userId);
  const next: DashboardMetrics = {
    ...current,
    [metric]: sanitizeNumber(value),
    lastUpdated: new Date().toISOString(),
  };

  saveMetrics(userId, next);
  return next;
}