import { useState, useEffect } from 'react';

type SavedChat = {
  id: string;
  user_id: string;
  chatbot_type: 'general' | 'legal_expert';
  title: string;
  conversation_data: any[];
  is_bookmarked: boolean;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
};

type MCQTestSession = {
  id: string;
  user_id: string;
  mode: 'pyq' | 'mock' | 'custom';
  category_id: string | null;
  title: string;
  total_questions: number;
  total_marks: number;
  obtained_marks: number;
  accuracy_percentage: number;
  time_allocated_minutes: number | null;
  time_taken_seconds: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  started_at: string;
  completed_at: string | null;
  created_at: string;
};
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Brain, Target, FileText, Sparkles, Clock, TrendingUp, Award, Bookmark, Trash2, ChevronRight, Library as LibraryIcon } from 'lucide-react';

type LibraryTab = 'chats' | 'tests';

export default function Library() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<LibraryTab>('chats');
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [testSessions, setTestSessions] = useState<MCQTestSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLibraryData();
  }, [activeTab]);

  const loadLibraryData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // TODO: Implement library data loading logic
      if (activeTab === 'chats') {
        setSavedChats([]);
      } else {
        setTestSessions([]);
      }
    } catch (error) {
      console.error('Error loading library data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (chatId: string) => {
    if (!confirm('Are you sure you want to delete this chat?')) return;

    try {
      // TODO: Implement chat deletion logic
      console.log('Deleting chat:', chatId);
      setSavedChats(savedChats.filter(chat => chat.id !== chatId));
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const toggleBookmark = async (chatId: string, currentBookmark: boolean) => {
    try {
      // TODO: Implement bookmark toggle logic
      console.log('Toggling bookmark:', chatId);
      setSavedChats(savedChats.map(chat =>
        chat.id === chatId ? { ...chat, is_bookmarked: !currentBookmark } : chat
      ));
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'pyq': return <FileText className="w-4 h-4" />;
      case 'mock': return <Target className="w-4 h-4" />;
      case 'custom': return <Sparkles className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'pyq': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'mock': return 'bg-green-100 text-green-700 border-green-200';
      case 'custom': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center">
          <LibraryIcon className="w-7 h-7 mr-2 text-amber-600" />
          My Library
        </h2>
        <p className="text-slate-600 mt-1">Access your saved chats and test history</p>
      </div>

      <div className="flex space-x-2 mb-6 bg-slate-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('chats')}
          className={`flex-1 py-3 px-4 rounded-lg transition-all font-medium flex items-center justify-center space-x-2 ${
            activeTab === 'chats'
              ? 'bg-white text-amber-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Saved Chats</span>
        </button>
        <button
          onClick={() => setActiveTab('tests')}
          className={`flex-1 py-3 px-4 rounded-lg transition-all font-medium flex items-center justify-center space-x-2 ${
            activeTab === 'tests'
              ? 'bg-white text-amber-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Test History</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          <p className="text-slate-600 mt-4">Loading...</p>
        </div>
      ) : activeTab === 'chats' ? (
        <div className="space-y-4">
          {savedChats.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg">
              <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">No saved chats yet</p>
              <p className="text-sm text-slate-500 mt-2">
                Save important conversations from your AI interactions
              </p>
            </div>
          ) : (
            savedChats.map((chat) => (
              <div
                key={chat.id}
                className="bg-slate-50 border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {chat.chatbot_type === 'legal_expert' ? (
                        <Brain className="w-5 h-5 text-amber-600" />
                      ) : (
                        <MessageSquare className="w-5 h-5 text-amber-600" />
                      )}
                      <h3 className="font-semibold text-slate-900">{chat.title}</h3>
                      {chat.is_bookmarked && (
                        <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-3">
                      {chat.chatbot_type === 'legal_expert' ? 'Legal Expert' : 'Study Assistant'} • {' '}
                      {chat.conversation_data?.length || 0} messages
                    </p>
                    {chat.tags && chat.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {chat.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-white text-slate-700 text-xs rounded-full border border-slate-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-slate-500">
                      Last updated: {new Date(chat.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => toggleBookmark(chat.id, chat.is_bookmarked)}
                      className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
                      title={chat.is_bookmarked ? 'Remove bookmark' : 'Bookmark'}
                    >
                      <Bookmark className={`w-5 h-5 ${chat.is_bookmarked ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                    </button>
                    <button
                      onClick={() => deleteChat(chat.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete chat"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                    <button
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      title="View chat"
                    >
                      <ChevronRight className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {testSessions.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg">
              <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">No test history yet</p>
              <p className="text-sm text-slate-500 mt-2">
                Complete MCQ tests to see your performance history
              </p>
            </div>
          ) : (
            testSessions.map((session) => (
              <div
                key={session.id}
                className="bg-slate-50 border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getModeColor(session.mode)}`}>
                        {getModeIcon(session.mode)}
                        <span className="uppercase">{session.mode}</span>
                      </span>
                      <h3 className="font-semibold text-slate-900">{session.title}</h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Score</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {session.obtained_marks}/{session.total_marks}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Accuracy</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {session.accuracy_percentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Duration</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {formatDuration(session.time_taken_seconds)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Questions</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {session.total_questions}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500">
                      Completed: {session.completed_at ? new Date(session.completed_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>

                  <button
                    className="ml-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors text-sm font-medium"
                    title="View detailed analysis"
                  >
                    View Report
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
