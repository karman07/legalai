import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Scale, BookOpen, MessageSquare, FileText, Volume2,
  BookMarked, ArrowRight, LayoutGrid, FolderKanban,
  Zap, Target, TrendingUp, ChevronRight,
} from 'lucide-react';
import notesService from '../services/notesService';
import { DashboardMetrics, getDashboardMetrics, setDashboardMetric, trackDailyActivity } from '../lib/dashboardMetrics';
import ProgressCharts from '../components/ProgressCharts';
import FeatureLayout from '../components/FeatureLayout';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardMetrics>({
    questionsPracticed: 0,
    notesCreated: 0,
    casesViewed: 0,
    studyStreak: 0,
    lastUpdated: null,
  });

  useEffect(() => {
    const userId = user?.id || user?._id;
    if (!userId) return;

    const localMetrics = trackDailyActivity(userId);
    setStats(localMetrics);

    let isMounted = true;

    const loadNotesCount = async () => {
      try {
        const notesResponse = await notesService.getNotes({ page: 1, limit: 1 });
        const merged = setDashboardMetric(userId, 'notesCreated', notesResponse.total || 0);
        if (isMounted) setStats(merged);
      } catch {
        if (isMounted) setStats(getDashboardMetrics(userId));
      }
    };

    void loadNotesCount();
    return () => { isMounted = false; };
  }, [user?.id, user?._id]);

  const features = [
    {
      icon: BookOpen, title: 'MCQ Quiz',
      description: 'Practice multiple-choice questions across all Indian law subjects',
      path: '/mcq', bg: 'bg-blue-50', iconColor: 'text-blue-600', border: 'hover:border-blue-200',
    },
    {
      icon: Scale, title: 'Case Laws',
      description: 'Browse judgments by year, court, and legal category',
      path: '/cases', bg: 'bg-gold-50', iconColor: 'text-gold-600', border: 'hover:border-gold-200',
    },
    {
      icon: FolderKanban, title: 'Resources',
      description: 'Access admin-published PDF and Markdown study resources',
      path: '/resources', bg: 'bg-indigo-50', iconColor: 'text-indigo-600', border: 'hover:border-indigo-200',
    },
    {
      icon: BookMarked, title: 'Study Materials',
      description: 'Open curated category-wise study materials from admins',
      path: '/study-materials', bg: 'bg-amber-50', iconColor: 'text-amber-600', border: 'hover:border-amber-200',
    },
    {
      icon: BookMarked, title: 'My Notes',
      description: 'Create and organize personal study notes with tags',
      path: '/notes', bg: 'bg-emerald-50', iconColor: 'text-emerald-600', border: 'hover:border-emerald-200',
    },
    {
      icon: MessageSquare, title: 'Legal AI',
      description: 'AI chatbot for general legal study and exam prep help',
      path: '/chatbot', bg: 'bg-cyan-50', iconColor: 'text-cyan-600', border: 'hover:border-cyan-200',
    },
    {
      icon: Volume2, title: 'Audiobooks',
      description: 'Read Indian laws with audio narration and simplified language',
      path: '/audio', bg: 'bg-gold-50', iconColor: 'text-gold-600', border: 'hover:border-gold-200',
    },
    {
      icon: FileText, title: 'Answer Review',
      description: 'Submit written answers and get detailed AI-powered feedback',
      path: '/answers', bg: 'bg-pink-50', iconColor: 'text-pink-600', border: 'hover:border-pink-200',
    },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <FeatureLayout>

      {/* ── Welcome Banner ──────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900 rounded-2xl p-6 sm:p-8 mb-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-56 h-56 bg-gold-500/15 rounded-full blur-3xl pointer-events-none -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none translate-y-1/3 -translate-x-1/4" />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-brand-400 text-sm font-medium mb-1">{greeting}</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
              {user?.name?.split(' ')[0] || 'there'}!
            </h1>
            <p className="text-brand-400 text-sm leading-relaxed max-w-sm">
              {stats.studyStreak > 0
                ? `You're on a ${stats.studyStreak}-day streak. Keep going!`
                : 'Ready to study? Pick a tool below and get started.'}
            </p>
          </div>

          {/* Streak pill */}
          <div className="flex-shrink-0 flex flex-col items-center gap-1 bg-gold-500/15 border border-gold-500/25 rounded-2xl px-4 py-3">
            <Zap className="w-5 h-5 text-gold-400" />
            <span className="text-xl font-extrabold text-white leading-none">{stats.studyStreak}</span>
            <span className="text-[10px] font-semibold text-gold-300 uppercase tracking-wider">Day{stats.studyStreak !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* ── Quick Stats ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: 'Questions', value: stats.questionsPracticed.toLocaleString('en-IN'),
            Icon: BookOpen, iconBg: 'bg-blue-50 dark:bg-blue-500/10', iconColor: 'text-blue-600 dark:text-blue-400',
            border: 'border-blue-100 dark:border-blue-500/20',
          },
          {
            label: 'Notes', value: stats.notesCreated.toLocaleString('en-IN'),
            Icon: BookMarked, iconBg: 'bg-emerald-50 dark:bg-emerald-500/10', iconColor: 'text-emerald-600 dark:text-emerald-400',
            border: 'border-emerald-100 dark:border-emerald-500/20',
          },
          {
            label: 'Cases Viewed', value: stats.casesViewed.toLocaleString('en-IN'),
            Icon: Scale, iconBg: 'bg-gold-50 dark:bg-gold-500/10', iconColor: 'text-gold-600 dark:text-gold-400',
            border: 'border-gold-100 dark:border-gold-500/20',
          },
          {
            label: 'Day Streak', value: String(stats.studyStreak),
            Icon: Zap, iconBg: 'bg-violet-50 dark:bg-violet-500/10', iconColor: 'text-violet-600 dark:text-violet-400',
            border: 'border-violet-100 dark:border-violet-500/20',
          },
        ].map((s, i) => (
          <div key={i} className={`bg-white dark:bg-brand-800 rounded-2xl border ${s.border} p-4 shadow-sm`}>
            <div className={`w-9 h-9 ${s.iconBg} rounded-xl flex items-center justify-center mb-3`}>
              <s.Icon className={`w-4.5 h-4.5 ${s.iconColor}`} />
            </div>
            <div className="text-2xl font-extrabold text-brand-900 dark:text-brand-100 leading-none">{s.value}</div>
            <div className="text-xs text-brand-400 dark:text-brand-500 mt-1 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Progress Analytics ──────────────────────────── */}
      <div className="mb-6">
        <ProgressCharts />
      </div>

      {/* ── Learning Tools ──────────────────────────────── */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-brand-900 dark:text-brand-100">Learning Tools</h2>
            <p className="text-xs text-brand-400 mt-0.5">Everything you need to prepare for judiciary exams</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <button
                key={idx}
                onClick={() => navigate(f.path)}
                className={`group bg-white dark:bg-brand-800 border border-brand-200 dark:border-brand-700 ${f.border} rounded-2xl p-5 text-left hover:shadow-elevated transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]`}
              >
                <div className={`inline-flex items-center justify-center w-11 h-11 ${f.bg} rounded-xl mb-4`}>
                  <Icon className={`w-5 h-5 ${f.iconColor}`} />
                </div>
                <h3 className="text-sm font-bold text-brand-900 dark:text-brand-100 mb-1.5">
                  {f.title}
                </h3>
                <p className="text-xs text-brand-500 dark:text-brand-400 leading-relaxed mb-4">{f.description}</p>
                <div className={`flex items-center justify-between`}>
                  <span className={`text-xs font-semibold ${f.iconColor}`}>Open</span>
                  <div className={`w-6 h-6 rounded-lg ${f.bg} flex items-center justify-center group-hover:translate-x-0.5 transition-transform`}>
                    <ChevronRight className={`w-3.5 h-3.5 ${f.iconColor}`} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </FeatureLayout>
  );
}
