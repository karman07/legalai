import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Send, Brain, Loader2, Plus, ChevronRight, Clock, User, Bot, AlertCircle, Edit2, Trash2, Check, X } from 'lucide-react';
import chatService, { type Conversation, type ChatMessage } from '../services/chatService';
import DeleteConfirmDialog from './DeleteConfirmDialog';

type ChatbotProps = {
  type: 'general' | 'legal_expert';
};

type ChatSession = {
  id: string | null;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
};

export default function EnhancedChatbot({ type }: ChatbotProps) {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<ChatSession>({
    id: null,
    title: 'New Chat',
    messages: [],
    createdAt: new Date().toISOString(),
  });
  const [savedSessions, setSavedSessions] = useState<Conversation[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    type: 'conversation' | 'message';
    itemId: string | null;
  }>({
    isOpen: false,
    type: 'conversation',
    itemId: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, [type, user]);

  useEffect(() => {
    scrollToBottom();
  }, [currentSession.messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    if (!user) {
      setLoadingHistory(false);
      return;
    }

    setLoadingHistory(true);
    setError(null);
    try {
      const conversations = await chatService.getConversations();
      setSavedSessions(conversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Failed to load chat history. Please try again.');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const result = await chatService.sendMessage(userMessage, currentSession.id);

      const newMessage: ChatMessage = {
        id: Date.now().toString(), // Temporarily use timestamp for local state
        message: userMessage,
        response: result.response,
        created_at: new Date().toISOString(),
      };

      setCurrentSession((prev) => ({
        ...prev,
        id: result.conversationId,
        title: result.title || prev.title,
        messages: [...prev.messages, newMessage],
      }));

      // Refresh conversations list to show updated title/timestamp
      if (user) {
        loadConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to get response. Please check your connection.');
      setInput(userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentSession({
      id: null,
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
    });
    setError(null);
  };

  const handleLoadConversation = async (session: Conversation) => {
    if (editingSessionId === session._id) return;
    if (currentSession.id === session._id) return;

    setError(null);
    try {
      const history = await chatService.getConversationHistory(session._id);
      const formattedMessages = history.map((msg: any) => ({
        id: msg._id,
        message: msg.query || msg.message,
        response: msg.response || msg.answer,
        created_at: msg.createdAt || msg.created_at,
      }));

      setCurrentSession({
        id: session._id,
        title: session.title,
        messages: formattedMessages,
        createdAt: session.createdAt,
      });
    } catch (error) {
      console.error('Error loading conversation history:', error);
      setError('Failed to load messages.');
    }
  };

  const handleRename = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!editingTitle.trim()) {
      setEditingSessionId(null);
      return;
    }

    try {
      await chatService.renameConversation(id, editingTitle.trim());
      setSavedSessions(prev =>
        prev.map(s => (s._id === id ? { ...s, title: editingTitle.trim() } : s))
      );
      if (currentSession.id === id) {
        setCurrentSession(prev => ({ ...prev, title: editingTitle.trim() }));
      }
    } catch (error) {
      console.error('Rename error:', error);
      setError('Failed to rename conversation.');
    } finally {
      setEditingSessionId(null);
    }
  };

  const handleDeleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteDialog({
      isOpen: true,
      type: 'conversation',
      itemId: id,
    });
  };

  const handleDeleteMessage = (messageId: string) => {
    setDeleteDialog({
      isOpen: true,
      type: 'message',
      itemId: messageId,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.itemId) return;

    setIsDeleting(true);
    try {
      if (deleteDialog.type === 'conversation') {
        await chatService.deleteConversation(deleteDialog.itemId);
        setSavedSessions((prev) => prev.filter((s) => s._id !== deleteDialog.itemId));
        if (currentSession.id === deleteDialog.itemId) {
          handleNewChat();
        }
      } else {
        await chatService.deleteMessage(deleteDialog.itemId);
        setCurrentSession((prev) => ({
          ...prev,
          messages: prev.messages.filter((m) => m.id !== deleteDialog.itemId),
        }));
      }
      setDeleteDialog({ ...deleteDialog, isOpen: false, itemId: null });
    } catch (error) {
      console.error('Delete error:', error);
      setError(`Failed to delete ${deleteDialog.type}.`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isExpert = type === 'legal_expert';

  return (
    <div className="flex h-[calc(100vh-10rem)] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Sidebar - History */}
      {showSidebar && (
        <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-100">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-all shadow-md active:scale-95 font-semibold"
            >
              <Plus className="w-5 h-5" />
              <span>New Conversation</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent History</h3>
              {loadingHistory && <Loader2 className="w-3 h-3 animate-spin text-slate-400" />}
            </div>

            {savedSessions.length === 0 && !loadingHistory ? (
              <div className="text-center py-10 px-4">
                <div className="bg-slate-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm text-slate-400">No chat history found</p>
                {!user && <p className="text-xs text-slate-400 mt-2">Sign in to sync history</p>}
              </div>
            ) : (
              savedSessions.map((session) => (
                <div
                  key={session._id}
                  className={`group relative p-3 rounded-xl cursor-pointer transition-all border border-transparent hover:border-amber-100 hover:bg-white hover:shadow-sm ${currentSession.id === session._id
                    ? 'bg-amber-50/80 border-amber-200 shadow-sm'
                    : ''
                    }`}
                  onClick={() => handleLoadConversation(session)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${currentSession.id === session._id ? 'bg-amber-200' : 'bg-slate-100'}`}>
                      <MessageSquare className={`w-4 h-4 ${currentSession.id === session._id ? 'text-amber-700' : 'text-slate-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      {editingSessionId === session._id ? (
                        <div className="flex items-center space-x-1" onClick={e => e.stopPropagation()}>
                          <input
                            autoFocus
                            type="text"
                            value={editingTitle}
                            onChange={e => setEditingTitle(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleRename(e as any, session._id);
                              if (e.key === 'Escape') setEditingSessionId(null);
                            }}
                            className="w-full text-sm font-semibold text-slate-700 bg-white border border-amber-300 rounded px-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                          <button onClick={e => handleRename(e, session._id)} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check className="w-3 h-3" /></button>
                          <button onClick={() => setEditingSessionId(null)} className="p-1 text-red-600 hover:bg-red-50 rounded"><X className="w-3 h-3" /></button>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-slate-700 truncate leading-tight pr-10">
                            {session.title}
                          </p>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingSessionId(session._id);
                                setEditingTitle(session.title);
                              }}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteConversation(e, session._id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                      <p className="text-xs text-slate-400 mt-1 flex items-center capitalize">
                        {new Date(session.updatedAt || session.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center space-x-4">
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${isExpert ? 'from-amber-400 to-amber-600' : 'from-blue-400 to-blue-600'} text-white shadow-lg`}>
              {isExpert ? <Brain className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {isExpert ? 'Legal Expert AI' : 'Study Buddy'}
              </h2>
              <div className="flex items-center space-x-2">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-xs font-medium text-slate-400">Online & Ready to help</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2.5 hover:bg-slate-50 text-slate-500 rounded-xl transition-all border border-slate-100"
              title="Toggle sidebar"
            >
              <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${showSidebar ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-white to-slate-50/30 custom-scrollbar">
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start space-x-3 mb-4">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}

          {currentSession.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-20">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-200 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                <div className={`relative p-8 rounded-full ${isExpert ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'}`}>
                  {isExpert ? <Brain className="w-16 h-16" /> : <MessageSquare className="w-16 h-16" />}
                </div>
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-xl font-bold text-slate-800">
                  {isExpert ? 'Ask the Legal Expert' : 'How can I assist you today?'}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed px-10">
                  {isExpert
                    ? 'I can help you analyze legal cases, interpret sections of the IPC, or explain complex legal terminologies.'
                    : 'I am your personal study assistant. Ask me about your courses, exam strategies, or any topic you are stuck on.'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full max-w-sm mt-8">
                {isExpert ? (
                  <>
                    <button onClick={() => setInput("What is IPC Section 302?")} className="p-3 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-amber-400 hover:text-amber-600 transition-all text-left">"What is IPC Section 302?"</button>
                    <button onClick={() => setInput("Explain types of evidence")} className="p-3 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-amber-400 hover:text-amber-600 transition-all text-left">"Explain types of evidence"</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setInput("How to study for finals?")} className="p-3 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all text-left">"How to study for finals?"</button>
                    <button onClick={() => setInput("Summarize my last note")} className="p-3 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all text-left">"Summarize my last note"</button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8 pb-4">
              {currentSession.messages.map((msg, idx) => (
                <div key={msg.id || idx} className="space-y-6">
                  {/* User Message */}
                  <div className="flex justify-end pr-2">
                    <div className="flex flex-row-reverse items-start max-w-[85%] group">
                      <div className="hidden sm:flex ml-3 mt-1 bg-amber-100 rounded-lg p-1.5 h-8 w-8 items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl rounded-tr-none px-5 py-3.5 shadow-md relative">
                        <p className="text-[15px] leading-relaxed font-medium">{msg.message}</p>
                        <p className="text-[10px] text-amber-100 mt-1.5 opacity-80 text-right">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="absolute -left-10 top-2 p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* AI Message */}
                  <div className="flex justify-start pl-2">
                    <div className="flex items-start max-w-[85%]">
                      <div className={`hidden sm:flex mr-3 mt-1 rounded-lg p-1.5 h-8 w-8 items-center justify-center flex-shrink-0 ${isExpert ? 'bg-amber-100' : 'bg-blue-100'}`}>
                        {isExpert ? <Brain className="w-5 h-5 text-amber-600" /> : <Bot className="w-5 h-5 text-blue-600" />}
                      </div>
                      <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm relative overflow-hidden group">
                        <div className={`absolute top-0 left-0 w-1 h-full ${isExpert ? 'bg-amber-400' : 'bg-blue-400'} opacity-30`}></div>
                        <div className="prose prose-slate prose-sm max-w-none text-slate-700 leading-relaxed font-normal">
                          <ReactMarkdown>{msg.response}</ReactMarkdown>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-3 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start pl-2 animate-in fade-in slide-in-from-left-2 duration-300">
                  <div className="flex items-start">
                    <div className={`hidden sm:flex mr-3 mt-1 rounded-lg p-1.5 h-8 w-8 items-center justify-center flex-shrink-0 ${isExpert ? 'bg-amber-100' : 'bg-blue-100'}`}>
                      {isExpert ? <Brain className="w-5 h-5 text-amber-600 animate-pulse" /> : <Bot className="w-5 h-5 text-blue-600 animate-pulse" />}
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                        </div>
                        <span className="text-sm font-semibold text-slate-400">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-slate-100 bg-white">
          <div className="relative group max-w-4xl mx-auto flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  isExpert
                    ? 'Ask about legal cases, sections, or concepts...'
                    : 'Type your question to your study buddy...'
                }
                rows={1}
                className="w-full pl-5 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 transition-all resize-none font-medium custom-scrollbar max-h-40"
                style={{ height: 'auto', minHeight: '56px' }}
              />
              <div className="absolute right-4 bottom-4 text-[10px] text-slate-400 font-medium">
                {input.length > 0 && `${input.length} chars`}
              </div>
            </div>

            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className={`p-4 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center h-14 w-14 ${!input.trim() || loading
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-200 hover:shadow-amber-300 transform'
                }`}
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Send className="w-6 h-6 ml-0.5" />
              )}
            </button>
          </div>
          <div className="max-w-4xl mx-auto mt-4 px-2 flex items-center justify-between text-[11px] font-medium text-slate-400">
            <div className="flex items-center space-x-4">
              <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2"></span>Enter to send</span>
              <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2"></span>Shift + Enter for new line</span>
            </div>
            <span>AI-generated content. Verify important facts.</span>
          </div>
        </div>
      </div>
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ ...deleteDialog, isOpen: false, itemId: null })}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        title={deleteDialog.type === 'conversation' ? 'Delete Conversation' : 'Delete Message'}
        message={
          deleteDialog.type === 'conversation'
            ? 'Are you sure you want to delete this entire conversation? All messages will be permanently removed.'
            : 'Are you sure you want to delete this message? This action cannot be undone.'
        }
      />
    </div>
  );
}
