import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Scale, BookOpen, MessageSquare, FileText, Volume2,
  BookMarked, ArrowRight, LayoutGrid, FolderKanban,
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
      icon: MessageSquare, title: 'Study Assistant',
      description: 'AI chatbot for general legal study and exam prep help',
      path: '/chatbot', bg: 'bg-cyan-50', iconColor: 'text-cyan-600', border: 'hover:border-cyan-200',
    },
    {
      icon: Volume2, title: 'Bare Act Reader',
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
      {/* Welcome header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">👋</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-900 dark:text-brand-100 tracking-tight">
            {greeting}, {user?.name?.split(' ')[0] || 'there'}!
          </h1>
        </div>
        <p className="text-brand-500 dark:text-brand-300 text-sm">
          Choose a tool below to continue your legal education journey.
        </p>
      </div>

      {/* Quick stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Questions Practiced', value: stats.questionsPracticed.toLocaleString('en-IN'), icon: BookOpen },
          { label: 'Notes Created', value: stats.notesCreated.toLocaleString('en-IN'), icon: BookMarked },
          { label: 'Cases Viewed', value: stats.casesViewed.toLocaleString('en-IN'), icon: Scale },
          { label: 'Study Streak', value: `${stats.studyStreak} day${stats.studyStreak === 1 ? '' : 's'}`, icon: LayoutGrid },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white dark:bg-brand-800 rounded-xl border border-brand-200 dark:border-brand-700 p-4 shadow-card">
              <Icon className="w-4 h-4 text-brand-400 mb-2" />
              <div className="text-xl font-bold text-brand-900">{s.value}</div>
              <div className="text-xs text-brand-400 mt-0.5">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Progress Analytics */}
      <div className="mb-8">
        <ProgressCharts />
      </div>

      {/* Feature grid */}
      <div className="mb-4">
        <h2 className="text-sm font-bold text-brand-700 dark:text-brand-300 uppercase tracking-wider mb-4">Learning Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <button
                key={idx}
                onClick={() => navigate(f.path)}
                className={`group bg-white border border-brand-200 ${f.border} rounded-2xl p-5 text-left hover:shadow-elevated transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]`}
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 ${f.bg} rounded-xl mb-3`}>
                  <Icon className={`w-5 h-5 ${f.iconColor}`} />
                </div>
                <h3 className={`text-sm font-bold text-brand-900 mb-1.5 group-hover:${f.iconColor} transition-colors`}>
                  {f.title}
                </h3>
                <p className="text-xs text-brand-500 leading-relaxed mb-3">{f.description}</p>
                <div className={`flex items-center gap-1 text-xs font-semibold ${f.iconColor} group-hover:gap-2 transition-all`}>
                  <span>Open</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </FeatureLayout>
  );
}
