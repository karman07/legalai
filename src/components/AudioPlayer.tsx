import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ArrowLeft, Loader2 } from 'lucide-react';
import { audioLessonsAPI, AudioLesson } from '../services/api';

export default function AudioPlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<AudioLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const words = lesson?.transcript?.split(' ') || [];

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
        const wordIndex = Math.floor((audio.currentTime / audio.duration) * words.length);
        setCurrentWordIndex(wordIndex);
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
  }, [lesson, words.length]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <button
          onClick={() => navigate('/audio')}
          className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl text-amber-700 hover:text-amber-800 hover:bg-white mb-8 font-semibold shadow-md hover:shadow-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Lessons</span>
        </button>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-amber-200">
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-10 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h1 className="text-4xl font-bold mb-3 drop-shadow-lg">{lesson.title}</h1>
              {lesson.description && <p className="text-amber-50 text-lg">{lesson.description}</p>}
            </div>
          </div>

          <div className="p-10">
            {lesson.transcript ? (
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 mb-10 max-h-[500px] overflow-y-auto border-2 border-slate-200 shadow-inner">
                <div className="text-xl leading-relaxed">
                  {words.map((word, index) => (
                    <span
                      key={index}
                      className={`transition-all duration-300 ${
                        index === currentWordIndex
                          ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white px-2 py-1 rounded-lg font-bold shadow-lg scale-110 inline-block'
                          : 'text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      {word}{' '}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-16 mb-10 text-center border-2 border-dashed border-slate-300">
                <p className="text-slate-500 text-lg">No transcript available for this lesson</p>
              </div>
            )}

            <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-8 shadow-xl border-2 border-slate-300">
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-700 mb-3">
                  <span className="bg-white px-3 py-1 rounded-lg shadow">{formatTime(currentTime)}</span>
                  <span className="bg-white px-3 py-1 rounded-lg shadow">{formatTime(duration)}</span>
                </div>
                <div className="relative h-3 bg-slate-300 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="absolute h-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 transition-all shadow-lg"
                    style={{ width: `${progress}%` }}
                  />
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={handleSeek}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 bg-white rounded-xl px-4 py-2 shadow-md">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5 text-slate-700" /> : <Volume2 className="w-5 h-5 text-slate-700" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      setIsMuted(false);
                    }}
                    className="w-28"
                  />
                </div>

                <div className="flex items-center space-x-5">
                  <button
                    onClick={() => handleSkip(-10)}
                    className="p-4 bg-white hover:bg-slate-50 rounded-full transition-all shadow-md hover:shadow-lg transform hover:scale-110"
                  >
                    <SkipBack className="w-6 h-6 text-slate-700" />
                  </button>

                  <button
                    onClick={handlePlayPause}
                    className="p-6 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 rounded-full shadow-2xl transition-all transform hover:scale-110"
                  >
                    {isPlaying ? (
                      <Pause className="w-10 h-10 text-white" />
                    ) : (
                      <Play className="w-10 h-10 text-white ml-1" />
                    )}
                  </button>

                  <button
                    onClick={() => handleSkip(10)}
                    className="p-4 bg-white hover:bg-slate-50 rounded-full transition-all shadow-md hover:shadow-lg transform hover:scale-110"
                  >
                    <SkipForward className="w-6 h-6 text-slate-700" />
                  </button>
                </div>

                <div className="w-40" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
