import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Scale, BookOpen, MessageSquare, FileText, Volume2, LogOut,
  GraduationCap, BookMarked, LayoutDashboard,
  Menu, ChevronRight,
} from 'lucide-react';

type FeatureLayoutProps = {
  children: React.ReactNode;
};

export default function FeatureLayout({ children }: FeatureLayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    try { await signOut(); } catch {}
  };

  const navItems = [
    { icon: LayoutDashboard, title: 'Dashboard',      path: '/dashboard' },
    { icon: BookOpen,        title: 'MCQ Quiz',       path: '/mcq'       },
    { icon: Scale,           title: 'Case Laws',      path: '/cases'     },
    { icon: BookMarked,      title: 'My Notes',       path: '/notes'     },
    // { icon: HelpCircle,      title: 'Ask a Doubt',    path: '/doubts'    },  // HIDDEN
    { icon: MessageSquare,   title: 'Study Assistant',path: '/chatbot'   },
    // { icon: Brain,           title: 'Legal Expert',   path: '/expert'    },  // HIDDEN
    { icon: Volume2,         title: 'Bare Act Reader',path: '/audio'     },
    { icon: FileText,        title: 'Answer Review',  path: '/answers'   },
    // { icon: Library,         title: 'My Library',     path: '/library'   },  // HIDDEN
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-5 py-5 border-b border-brand-200 dark:border-brand-800 cursor-pointer flex-shrink-0"
        onClick={() => { navigate('/dashboard'); setMobileOpen(false); }}
      >
        <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
          <Scale className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="text-base font-bold text-brand-900 dark:text-white leading-none">
            LegalPadhai<span className="text-gold-500 dark:text-gold-400">.ai</span>
          </span>
          <p className="text-[10px] text-brand-400 dark:text-brand-500 leading-none mt-0.5">AI Law Education</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-gold-500/12 text-gold-600 dark:text-gold-400 border border-gold-500/20'
                  : 'text-brand-600 dark:text-brand-400 hover:text-brand-900 dark:hover:text-brand-100 hover:bg-brand-100 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-gold-600 dark:text-gold-400' : 'text-brand-500 dark:text-brand-300 group-hover:text-brand-900 dark:group-hover:text-brand-100'}`} />
                <span>{item.title}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400 flex-shrink-0" />}
            </button>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-brand-200 dark:border-brand-800 flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-brand-100 dark:bg-brand-800/50 mb-2">
          <div className="w-8 h-8 bg-brand-200 dark:bg-brand-700 rounded-full flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-4 h-4 text-brand-600 dark:text-brand-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-brand-900 dark:text-brand-100 truncate leading-none">{user?.name || 'User'}</p>
            <p className="text-xs text-brand-500 capitalize leading-none mt-0.5">{user?.role || 'Student'}</p>
          </div>
        </div>
        {/* Theme toggle */}
        {/* <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-brand-600 dark:text-brand-400 hover:text-gold-600 dark:hover:text-gold-400 hover:bg-gold-50 dark:hover:bg-gold-500/8 rounded-xl transition-all text-sm font-medium mb-1"
        >
          {isDark ? <Sun className="w-4 h-4 flex-shrink-0" /> : <Moon className="w-4 h-4 flex-shrink-0" />}
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button> */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-brand-600 dark:text-brand-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/8 rounded-xl transition-all text-sm font-medium"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-50 dark:bg-brand-950 lg:flex">

      {/* ── Desktop Sidebar ─────────────────────────────── */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 xl:w-72 bg-white dark:bg-brand-900 border-r border-brand-200 dark:border-brand-800 fixed inset-y-0 left-0 z-50 shadow-sidebar">
        <SidebarContent />
      </aside>

      {/* ── Mobile Drawer Overlay ────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile Drawer ────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-brand-900 border-r border-brand-200 dark:border-brand-800 flex flex-col shadow-sidebar transform transition-transform duration-300 lg:hidden ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SidebarContent />
      </aside>

      {/* ── Main Content ─────────────────────────────────── */}
      <div className="lg:pl-64 xl:pl-72 flex-1 flex flex-col min-h-screen bg-brand-50 dark:bg-brand-950">

        {/* Mobile top bar */}
        <header className="lg:hidden bg-white dark:bg-brand-900 border-b border-brand-200 dark:border-brand-800 shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 h-14">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 text-brand-500 dark:text-brand-400 hover:text-brand-900 dark:hover:text-brand-100 hover:bg-brand-100 dark:hover:bg-brand-800 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gold-500 rounded-lg flex items-center justify-center">
                <Scale className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-brand-900 dark:text-brand-100 text-sm">
                LegalPadhai<span className="text-gold-500">.ai</span>
              </span>
            </div>
            <div className="flex items-center gap-1">
              {/* theme toggle hidden
              <button
                onClick={toggleTheme}
                className="p-2 text-brand-400 dark:text-brand-400 hover:text-brand-700 dark:hover:text-gold-400 hover:bg-brand-100 dark:hover:bg-brand-800 rounded-lg transition-colors"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              */}
              <button
                onClick={handleSignOut}
                className="p-2 text-brand-400 hover:text-brand-700 dark:hover:text-red-400 hover:bg-brand-100 dark:hover:bg-brand-800 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}


