import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Scale,
  BookOpen,
  MessageSquare,
  FileText,
  Volume2,
  LogOut,
  GraduationCap,
  Brain,
  BookMarked,
  HelpCircle,
  LayoutDashboard,
  ArrowLeft
} from 'lucide-react';

type FeatureLayoutProps = {
  children: React.ReactNode;
};

export default function FeatureLayout({ children }: FeatureLayoutProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigationItems = [
    {
      icon: LayoutDashboard,
      title: 'Dashboard',
      path: '/dashboard',
    },
    {
      icon: BookOpen,
      title: 'MCQ Quiz',
      path: '/mcq',
    },
    {
      icon: Scale,
      title: 'Case Laws',
      path: '/cases',
    },
    {
      icon: BookMarked,
      title: 'My Notes',
      path: '/notes',
    },
    {
      icon: HelpCircle,
      title: 'Ask a Doubt',
      path: '/doubts',
    },
    {
      icon: MessageSquare,
      title: 'Study Assistant',
      path: '/chatbot',
    },
    {
      icon: Brain,
      title: 'Legal Expert',
      path: '/expert',
    },
    {
      icon: Volume2,
      title: 'Audio Lessons',
      path: '/audio',
    },
    {
      icon: FileText,
      title: 'Answer Review',
      path: '/answers',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="lg:flex lg:min-h-screen">
        <aside className="hidden lg:block lg:w-72 bg-white border-r border-slate-200 lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center mb-6 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <Scale className="w-8 h-8 text-amber-600" />
              <div className="ml-2">
                <span className="text-xl font-bold text-slate-900">LegalPadhai.ai</span>
                <p className="text-xs text-slate-500">AI Law Education</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <GraduationCap className="w-10 h-10 text-slate-600 bg-slate-100 p-2 rounded-full" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{profile?.full_name}</p>
                <p className="text-xs text-slate-500 capitalize">{profile?.role}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-amber-50 text-amber-700 shadow-sm'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                    <span className={`font-medium text-sm ${isActive ? 'text-amber-900' : 'text-slate-900'}`}>
                      {item.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="p-4 border-t border-slate-200">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        </aside>

        <div className="lg:pl-72 flex-1">
          <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-medium">Back to Dashboard</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
          </div>

          <main className="p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
