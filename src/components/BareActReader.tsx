import { useState, useEffect, useRef } from 'react';
import { BookOpen, Volume2, Play, Pause, SkipBack, SkipForward, Bookmark, Languages, FileText, Loader2 } from 'lucide-react';
import api from '../services/api';

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
      const baseURL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace('/api', '');
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
          <h2 className="text-3xl font-bold text-slate-900 flex items-center mb-2">
            <BookOpen className="w-8 h-8 mr-3 text-amber-600" />
            Immersive Bare Act Reader
          </h2>
          <p className="text-lg text-slate-600">Read and listen to Indian laws in original and simplified language</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
            <span className="ml-3 text-slate-600">Loading categories...</span>
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
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
            <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-lg text-slate-600">No audio lessons available yet.</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((act) => (
            <button
              key={act.id}
              onClick={() => setSelectedAct(act)}
              className="group relative bg-white rounded-3xl p-8 text-left transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] hover:-translate-y-2 border border-slate-200 hover:border-transparent overflow-hidden"
            >
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-white opacity-95 group-hover:opacity-90 transition-opacity duration-500"></div>
              
              {/* Decorative elements */}
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-tr from-orange-400/20 to-rose-400/20 rounded-full blur-xl group-hover:scale-125 transition-transform duration-700"></div>
              
              <div className="relative z-10">
                {/* Header with icon and badges */}
                <div className="flex items-start justify-between mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-amber-500 to-orange-500 p-5 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-slate-900/10 rounded-xl blur-sm"></div>
                      <div className="relative px-4 py-2 bg-white border-2 border-slate-300 group-hover:border-amber-500 text-slate-700 group-hover:text-amber-700 text-xs rounded-xl font-bold shadow-sm group-hover:shadow-md transition-all">
                        <span className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-amber-500 transition-colors"></div>
                          {act.sections} sections
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 bg-amber-500/20 rounded-xl blur-sm"></div>
                      <div className="relative px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs rounded-xl font-bold shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all">
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
                  <h3 className="text-2xl font-bold text-slate-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-amber-600 group-hover:to-orange-600 transition-all duration-300 leading-tight">
                    {act.name}
                  </h3>
                  <p className="text-slate-600 group-hover:text-slate-700 leading-relaxed line-clamp-2 transition-colors">
                    {act.description}
                  </p>
                </div>
                
                {/* Action indicator */}
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 group-hover:text-amber-600 transition-colors">
                    Click to explore
                  </span>
                  <div className="w-8 h-8 rounded-full border-2 border-slate-300 group-hover:border-amber-500 group-hover:bg-amber-500 flex items-center justify-center transition-all group-hover:scale-110">
                    <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-10 bg-white border-2 border-amber-200 rounded-2xl p-8 shadow-lg">
          <div className="flex items-start space-x-5">
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-4 rounded-xl flex-shrink-0 shadow-lg">
              <Volume2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Audio Learning Experience</h3>
              <p className="text-slate-600 leading-relaxed">
                Listen to legal texts with synchronized transcripts in both government and simplified language.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={handleBackToActs}
            className="px-4 py-2 border-2 border-amber-500 text-amber-600 hover:bg-amber-50 font-semibold mb-3 flex items-center rounded-lg transition-all"
          >
            ← Back to Acts
          </button>
          <h2 className="text-3xl font-bold text-slate-900">{selectedAct.name}</h2>
          <p className="text-slate-600 mt-2">{selectedAct.description}</p>
        </div>
        <button className="p-3 border-2 border-slate-300 hover:border-amber-400 rounded-xl transition-all">
          <Bookmark className="w-6 h-6 text-slate-400 hover:text-amber-500" />
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          <span className="ml-3 text-slate-600">Loading lessons...</span>
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
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
          <Volume2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-lg text-slate-600">No audio lessons available for this act.</p>
        </div>
      )}

      {audioLessons.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-slate-900 mb-5">Audio Lessons</h3>
            <div className="space-y-3">
              {audioLessons.map((lesson) => (
                <button
                  key={lesson._id}
                  onClick={() => handleLessonSelect(lesson)}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-300 ${
                    selectedLesson?._id === lesson._id
                      ? 'border-amber-400 bg-white shadow-lg'
                      : 'border-slate-200 hover:border-amber-300 bg-white hover:shadow-md'
                  }`}
                >
                  <h4 className="font-semibold text-slate-900 mb-2">{lesson.title}</h4>
                  <p className="text-sm text-slate-600 mb-3">{lesson.description}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-medium">{formatTime(lesson.duration || 0)}</span>
                    <span className="px-2 py-1 border border-slate-300 rounded-lg font-medium">{lesson.language}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedLesson && (
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 shadow-lg">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{selectedLesson.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{selectedLesson.description}</p>
                </div>

                <div className="flex items-center space-x-4 mb-8">
                  <span className="text-sm font-semibold text-slate-700">View Mode:</span>
                  <div className="flex border-2 border-slate-200 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('government')}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                        viewMode === 'government'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <FileText className="w-4 h-4 inline mr-2" />
                      Government
                    </button>
                    <button
                      onClick={() => setViewMode('easy')}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                        viewMode === 'easy'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Languages className="w-4 h-4 inline mr-2" />
                      Simplified
                    </button>
                  </div>
                </div>

                <div className="bg-white border-2 border-slate-200 rounded-xl p-6 mb-8 shadow-inner">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleSkipBack}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                        disabled={!selectedLesson}
                      >
                        <SkipBack className="w-5 h-5 text-slate-600" />
                      </button>
                      <button
                        onClick={handlePlayPause}
                        className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
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
                        <SkipForward className="w-5 h-5 text-slate-600" />
                      </button>
                    </div>
                    <div className="text-sm text-slate-600">
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
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${progress}%, #e2e8f0 ${progress}%, #e2e8f0 100%)`
                      }}
                    />
                  </div>
                </div>

                <div className="bg-white border-2 border-slate-200 rounded-xl p-6 shadow-inner">
                  <h4 className="font-semibold text-slate-900 mb-4 flex items-center text-lg">
                    <FileText className="w-5 h-5 mr-2" />
                    Transcript ({viewMode === 'government' ? 'Government' : 'Simplified'} Language)
                  </h4>
                  <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed">
                    {selectedLesson.transcript && typeof selectedLesson.transcript === 'string' ? (
                      <p className="whitespace-pre-wrap">{selectedLesson.transcript}</p>
                    ) : (
                      <p className="text-slate-500 italic">Transcript not available for this lesson.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
