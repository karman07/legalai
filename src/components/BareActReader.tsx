import { useState, useEffect, useRef } from 'react';
import { BookOpen, Volume2, Play, Pause, Square, SkipBack, SkipForward, Bookmark, Languages, FileText, Loader2, X, Sparkles, Send } from 'lucide-react';
import api from '../services/api';
import chatService from '../services/chatService';

type ActCategory = {
  id: string;
  name: string;
  description: string;
  sections: number;
  count: number;
};

type AudioLesson = {
  _id: string;
  title: string;
  description: string;
  audioUrl: string;
  fileName: string;
  fileSize: number;
  duration: number;
  transcript: string;
  category: string;
  tags: string[];
  language: string;
  isActive: boolean;
  transcriptionStatus: string;
  createdAt: string;
  updatedAt: string;
};

type ViewMode = 'government' | 'easy';

export default function BareActReader() {
  const [categories, setCategories] = useState<ActCategory[]>([]);
  const [selectedAct, setSelectedAct] = useState<ActCategory | null>(null);
  const [audioLessons, setAudioLessons] = useState<AudioLesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<AudioLesson | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('government');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Selection TTS state ────────────────────────────────────
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const ttsRef = useRef<SpeechSynthesisUtterance | null>(null);

  // ── Text-selection AI chat state ───────────────────────────
  const [selectionPopup, setSelectionPopup] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiConversationId, setAiConversationId] = useState<string | null>(null);
  const aiChatRef = useRef<HTMLDivElement>(null);
  const chatStorageKey = `ai-chat:bare-act:${selectedLesson?._id ?? 'none'}`;

  type ChatMessageItem = { role: 'user' | 'ai'; text: string };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(chatStorageKey);
      if (!saved) return;
      const parsed = JSON.parse(saved) as {
        aiMessages?: ChatMessageItem[];
        aiConversationId?: string | null;
        aiQuery?: string;
      };
      setAiMessages(parsed.aiMessages ?? []);
      setAiConversationId(parsed.aiConversationId ?? null);
      setAiQuery(parsed.aiQuery ?? '');
    } catch {
      // Ignore malformed localStorage payloads
    }
  }, [chatStorageKey]);

  useEffect(() => {
    localStorage.setItem(chatStorageKey, JSON.stringify({ aiMessages, aiConversationId, aiQuery }));
  }, [chatStorageKey, aiMessages, aiConversationId, aiQuery]);

  useEffect(() => {
    if (aiChatRef.current) {
      aiChatRef.current.scrollTop = aiChatRef.current.scrollHeight;
    }
  }, [aiMessages]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (selectionPopup && !(e.target as Element)?.closest('[data-ai-popup]')) {
        setSelectionPopup(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [selectionPopup]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  useEffect(() => {
    if (selectedAct) {
      fetchAudioLessons(selectedAct.id).catch((err: Error) => {
        console.error('Failed to fetch audio lessons:', err.message);
        setError(err.message || 'Failed to load audio lessons');
      });
    }
  }, [selectedAct]);

  useEffect(() => {
    if (selectedLesson && selectedLesson.audioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      const audio = audioRef.current;
      const baseURL = (import.meta.env.VITE_API_URL || 'http://api.legalpadhai.ai').replace('/api', '');
      const sanitizedUrl = `${baseURL}${selectedLesson.audioUrl.replace(/[^a-zA-Z0-9-_./]/g, '')}`;
      audio.src = sanitizedUrl;

      const handleMetadata = () => {
        if (!isNaN(audio.duration) && isFinite(audio.duration)) {
          setDuration(Math.floor(audio.duration));
        }
      };

      const handleTimeUpdate = () => {
        if (!isNaN(audio.currentTime) && isFinite(audio.currentTime)) {
          setCurrentTime(Math.floor(audio.currentTime));
        }
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      const handleError = (e: Event) => {
        console.error('Audio playback error:', e);
        setIsPlaying(false);
        setError('Failed to load audio file');
      };

      audio.addEventListener('loadedmetadata', handleMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      return () => {
        audio.removeEventListener('loadedmetadata', handleMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.pause();
        audio.src = '';
      };
    }
  }, [selectedLesson]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.error('Error playing audio:', err);
          setIsPlaying(false);
          setError('Failed to play audio. Please try again.');
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api<ActCategory[]>('/audio-lessons/categories');
      setCategories(data);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchAudioLessons = async (category: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api<{ items: AudioLesson[]; total: number; page: number; limit: number; totalPages: number }>(`/audio-lessons/category/${category}`);
      setAudioLessons(data.items || []);

      if (data.items && data.items.length > 0) {
        setSelectedLesson(data.items[0]);
        setDuration(data.items[0].duration || 0);
      } else {
        setSelectedLesson(null);
      }
    } catch (err: any) {
      console.error('Error fetching audio lessons:', err);
      setError(err.message || 'Failed to load audio lessons');
      setAudioLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (selectedLesson && audioRef.current) {
      setIsPlaying(!isPlaying);
    }
  };

  const handleSkipBack = () => {
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
      } catch {
        // Ignore seek errors
      }
    }
  };

  const handleSkipForward = () => {
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
      } catch {
        // Ignore seek errors
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseInt(e.target.value);
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = newTime;
      } catch {
        // Ignore seek errors
      }
    }
  };

  const handleLessonSelect = (lesson: AudioLesson) => {
    setSelectedLesson(lesson);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(lesson.duration || 0);
  };

  const handleBackToActs = () => {
    setSelectedAct(null);
    setSelectedLesson(null);
    setAudioLessons([]);
    setIsPlaying(false);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!selectedAct) {
    return (
      <div>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2"><div className="w-11 h-11 bg-brand-100 dark:bg-brand-900 rounded-xl flex items-center justify-center"><BookOpen className="w-5 h-5 text-brand-700 dark:text-gold-400" /></div><div><h2 className="text-2xl font-bold text-brand-900">Audiobooks</h2><p className="text-brand-500 text-sm mt-0.5">Listen to Indian laws in original and simplified language</p></div></div>
          
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-gold-600 animate-spin" />
            <span className="ml-3 text-brand-600">Loading categories...</span>
          </div>
        )}

        {error && (
          <div className="bg-white border-2 border-red-300 rounded-xl p-5 mb-6 shadow-md">
            <p className="text-red-700 font-medium">{error}</p>
            <button
              onClick={fetchCategories}
              className="mt-3 px-4 py-2 border-2 border-red-500 text-red-600 hover:bg-red-50 font-semibold rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && categories.length === 0 && (
          <div className="bg-white border-2 border-dashed border-brand-300 rounded-2xl p-12 text-center">
            <FileText className="w-16 h-16 text-brand-400 mx-auto mb-4" />
            <p className="text-lg text-brand-600">No audio lessons available yet.</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((act) => (
            <button
              key={act.id}
              onClick={() => setSelectedAct(act)}
              className="group relative bg-white rounded-3xl p-8 text-left transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] hover:-translate-y-2 border border-brand-200 hover:border-transparent overflow-hidden"
            >
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-gold-500 via-gold-400 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-white opacity-95 group-hover:opacity-90 transition-opacity duration-500"></div>

              {/* Decorative elements */}
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-gold-400/20 to-gold-300/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-tr from-orange-400/20 to-rose-400/20 rounded-full blur-xl group-hover:scale-125 transition-transform duration-700"></div>

              <div className="relative z-10">
                {/* Header with icon and badges */}
                <div className="flex items-start justify-between mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gold-500 rounded-2xl blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative bg-gold-500 p-5 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-brand-900/10 rounded-xl blur-sm"></div>
                      <div className="relative px-4 py-2 bg-white border-2 border-brand-300 group-hover:border-gold-500 text-brand-700 group-hover:text-gold-700 text-xs rounded-xl font-bold shadow-sm group-hover:shadow-md transition-all">
                        <span className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-400 group-hover:bg-gold-500 transition-colors"></div>
                          {act.sections} sections
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gold-500/20 rounded-xl blur-sm"></div>
                      <div className="relative px-4 py-2 bg-brand-900 text-white text-xs rounded-xl font-bold shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all">
                        <span className="flex items-center gap-1.5">
                          <Volume2 className="w-3 h-3" />
                          {act.count} lessons
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-brand-900 group-hover:text-gold-600 transition-all duration-300 leading-tight">
                    {act.name}
                  </h3>
                  <p className="text-brand-600 group-hover:text-brand-700 leading-relaxed line-clamp-2 transition-colors">
                    {act.description}
                  </p>
                </div>

                {/* Action indicator */}
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand-400 group-hover:text-gold-600 transition-colors">
                    Click to explore
                  </span>
                  <div className="w-8 h-8 rounded-full border-2 border-brand-300 group-hover:border-gold-500 group-hover:bg-gold-500 flex items-center justify-center transition-all group-hover:scale-110">
                    <svg className="w-4 h-4 text-brand-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-10 bg-white border-2 border-gold-200 rounded-2xl p-8 shadow-lg">
          <div className="flex items-start space-x-5">
            <div className="bg-gold-500 p-4 rounded-xl flex-shrink-0 shadow-lg">
              <Volume2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-brand-900 mb-2">Audio Learning Experience</h3>
              <p className="text-brand-600 leading-relaxed">
                Listen to legal texts with synchronized transcripts in both government and simplified language.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Selection TTS handlers ────────────────────────────────
  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);

  const speakSelected = () => {
    if (!selectedText.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(selectedText.trim());
    utterance.lang = 'en-IN';
    utterance.rate = 1;
    utterance.onstart = () => { setIsSpeaking(true); setIsPaused(false); };
    utterance.onend   = () => { setIsSpeaking(false); setIsPaused(false); };
    utterance.onerror = () => { setIsSpeaking(false); setIsPaused(false); };
    ttsRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setSelectionPopup(null);
  };

  const pauseSpeak = () => {
    window.speechSynthesis.pause();
    setIsSpeaking(false);
    setIsPaused(true);
  };

  const resumeSpeak = () => {
    window.speechSynthesis.resume();
    setIsSpeaking(true);
    setIsPaused(false);
  };

  const stopSpeak = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  // ── Text-selection AI chat handlers ───────────────────────
  const handleTranscriptMouseUp = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? '';
    if (text.length > 3) {
      const range = selection!.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedText(text);
      setSelectionPopup({ x: rect.left + rect.width / 2, y: rect.top - 8 });
    } else {
      setSelectionPopup(null);
    }
  };

  const openAiChat = () => {
    if (selectedText) {
      setAiQuery(prev => prev.trim() ? prev : `Selected text:\n"${selectedText}"\n\nQuestion: `);
    }
    setShowAiChat(true);
    setSelectionPopup(null);
  };

  const sendAiMessage = async () => {
    const rawQuery = aiQuery.trim();
    if (!rawQuery || aiLoading) return;
    const userMsg = { role: 'user' as const, text: rawQuery };
    setAiMessages(prev => [...prev, userMsg]);
    setAiQuery('');
    setAiLoading(true);
    try {
      const res = await chatService.sendMessage(rawQuery, aiConversationId);
      setAiConversationId(res.conversationId);
      setAiMessages(prev => [...prev, { role: 'ai' as const, text: res.response }]);
    } catch (err: any) {
      setAiMessages(prev => [...prev, { role: 'ai' as const, text: `Error: ${err.message ?? 'Failed to get response'}` }]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={handleBackToActs}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-brand-200 hover:bg-brand-50 text-brand-600 font-medium mb-4 rounded-xl transition-all text-sm"
          >
            ← Back
          </button>
          <h2 className="text-3xl font-bold text-brand-900">{selectedAct.name}</h2>
          <p className="text-brand-600 mt-2">{selectedAct.description}</p>
        </div>
        <button className="p-3 border-2 border-brand-300 hover:border-gold-400 rounded-xl transition-all">
          <Bookmark className="w-6 h-6 text-brand-400 hover:text-gold-500" />
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-gold-600 animate-spin" />
          <span className="ml-3 text-brand-600">Loading lessons...</span>
        </div>
      )}

      {error && (
        <div className="bg-white border-2 border-red-300 rounded-xl p-5 mb-6 shadow-md">
          <p className="text-red-700 font-medium">{error}</p>
          <button
            onClick={() => selectedAct && fetchAudioLessons(selectedAct.id)}
            className="mt-3 px-4 py-2 border-2 border-red-500 text-red-600 hover:bg-red-50 font-semibold rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && audioLessons.length === 0 && (
        <div className="bg-white border-2 border-dashed border-brand-300 rounded-2xl p-12 text-center">
          <Volume2 className="w-16 h-16 text-brand-400 mx-auto mb-4" />
          <p className="text-lg text-brand-600">No audio lessons available for this act.</p>
        </div>
      )}

      {audioLessons.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-brand-900 mb-5">Audiobooks</h3>
            <div className="space-y-3">
              {audioLessons.map((lesson) => (
                <button
                  key={lesson._id}
                  onClick={() => handleLessonSelect(lesson)}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-300 ${selectedLesson?._id === lesson._id
                    ? 'border-brand-900 bg-brand-50 shadow-md'
                    : 'border-brand-200 hover:border-gold-400 bg-white hover:shadow-md'
                    }`}
                >
                  <h4 className="font-semibold text-brand-900 mb-2">{lesson.title}</h4>
                  <p className="text-sm text-brand-600 mb-3">{lesson.description}</p>
                  <div className="flex items-center justify-between text-xs text-brand-500">
                    <span className="font-medium">{formatTime(lesson.duration || 0)}</span>
                    <span className="px-2 py-1 border border-brand-300 rounded-lg font-medium">{lesson.language}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedLesson && (
              <div className="bg-white border-2 border-brand-200 rounded-2xl p-8 shadow-lg">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-brand-900 mb-3">{selectedLesson.title}</h3>
                  <p className="text-brand-600 leading-relaxed">{selectedLesson.description}</p>
                </div>

                <div className="flex items-center space-x-4 mb-8">
                  <span className="text-sm font-semibold text-brand-700">View Mode:</span>
                  <div className="flex border-2 border-brand-200 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('government')}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${viewMode === 'government'
                        ? 'bg-brand-900 text-white shadow-md'
                        : 'text-brand-600 hover:text-brand-900'
                        }`}
                    >
                      <FileText className="w-4 h-4 inline mr-2" />
                      Government
                    </button>
                    <button
                      onClick={() => setViewMode('easy')}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${viewMode === 'easy'
                        ? 'bg-brand-900 text-white shadow-md'
                        : 'text-brand-600 hover:text-brand-900'
                        }`}
                    >
                      <Languages className="w-4 h-4 inline mr-2" />
                      Simplified
                    </button>
                  </div>
                </div>

                <div className="bg-white border-2 border-brand-200 rounded-xl p-6 mb-8 shadow-inner">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleSkipBack}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                        disabled={!selectedLesson}
                      >
                        <SkipBack className="w-5 h-5 text-brand-600" />
                      </button>
                      <button
                        onClick={handlePlayPause}
                        className="p-3.5 bg-brand-900 hover:bg-brand-800 text-white rounded-full transition-all shadow-lg"
                        disabled={!selectedLesson}
                      >
                        {isPlaying ? (
                          <Pause className="w-6 h-6" />
                        ) : (
                          <Play className="w-6 h-6" />
                        )}
                      </button>
                      <button
                        onClick={handleSkipForward}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                        disabled={!selectedLesson}
                      >
                        <SkipForward className="w-5 h-5 text-brand-600" />
                      </button>
                    </div>
                    <div className="text-sm text-brand-600">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max={duration}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-2 bg-brand-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${progress}%, #e2e8f0 ${progress}%, #e2e8f0 100%)`
                      }}
                    />
                  </div>
                </div>

                <div className="bg-white border-2 border-brand-200 rounded-xl p-6 shadow-inner">
                  <h4 className="font-semibold text-brand-900 mb-4 flex items-center text-lg">
                    <FileText className="w-5 h-5 mr-2" />
                    Transcript ({viewMode === 'government' ? 'Government' : 'Simplified'} Language)
                  </h4>
                  <div onMouseUp={handleTranscriptMouseUp} className="prose prose-sm max-w-none text-brand-700 leading-relaxed select-text">
                    {selectedLesson.transcript && typeof selectedLesson.transcript === 'string' ? (
                      <p className="whitespace-pre-wrap">{selectedLesson.transcript}</p>
                    ) : (
                      <p className="text-brand-500 italic">Transcript not available for this lesson.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Text-Selection Popup Bubble (Speak + Ask AI) ──── */}
      {selectionPopup && (
        <div
          data-ai-popup="true"
          style={{ position: 'fixed', left: selectionPopup.x, top: selectionPopup.y, transform: 'translate(-50%, -100%)' }}
          className="z-[200] flex items-center gap-1.5 pb-1"
          onMouseDown={e => e.stopPropagation()}
        >
          <button
            onClick={speakSelected}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-full shadow-lg text-xs font-semibold border border-emerald-500 transition-all whitespace-nowrap"
          >
            <Volume2 className="w-3.5 h-3.5" />
            Speak
          </button>
          <button
            onClick={openAiChat}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-900 hover:bg-brand-700 text-white rounded-full shadow-lg text-xs font-semibold border border-brand-600 transition-all whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            Ask AI
          </button>
        </div>
      )}

      {/* ── Floating TTS Controls (while speaking selected text) */}
      {(isSpeaking || isPaused) && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[250] flex items-center gap-2.5 px-4 py-2.5 bg-brand-900 border border-brand-700 rounded-full shadow-2xl">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isSpeaking ? 'bg-emerald-400 animate-pulse' : 'bg-brand-500'}`} />
          <span className="text-xs font-medium text-white whitespace-nowrap">
            {isSpeaking ? 'Speaking...' : 'Paused'}
          </span>
          {isSpeaking ? (
            <button
              onClick={pauseSpeak}
              className="flex items-center gap-1 px-2.5 py-1 bg-brand-700 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold transition-all"
            >
              <Pause className="w-3 h-3" /> Pause
            </button>
          ) : (
            <button
              onClick={resumeSpeak}
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all"
            >
              <Play className="w-3 h-3" /> Resume
            </button>
          )}
          <button
            onClick={stopSpeak}
            className="p-1.5 bg-brand-700 hover:bg-red-500/20 text-brand-300 hover:text-red-400 rounded-lg transition-all"
            title="Stop"
          >
            <Square className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* ── AI Chat Mini Panel ──────────────────────────────── */}
      {showAiChat && (
        <div className="fixed bottom-4 right-4 z-[200] w-[92vw] sm:w-[520px] bg-white rounded-2xl shadow-2xl border border-brand-200 flex flex-col overflow-hidden" style={{ maxHeight: '72vh' }}>
          <div className="flex items-center justify-between px-5 py-4 bg-brand-900 text-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-400" />
              <div>
                <p className="font-semibold text-base leading-tight">Ask AI</p>
                <p className="text-[11px] text-brand-300">Context-aware legal assistant</p>
              </div>
            </div>
            <button onClick={() => setShowAiChat(false)} className="p-1 rounded-lg hover:bg-brand-700 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
          {selectedText && (
            <div className="px-4 py-3 bg-gold-50 border-b border-gold-200 flex-shrink-0">
              <p className="text-xs text-gold-700 font-semibold mb-1">Selected text loaded in draft:</p>
              <p className="text-sm text-gold-800 line-clamp-2 italic">"{selectedText.slice(0, 180)}{selectedText.length > 180 ? '…' : ''}"</p>
            </div>
          )}
          <div ref={aiChatRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0" style={{ maxHeight: '44vh' }}>
            {aiMessages.length === 0 && (
              <p className="text-sm text-brand-400 text-center py-6">
                {selectedText ? 'Review the draft below and press send when ready.' : 'Ask anything about this document.'}
              </p>
            )}
            {aiMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user' ? 'bg-brand-900 text-white' : 'bg-brand-50 text-brand-800 border border-brand-200'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {aiLoading && (
              <div className="flex justify-start">
                <div className="bg-brand-50 border border-brand-200 rounded-xl px-3 py-2 flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 text-brand-400 animate-spin" />
                  <span className="text-xs text-brand-500">Thinking…</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-end gap-2 p-4 border-t border-brand-200 flex-shrink-0 bg-white">
            <textarea
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAiMessage(); } }}
              placeholder="Write or edit your question before sending..."
              rows={4}
              className="flex-1 resize-none text-sm border border-brand-200 rounded-xl px-3.5 py-3 focus:outline-none focus:border-brand-500 text-brand-800 placeholder:text-brand-400"
            />
            <button
              onClick={sendAiMessage}
              disabled={!aiQuery.trim() || aiLoading}
              className="px-4 py-3 bg-brand-900 hover:bg-brand-700 disabled:opacity-40 text-white rounded-xl transition-all flex-shrink-0 text-sm font-semibold"
            >
              <span className="inline-flex items-center gap-1.5">
                <Send className="w-4 h-4" />
                Send
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
