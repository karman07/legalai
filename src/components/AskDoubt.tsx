import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { HelpCircle, Plus, MessageCircle, Clock, CheckCircle, AlertCircle, X, Send } from 'lucide-react';

type Doubt = {
  id: string;
  student_id: string;
  title: string;
  question: string;
  subject: string | null;
  status: 'pending' | 'answered' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
};

type DoubtResponse = {
  id: string;
  doubt_id: string;
  teacher_id: string;
  response: string;
  created_at: string;
  teacher?: {
    full_name: string;
  };
};

type DoubtWithResponses = Doubt & {
  responses?: DoubtResponse[];
};

export default function AskDoubt() {
  const { user, profile } = useAuth();
  const [doubts, setDoubts] = useState<DoubtWithResponses[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDoubt, setSelectedDoubt] = useState<DoubtWithResponses | null>(null);
  const [responseText, setResponseText] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    question: '',
    subject: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  const isTeacher = user?.role === 'educator' || user?.role === 'admin';

  useEffect(() => {
    loadDoubts();
  }, [user, isTeacher]);

  const loadDoubts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // TODO: Implement doubts loading logic
      setDoubts([]);
    } catch (error) {
      console.error('Error loading doubts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDoubtWithResponses = async (doubtId: string) => {
    try {
      // TODO: Implement doubt with responses loading logic
      console.log('Loading doubt:', doubtId);
      const doubtWithResponses = {
        id: doubtId,
        student_id: user?.id || '',
        title: '',
        question: '',
        subject: null,
        status: 'pending' as const,
        priority: 'medium' as const,
        created_at: new Date().toISOString(),
        responses: [],
      };

      setSelectedDoubt(doubtWithResponses as DoubtWithResponses);
    } catch (error) {
      console.error('Error loading doubt details:', error);
    }
  };

  const handleCreateDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // TODO: Implement doubt creation logic
      console.log('Creating doubt:', formData.title);

      setFormData({ title: '', question: '', subject: '', priority: 'medium' });
      setIsCreating(false);
      loadDoubts();
    } catch (error) {
      console.error('Error creating doubt:', error);
    }
  };

  const handleAddResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoubt || !user || !responseText.trim()) return;

    try {
      // TODO: Implement response addition logic
      console.log('Adding response to doubt:', selectedDoubt.id);

      setResponseText('');
      loadDoubtWithResponses(selectedDoubt.id);
      loadDoubts();
    } catch (error) {
      console.error('Error adding response:', error);
    }
  };

  const handleMarkResolved = async (doubtId: string) => {
    try {
      // TODO: Implement mark resolved logic
      console.log('Marking doubt as resolved:', doubtId);

      if (selectedDoubt?.id === doubtId) {
        setSelectedDoubt({ ...selectedDoubt, status: 'resolved' });
      }
      loadDoubts();
    } catch (error) {
      console.error('Error marking doubt as resolved:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case 'answered':
        return (
          <span className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            <MessageCircle className="w-3 h-3" />
            <span>Answered</span>
          </span>
        );
      case 'resolved':
        return (
          <span className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            <CheckCircle className="w-3 h-3" />
            <span>Resolved</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-brand-100 text-brand-700',
      medium: 'bg-gold-100 text-gold-700',
      high: 'bg-red-100 text-red-700',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${colors[priority as keyof typeof colors]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  const subjects = ['Constitutional Law', 'Criminal Law', 'Civil Law', 'Corporate Law', 'Tax Law', 'Other'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-brand-100 dark:bg-brand-900 rounded-xl flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-brand-900">{isTeacher ? 'Student Doubts' : 'Ask a Doubt'}</h2>
              <p className="text-brand-500 dark:text-brand-400 text-sm">
            {isTeacher ? 'Help students by answering their questions' : 'Get your questions answered by teachers'}
            </p>
            </div>
          </div>
        </div>
        {!isTeacher && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-900 dark:bg-brand-700 hover:bg-brand-800 dark:hover:bg-brand-600 text-white rounded-xl transition-colors font-semibold text-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Ask Doubt</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : doubts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-brand-800 border border-brand-100 dark:border-brand-700/60 rounded-2xl">
          <HelpCircle className="w-12 h-12 text-brand-400 mx-auto mb-3" />
          <p className="text-brand-600 dark:text-brand-300">
            {isTeacher ? 'No doubts submitted yet.' : 'You have not asked any doubts yet.'}
          </p>
          {!isTeacher && (
            <button
              onClick={() => setIsCreating(true)}
              className="mt-4 px-5 py-2.5 bg-brand-900 hover:bg-brand-800 text-white rounded-xl transition-colors font-semibold text-sm"
            >
              Ask Your First Doubt
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {doubts.map((doubt) => (
            <div
              key={doubt.id}
              onClick={() => loadDoubtWithResponses(doubt.id)}
              className="bg-white dark:bg-brand-800 border border-brand-200 dark:border-brand-700 rounded-2xl p-5 hover:shadow-card hover:border-brand-300 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-brand-900 mb-2">{doubt.title}</h3>
                  <p className="text-sm text-brand-600 line-clamp-2">{doubt.question}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                {getStatusBadge(doubt.status)}
                {getPriorityBadge(doubt.priority)}
                {doubt.subject && (
                  <span className="px-2 py-1 bg-brand-100 text-brand-700 text-xs rounded">{doubt.subject}</span>
                )}
                <span className="text-xs text-brand-500">{new Date(doubt.created_at).toLocaleDateString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-brand-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-100 dark:border-brand-700">
              <div className="flex items-center gap-3"><div className="w-8 h-8 bg-brand-100 dark:bg-brand-900 rounded-lg flex items-center justify-center"><HelpCircle className="w-4 h-4 text-gold-400" /></div><h2 className="text-lg font-bold text-brand-900">Ask a Doubt</h2></div>
              <button
                onClick={() => setIsCreating(false)}
                className="p-2 hover:bg-brand-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-brand-600" />
              </button>
            </div>

            <form onSubmit={handleCreateDoubt} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-700 dark:text-brand-300 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-brand-800 border border-brand-300 dark:border-brand-600 rounded-lg text-brand-900 dark:text-brand-100 focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm"
                  placeholder="Brief summary of your doubt..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-700 dark:text-brand-300 mb-2">Question</label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-brand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="Describe your doubt in detail..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-700 dark:text-brand-300 mb-2">Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 border border-brand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <option value="">Select subject...</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-700 dark:text-brand-300 mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="w-full px-4 py-3 border border-brand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-6 py-3 bg-brand-100 hover:bg-brand-200 text-brand-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gold-500 hover:bg-gold-600 text-white rounded-lg transition-colors"
                >
                  Submit Doubt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedDoubt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-brand-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-start justify-between p-6 border-b border-brand-200">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-brand-900 mb-2">{selectedDoubt.title}</h2>
                <div className="flex flex-wrap items-center gap-3">
                  {getStatusBadge(selectedDoubt.status)}
                  {getPriorityBadge(selectedDoubt.priority)}
                  {selectedDoubt.subject && (
                    <span className="px-2 py-1 bg-brand-100 text-brand-700 text-xs rounded">
                      {selectedDoubt.subject}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedDoubt(null)}
                className="ml-4 p-2 hover:bg-brand-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-brand-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-brand-900 mb-2">Question</h3>
                <p className="text-brand-700 whitespace-pre-wrap bg-brand-50 p-4 rounded-lg">
                  {selectedDoubt.question}
                </p>
                <p className="text-xs text-brand-500 mt-2">
                  Asked on {new Date(selectedDoubt.created_at).toLocaleDateString('en-IN')}
                </p>
              </div>

              {selectedDoubt.responses && selectedDoubt.responses.length > 0 && (
                <div>
                  <h3 className="font-semibold text-brand-900 mb-3">Responses</h3>
                  <div className="space-y-3">
                    {selectedDoubt.responses.map((response) => (
                      <div key={response.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-medium text-blue-900">
                            {response.teacher?.full_name || 'Teacher'}
                          </span>
                          <span className="text-xs text-brand-500">
                            {new Date(response.created_at).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        <p className="text-brand-700 whitespace-pre-wrap">{response.response}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isTeacher && selectedDoubt.status !== 'resolved' && (
                <div className="bg-brand-50 rounded-lg p-4">
                  <h3 className="font-semibold text-brand-900 mb-3">Add Response</h3>
                  <form onSubmit={handleAddResponse} className="space-y-3">
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      rows={4}
                      required
                      className="w-full px-4 py-3 border border-brand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                      placeholder="Write your response to help the student..."
                    />
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-5 py-2.5 bg-brand-900 hover:bg-brand-800 text-white rounded-xl transition-colors font-semibold text-sm"
                    >
                      <Send className="w-5 h-5" />
                      <span>Send Response</span>
                    </button>
                  </form>
                </div>
              )}

              {!isTeacher && selectedDoubt.status === 'answered' && (
                <button
                  onClick={() => handleMarkResolved(selectedDoubt.id)}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Mark as Resolved</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
