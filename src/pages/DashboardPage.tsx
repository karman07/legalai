import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
//import { useTheme } from '../contexts/ThemeContext';
import {
  Scale, BookOpen, MessageSquare, FileText, Volume2, LogOut,
  GraduationCap, BookMarked, HelpCircle, ArrowRight,
  LayoutGrid,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  // const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try { await signOut(); } catch {}
  };

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
      icon: BookMarked, title: 'My Notes',
      description: 'Create and organize personal study notes with tags',
      path: '/notes', bg: 'bg-emerald-50', iconColor: 'text-emerald-600', border: 'hover:border-emerald-200',
    },
    {
      icon: HelpCircle, title: 'Ask a Doubt',
      description: 'Get questions answered by experienced legal educators',
      path: '/doubts', bg: 'bg-red-50', iconColor: 'text-red-600', border: 'hover:border-red-200',
    },
    {
      icon: MessageSquare, title: 'Study Assistant',
      description: 'AI chatbot for general legal study and exam prep help',
      path: '/chatbot', bg: 'bg-cyan-50', iconColor: 'text-cyan-600', border: 'hover:border-cyan-200',
    },
    // HIDDEN: Legal Expert Bot
    // {
    //   icon: Brain, title: 'Legal Expert Bot',
    //   description: 'Advanced AI for complex legal analysis and RAG search',
    //   path: '/expert', bg: 'bg-violet-50', iconColor: 'text-violet-600', border: 'hover:border-violet-200',
    // },
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
    // HIDDEN: My Library
    // {
    //   icon: Library, title: 'My Library',
    //   description: 'Saved case laws, notes, and curated study resources',
    //   path: '/library', bg: 'bg-teal-50', iconColor: 'text-teal-600', border: 'hover:border-teal-200',
    // },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-brand-50 dark:bg-brand-950">

      {/* ── Top Nav ─────────────────────────────────────── */}
      <nav className="bg-white dark:bg-brand-900 border-b border-brand-200 dark:border-brand-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                <Scale className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-base font-bold text-brand-900 dark:text-brand-100 tracking-tight leading-none">
                  LegalPadhai<span className="text-gold-500">.ai</span>
                </span>
                <p className="text-[10px] text-brand-400 leading-none mt-0.5 hidden sm:block">
                  India's AI Law Education Platform
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2.5 mr-2">
                <div className="w-8 h-8 bg-brand-100 dark:bg-brand-800 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-brand-500 dark:text-brand-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand-900 dark:text-brand-100 leading-none">{user?.name || 'User'}</p>
                  <p className="text-xs text-brand-400 capitalize leading-none mt-0.5">{user?.role || 'Student'}</p>
                </div>
              </div>
              {/* <button
                onClick={toggleTheme}
                className="p-2 text-brand-400 dark:text-brand-400 hover:text-gold-600 dark:hover:text-gold-400 hover:bg-brand-100 dark:hover:bg-brand-800 rounded-lg transition-colors"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button> */}
              <button onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-2 bg-brand-100 dark:bg-brand-800 hover:bg-brand-200 dark:hover:bg-brand-700 text-brand-600 dark:text-brand-300 hover:text-brand-900 dark:hover:text-brand-100 text-sm font-medium rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Body ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

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
            { label: 'Questions Practiced', value: '—', icon: BookOpen },
            { label: 'Notes Created', value: '—', icon: BookMarked },
            { label: 'Cases Viewed', value: '—', icon: Scale },
            { label: 'Study Streak', value: '—', icon: LayoutGrid },
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
      </div>
    </div>
  );
}


