import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

type ChatbotConversation = {
  id: string;
  user_id: string;
  chatbot_type: 'general' | 'legal_expert';
  message: string;
  response: string;
  created_at: string;
};

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
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Send, Brain, Loader2, Plus, Save, Trash2, ChevronRight, Clock } from 'lucide-react';

type ChatbotProps = {
  type: 'general' | 'legal_expert';
};

type ChatRole = 'user' | 'assistant';
type ConversationEntry = { role: ChatRole; content: string; timestamp: string };
type ChatSession = {
  id: string | null;
  title: string;
  messages: ChatbotConversation[];
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
  const [savedSessions, setSavedSessions] = useState<SavedChat[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSavedChats();
  }, [type]);

  useEffect(() => {
    scrollToBottom();
  }, [currentSession.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSavedChats = async () => {
    if (!user) return;
    try {
      // TODO: Implement chat loading logic
      setSavedSessions([]);
    } catch (error) {
      console.error('Error loading saved chats:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const API_URL = import.meta.env.DEV
    ? '/api/chat'
    : import.meta.env.VITE_API_URL;

  const generateResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: userMessage }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error('Failed to get response from server');
      }
      const data = await response.json();
      return data.response || data.answer || data;
    } catch (error) {
      console.error('Error generating response:', error);
      return 'I apologize, but I encountered an error processing your question. Please try again in a moment.';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !user || loading) return;
    const userMessage = input.trim();
    setInput('');
    setLoading(true);
    try {
      const botResponse = await generateResponse(userMessage);
      // TODO: Implement conversation saving logic
      const newMessage = {
        id: Date.now().toString(),
        user_id: user.id,
        chatbot_type: type,
        message: userMessage,
        response: botResponse,
        created_at: new Date().toISOString(),
      };
      setCurrentSession((prev) => ({
        ...prev,
        messages: [...prev.messages, newMessage],
        title: prev.title === 'New Chat' && prev.messages.length === 0
          ? userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : '')
          : prev.title,
      }));
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChat = async () => {
    if (!user || currentSession.messages.length === 0) return;
    try {
      // TODO: Implement chat saving logic
      console.log('Saving chat:', currentSession.title);
      await loadSavedChats();
      alert('Chat saved successfully!');
    } catch (error) {
      console.error('Error saving chat:', error);
      alert('Failed to save chat');
    }
  };

  const handleNewChat = () => {
    setCurrentSession({
      id: null,
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
    });
  };

  const handleLoadChat = async (chat: SavedChat) => {
    try {
      // TODO: Implement chat loading logic
      setCurrentSession({
        id: chat.id,
        title: chat.title,
        messages: [],
        createdAt: chat.created_at,
      });
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!confirm('Are you sure you want to delete this chat?')) return;
    try {
      // TODO: Implement chat deletion logic
      console.log('Deleting chat:', chatId);
      await loadSavedChats();
      if (currentSession.id === chatId) {
        handleNewChat();
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
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
    <div className="flex h-[calc(100vh-12rem)] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {showSidebar && (
        <div className="w-64 border-r border-slate-200 flex flex-col bg-slate-50">
          <div className="p-4 border-b border-slate-200">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">New Chat</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Saved Chats</h3>
            {loadingHistory ? (
              <div className="text-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400 mx-auto" />
              </div>
            ) : savedSessions.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No saved chats yet</p>
            ) : (
              savedSessions.map((session) => (
                <div
                  key={session.id}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
                    currentSession.id === session.id
                      ? 'bg-amber-50 border border-amber-200'
                      : 'hover:bg-white border border-transparent'
                  }`}
                  onClick={() => handleLoadChat(session)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-sm font-medium text-slate-900 truncate">{session.title}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <p className="text-xs text-slate-500">
                          {new Date(session.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center">
            {isExpert ? (
              <Brain className="w-6 h-6 mr-2 text-amber-600" />
            ) : (
              <MessageSquare className="w-6 h-6 mr-2 text-amber-600" />
            )}
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isExpert ? 'Legal Expert Bot' : 'Study Assistant'}
              </h2>
              <p className="text-xs text-slate-500">{currentSession.title}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="Toggle sidebar"
            >
              <ChevronRight className={`w-5 h-5 text-slate-600 transition-transform ${showSidebar ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={handleSaveChat}
              disabled={currentSession.messages.length === 0}
              className="flex items-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Save chat"
            >
              <Save className="w-4 h-4" />
              <span className="text-sm font-medium">Save</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {currentSession.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              {isExpert ? (
                <Brain className="w-16 h-16 text-slate-300 mb-4" />
              ) : (
                <MessageSquare className="w-16 h-16 text-slate-300 mb-4" />
              )}
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                {isExpert ? 'Legal Expert Ready' : 'Start a Conversation'}
              </h3>
              <p className="text-slate-500 text-sm max-w-sm">
                {isExpert
                  ? 'Ask complex legal questions, request case analysis, or seek expert guidance on Indian law.'
                  : 'Ask me anything about your legal studies, exam preparation, or course concepts.'}
              </p>
            </div>
          ) : (
            <>
              {currentSession.messages.map((msg, idx) => (
                <div key={msg.id || idx} className="space-y-3">
                  <div className="flex justify-end">
                    <div className="bg-amber-500 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] shadow-sm">
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] shadow-sm">
                      <div className="text-sm text-slate-800">
                        <ReactMarkdown>{msg.response}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                      <span className="text-sm text-slate-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  isExpert
                    ? 'Ask a legal question or request case analysis...'
                    : 'Type your question here...'
                }
                rows={2}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            {isExpert
              ? 'Expert responses are AI-generated and for educational purposes only.'
              : 'This is an AI assistant for learning support. Always verify important information.'}
          </p>
        </div>
      </div>
    </div>
  );
}
