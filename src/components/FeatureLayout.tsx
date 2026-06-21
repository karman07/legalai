import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Scale, BookOpen, MessageSquare, FileText, Volume2, LogOut,
  GraduationCap, BookMarked, LayoutDashboard,
  Menu, ChevronRight, FolderKanban, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';

type FeatureLayoutProps = {
  children: React.ReactNode;
};

export default function FeatureLayout({ children }: FeatureLayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSignOut = async () => {
    try { await signOut(); } catch {}
  };

  const navItems = [
    {
      icon: LayoutDashboard,
      title: 'Dashboard',
      path: '/dashboard',
      accent: 'text-brand-600 dark:text-brand-300',
      activeClass: 'bg-brand-100 text-brand-800 border border-brand-200 dark:bg-brand-700/20 dark:text-brand-200 dark:border-brand-600/40',
    },
    {
      icon: BookOpen,
      title: 'MCQ Quiz',
      path: '/mcq',
      accent: 'text-blue-600 dark:text-blue-400',
      activeClass: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30',
    },
    {
      icon: Scale,
      title: 'Case Laws',
      path: '/cases',
      accent: 'text-gold-600 dark:text-gold-400',
      activeClass: 'bg-gold-500/12 text-gold-600 border border-gold-500/20 dark:text-gold-300 dark:border-gold-500/30',
    },
    {
      icon: FolderKanban,
      title: 'Resources',
      path: '/resources',
      accent: 'text-indigo-600 dark:text-indigo-400',
      activeClass: 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/30',
    },
    {
      icon: BookMarked,
      title: 'Study Materials',
      path: '/study-materials',
      accent: 'text-amber-600 dark:text-amber-400',
      activeClass: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30',
    },
    {
      icon: BookMarked,
      title: 'My Notes',
      path: '/notes',
      accent: 'text-emerald-600 dark:text-emerald-400',
      activeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
    },
    // { icon: HelpCircle,      title: 'Ask a Doubt',    path: '/doubts'    },  // HIDDEN
    {
      icon: MessageSquare,
      title: 'Legal AI Assistant',
      path: '/chatbot',
      accent: 'text-cyan-600 dark:text-cyan-400',
      activeClass: 'bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/30',
    },
    // { icon: Brain,           title: 'Legal Expert',   path: '/expert'    },  // HIDDEN
    {
      icon: Volume2,
      title: 'Audiobooks',
      path: '/audio',
      accent: 'text-orange-600 dark:text-orange-400',
      activeClass: 'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30',
    },
    {
      icon: FileText,
      title: 'Answer Review',
      path: '/answers',
      accent: 'text-pink-600 dark:text-pink-400',
      activeClass: 'bg-pink-50 text-pink-700 border border-pink-200 dark:bg-pink-500/10 dark:text-pink-300 dark:border-pink-500/30',
    },
    // { icon: Library,         title: 'My Library',     path: '/library'   },  // HIDDEN
  ];

  const SidebarContent = ({ compact = false }: { compact?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={`flex items-center ${compact ? 'justify-center px-2 min-h-[84px]' : 'gap-2.5 px-5'} py-5 border-b border-brand-200 dark:border-brand-800 cursor-pointer flex-shrink-0 relative`}
        onClick={() => { navigate('/dashboard'); setMobileOpen(false); }}
      >
        <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
          <Scale className="w-4 h-4 text-white" />
        </div>
        {!compact && (
          <div>
            <span className="text-base font-bold text-brand-900 dark:text-white leading-none">
              LegalPadhai<span className="text-gold-500 dark:text-gold-400">.ai</span>
            </span>
            <p className="text-[10px] text-brand-400 dark:text-brand-500 leading-none mt-0.5">AI Law Education</p>
          </div>
        )}

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
              className={`${compact ? 'w-12 h-12 mx-auto justify-center px-0 py-0' : 'w-full justify-between px-3 py-2.5'} flex items-center rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? compact
                    ? 'bg-white border border-brand-200 shadow-sm dark:bg-brand-800/60 dark:border-brand-700'
                    : item.activeClass
                  : 'text-brand-600 dark:text-brand-400 hover:text-brand-900 dark:hover:text-brand-100 hover:bg-brand-100 dark:hover:bg-white/5'
              }`}
            >
              <div className={`flex items-center ${compact ? '' : 'gap-3'}`}>
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? item.accent : `${item.accent} group-hover:opacity-90`}`} />
                {!compact && <span>{item.title}</span>}
              </div>
              {isActive && !compact && <ChevronRight className={`w-3.5 h-3.5 ${item.accent} flex-shrink-0`} />}
            </button>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-brand-200 dark:border-brand-800 flex-shrink-0">
        <button
          type="button"
          onClick={() => setSidebarCollapsed((prev) => !prev)}
          className={`hidden lg:flex w-full items-center ${compact ? 'justify-center px-2' : 'gap-2.5 px-3'} py-2.5 mb-2 text-brand-600 dark:text-brand-400 hover:text-brand-900 dark:hover:text-brand-100 hover:bg-brand-100 dark:hover:bg-brand-800 rounded-xl transition-all text-sm font-medium`}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 flex-shrink-0" />
          ) : (
            <PanelLeftClose className="w-4 h-4 flex-shrink-0" />
          )}
          {!compact && <span>{sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}</span>}
        </button>

        <div className={`flex items-center ${compact ? 'justify-center px-2' : 'gap-3 px-3'} py-2.5 rounded-xl bg-brand-100 dark:bg-brand-800/50 mb-2`}>
          <div className="w-8 h-8 bg-brand-200 dark:bg-brand-700 rounded-full flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-4 h-4 text-brand-600 dark:text-brand-300" />
          </div>
          {!compact && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-brand-900 dark:text-brand-100 truncate leading-none">{user?.name || 'User'}</p>
              <p className="text-xs text-brand-500 capitalize leading-none mt-0.5">{user?.role || 'Student'}</p>
            </div>
          )}
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
          className={`w-full flex items-center ${compact ? 'justify-center px-2' : 'gap-2.5 px-3'} py-2.5 text-brand-600 dark:text-brand-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/8 rounded-xl transition-all text-sm font-medium`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!compact && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-50 dark:bg-brand-950 lg:flex">

      {/* ── Desktop Sidebar ─────────────────────────────── */}
      <aside className={`hidden lg:flex lg:flex-col ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64 xl:w-72'} bg-white dark:bg-brand-900 border-r border-brand-200 dark:border-brand-800 fixed inset-y-0 left-0 z-50 shadow-sidebar transition-all duration-300`}>
        <SidebarContent compact={sidebarCollapsed} />
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
      <div className={`${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64 xl:pl-72'} flex-1 flex flex-col min-h-screen bg-brand-50 dark:bg-brand-950 transition-all duration-300`}>

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


