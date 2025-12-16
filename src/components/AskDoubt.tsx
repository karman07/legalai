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
      low: 'bg-slate-100 text-slate-700',
      medium: 'bg-amber-100 text-amber-700',
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
          <h2 className="text-2xl font-bold text-slate-900 flex items-center">
            <HelpCircle className="w-7 h-7 mr-2 text-amber-600" />
            {isTeacher ? 'Student Doubts' : 'Ask a Doubt'}
          </h2>
          <p className="text-slate-600 mt-1">
            {isTeacher ? 'Help students by answering their questions' : 'Get your questions answered by teachers'}
          </p>
        </div>
        {!isTeacher && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Ask Doubt</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : doubts.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">
            {isTeacher ? 'No doubts submitted yet.' : 'You have not asked any doubts yet.'}
          </p>
          {!isTeacher && (
            <button
              onClick={() => setIsCreating(true)}
              className="mt-4 px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
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
              className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-2">{doubt.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2">{doubt.question}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                {getStatusBadge(doubt.status)}
                {getPriorityBadge(doubt.priority)}
                {doubt.subject && (
                  <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">{doubt.subject}</span>
                )}
                <span className="text-xs text-slate-500">{new Date(doubt.created_at).toLocaleDateString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Ask a Doubt</h2>
              <button
                onClick={() => setIsCreating(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleCreateDoubt} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Brief summary of your doubt..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Question</label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Describe your doubt in detail..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
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
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-start justify-between p-6 border-b border-slate-200">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900 mb-2">{selectedDoubt.title}</h2>
                <div className="flex flex-wrap items-center gap-3">
                  {getStatusBadge(selectedDoubt.status)}
                  {getPriorityBadge(selectedDoubt.priority)}
                  {selectedDoubt.subject && (
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                      {selectedDoubt.subject}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedDoubt(null)}
                className="ml-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Question</h3>
                <p className="text-slate-700 whitespace-pre-wrap bg-slate-50 p-4 rounded-lg">
                  {selectedDoubt.question}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Asked on {new Date(selectedDoubt.created_at).toLocaleDateString('en-IN')}
                </p>
              </div>

              {selectedDoubt.responses && selectedDoubt.responses.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Responses</h3>
                  <div className="space-y-3">
                    {selectedDoubt.responses.map((response) => (
                      <div key={response.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-medium text-blue-900">
                            {response.teacher?.full_name || 'Teacher'}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(response.created_at).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        <p className="text-slate-700 whitespace-pre-wrap">{response.response}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isTeacher && selectedDoubt.status !== 'resolved' && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-3">Add Response</h3>
                  <form onSubmit={handleAddResponse} className="space-y-3">
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      rows={4}
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Write your response to help the student..."
                    />
                    <button
                      type="submit"
                      className="flex items-center space-x-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
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
