import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, SkipBack, SkipForward, ArrowLeft, Loader2 } from 'lucide-react';
import { audioLessonsAPI, AudioLesson } from '../services/api';

export default function AudioPlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<AudioLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const words = lesson?.transcript?.split(/\s+/).filter(w => w.length > 0) || [];

  useEffect(() => {
    if (id) {
      fetchLesson(id);
    }
  }, [id]);

  useEffect(() => {
    if (lesson?.audioUrl) {
      const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
      const audio = new Audio(`${baseUrl}${lesson.audioUrl}`);
      audioRef.current = audio;

      const handleLoadedMetadata = () => setDuration(audio.duration);
      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
        if (words.length > 0 && audio.duration > 0) {
          const progress = audio.currentTime / audio.duration;
          const wordIndex = Math.floor(progress * words.length);
          setCurrentWordIndex(Math.min(wordIndex, words.length - 1));
        }
      };
      const handleEnded = () => setIsPlaying(false);

      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.pause();
        audio.src = '';
      };
    }
  }, [lesson]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);



  const fetchLesson = async (lessonId: string) => {
    try {
      setLoading(true);
      const response = await audioLessonsAPI.getAudioLessons(1, 100);
      const foundLesson = response.items.find(l => l._id === lessonId);
      setLesson(foundLesson || null);
    } catch {
      setLesson(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = () => setIsPlaying(!isPlaying);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleSkip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-amber-600 animate-spin" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Lesson not found</h2>
          <button onClick={() => navigate('/audio')} className="text-amber-600 hover:text-amber-700">
            Go back
          </button>
        </div>
      </div>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/audio')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {lesson.transcript ? (
          <div className="prose prose-lg max-w-none">
            <div className="text-slate-800 leading-relaxed font-serif text-lg">
              {words.map((word, index) => (
                <span
                  key={index}
                  className={`transition-all duration-200 ${
                    index === currentWordIndex
                      ? 'bg-amber-400 text-slate-900 px-1 rounded font-semibold'
                      : 'text-slate-800'
                  }`}
                >
                  {word}{' '}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg">No transcript available</p>
          </div>
        )}
      </div>

      {/* Fixed Audio Player */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-amber-400 shadow-2xl z-50">
        <div className="max-w-5xl mx-auto px-6 py-4">
          {/* Progress Bar */}
          <div className="mb-3">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #f59e0b ${progress}%, #e2e8f0 ${progress}%)`
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            {/* Time Display */}
            <div className="flex items-center gap-2 text-sm text-slate-600 min-w-[100px]">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleSkip(-10)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                title="Rewind 10s"
              >
                <SkipBack className="w-6 h-6 text-slate-700" />
              </button>

              <button
                onClick={handlePlayPause}
                className="p-4 bg-amber-500 hover:bg-amber-600 rounded-full transition-all shadow-lg"
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 text-white" fill="white" />
                ) : (
                  <Play className="w-7 h-7 text-white" fill="white" />
                )}
              </button>

              <button
                onClick={() => handleSkip(10)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                title="Forward 10s"
              >
                <SkipForward className="w-6 h-6 text-slate-700" />
              </button>
            </div>

            {/* Title */}
            <div className="flex items-center gap-2 min-w-[200px] justify-end">
              <span className="text-amber-600 text-sm">🔊 Audiobook Player</span>
            </div>
          </div>

          {/* Reading Status */}
          <div className="text-center mt-2">
            <p className="text-xs text-slate-500">Reading: {lesson.title}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
