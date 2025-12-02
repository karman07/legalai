import { useNavigate } from 'react-router-dom';
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
  ArrowRight
} from 'lucide-react';

export default function DashboardPage() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const features = [
    {
      icon: BookOpen,
      title: 'MCQ Quiz',
      description: 'Practice with multiple-choice questions',
      path: '/mcq',
      color: 'bg-blue-500',
    },
    {
      icon: Scale,
      title: 'Case Laws',
      description: 'Browse judgments by year and court',
      path: '/cases',
      color: 'bg-amber-600',
    },
    {
      icon: BookMarked,
      title: 'My Notes',
      description: 'Create and organize study notes',
      path: '/notes',
      color: 'bg-green-500',
    },
    {
      icon: HelpCircle,
      title: 'Ask a Doubt',
      description: 'Get help from teachers',
      path: '/doubts',
      color: 'bg-red-500',
    },
    {
      icon: MessageSquare,
      title: 'Study Assistant',
      description: 'AI chatbot for general help',
      path: '/chatbot',
      color: 'bg-cyan-500',
    },
    {
      icon: Brain,
      title: 'Legal Expert',
      description: 'Advanced legal AI assistant',
      path: '/expert',
      color: 'bg-violet-500',
    },
    {
      icon: Volume2,
      title: 'Audio Lessons',
      description: 'Listen to legal content',
      path: '/audio',
      color: 'bg-orange-500',
    },
    {
      icon: FileText,
      title: 'Answer Review',
      description: 'Submit answers for evaluation',
      path: '/answers',
      color: 'bg-pink-500',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Scale className="w-8 h-8 text-amber-600" />
              <span className="ml-2 text-xl font-bold text-slate-900">LegalEdu India</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <GraduationCap className="w-5 h-5 text-slate-600" />
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{profile?.full_name}</p>
                  <p className="text-xs text-slate-500 capitalize">{profile?.role}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Welcome back, {profile?.full_name}!
          </h1>
          <p className="text-xl text-slate-600">
            Choose a learning tool to continue your legal education journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <button
                key={idx}
                onClick={() => navigate(feature.path)}
                className="group bg-white border-2 border-slate-200 rounded-xl p-6 hover:border-amber-500 hover:shadow-2xl transition-all transform hover:-translate-y-2 text-left"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 ${feature.color} rounded-lg mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 mb-4 leading-relaxed">{feature.description}</p>
                <div className="flex items-center text-amber-600 font-semibold group-hover:translate-x-2 transition-transform">
                  <span>Open</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
