import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Scale,
  BookOpen,
  MessageSquare,
  FileText,
  Volume2,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Brain,
  BookMarked,
  HelpCircle,
  Library
} from 'lucide-react';
import MCQQuiz from './MCQQuiz';
import CaseLaws from './CaseLaws';
import EnhancedChatbot from './EnhancedChatbot';
import BareActReader from './BareActReader';
import ScannedAnswers from './ScannedAnswers';
import Notes from './Notes';
import AskDoubt from './AskDoubt';
import LibraryComponent from './Library';

type Tab = 'mcq' | 'cases' | 'chatbot' | 'expert' | 'tts' | 'answers' | 'notes' | 'doubts' | 'library';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('mcq');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const tabs = [
    { id: 'mcq' as Tab, name: 'MCQ Quiz', icon: BookOpen, description: 'Practice questions' },
    { id: 'cases' as Tab, name: 'Case Laws', icon: Scale, description: 'Browse judgments' },
    { id: 'notes' as Tab, name: 'My Notes', icon: BookMarked, description: 'Personal notes' },
    { id: 'doubts' as Tab, name: 'Ask a Doubt', icon: HelpCircle, description: 'Get help' },
    { id: 'chatbot' as Tab, name: 'Study Bot', icon: MessageSquare, description: 'General help' },
    { id: 'expert' as Tab, name: 'Legal Expert', icon: Brain, description: 'Expert guidance' },
    { id: 'tts' as Tab, name: 'Bare Act Reader', icon: Volume2, description: 'Immersive reading' },
    { id: 'answers' as Tab, name: 'Answer Review', icon: FileText, description: 'Submit answers' },
    { id: 'library' as Tab, name: 'My Library', icon: Library, description: 'Saved content' },
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-4 p-2 rounded-lg hover:bg-slate-100 transition-colors lg:hidden"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <Scale className="w-8 h-8 text-amber-600" />
              <div className="ml-2">
                <span className="text-xl font-bold text-slate-900">LegalPadhai.ai</span>
                <p className="text-xs text-slate-500 hidden sm:block">India's First AI Empowered Law Education Platform</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <GraduationCap className="w-5 h-5 text-slate-600" />
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-slate-500 capitalize">{user?.role || 'Student'}</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-24">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-start space-x-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-amber-50 text-amber-700 shadow-sm'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                      <div className="text-left">
                        <div className={`font-medium ${isActive ? 'text-amber-900' : 'text-slate-900'}`}>
                          {tab.name}
                        </div>
                        <div className="text-xs text-slate-500">{tab.description}</div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              {activeTab === 'mcq' && <MCQQuiz />}
              {activeTab === 'cases' && <CaseLaws />}
              {activeTab === 'notes' && <Notes />}
              {activeTab === 'doubts' && <AskDoubt />}
              {activeTab === 'chatbot' && <EnhancedChatbot type="general" />}
              {activeTab === 'expert' && <EnhancedChatbot type="legal_expert" />}
              {activeTab === 'tts' && <BareActReader />}
              {activeTab === 'answers' && <ScannedAnswers />}
              {activeTab === 'library' && <LibraryComponent />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
