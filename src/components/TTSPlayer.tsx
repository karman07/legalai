import { useState, useEffect, useRef } from 'react';

type TTSContent = {
  id: string;
  title: string;
  text_content: string;
  audio_url: string | null;
  category: string | null;
  duration_seconds: number | null;
  language: string;
  created_at: string;
};
import { Volume2, Play, Pause, SkipBack, SkipForward, Clock, BookMarked } from 'lucide-react';

export default function TTSPlayer() {
  const [content, setContent] = useState<TTSContent[]>([]);
  const [selectedContent, setSelectedContent] = useState<TTSContent | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  useEffect(() => {
    loadContent();
  }, [selectedCategory]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const loadContent = async () => {
    setLoading(true);
    try {
      // TODO: Implement TTS content loading logic
      setContent([]);
    } catch (error) {
      console.error('Error loading TTS content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPrerecorded = (item: TTSContent) => {
    if (selectedContent?.id === item.id && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    window.speechSynthesis.cancel();

    if (item.audio_url) {
      const audio = new Audio(item.audio_url);
      audioRef.current = audio;

      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });

      audio.play();
      setSelectedContent(item);
      setIsPlaying(true);
    }
  };

  const handlePlayTTS = (item: TTSContent) => {
    if (selectedContent?.id === item.id && isPlaying && isSynthesizing) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsSynthesizing(false);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(item.text_content);
    utterance.lang = item.language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setSelectedContent(item);
      setIsPlaying(true);
      setIsSynthesizing(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsSynthesizing(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsSynthesizing(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const togglePlayPause = () => {
    if (!selectedContent) return;

    if (selectedContent.audio_url && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else if (isSynthesizing) {
      if (isPlaying) {
        window.speechSynthesis.pause();
        setIsPlaying(false);
      } else {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      }
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.currentTime + 10,
        audioRef.current.duration
      );
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const categories = ['Constitutional Law', 'Criminal Law', 'Civil Law', 'Corporate Law', 'Tax Law'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center">
            <Volume2 className="w-7 h-7 mr-2 text-amber-600" />
            Audio Lessons
          </h2>
          <p className="text-slate-600 mt-1">Listen to pre-recorded legal content</p>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : content.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <BookMarked className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">No audio content available yet.</p>
          <p className="text-sm text-slate-500 mt-2">Check back later for new lessons.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {content.map((item) => {
            const isCurrentlyPlaying = selectedContent?.id === item.id && isPlaying;

            return (
              <div
                key={item.id}
                className={`border rounded-lg p-4 transition-all ${
                  selectedContent?.id === item.id
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                    <div className="flex items-center space-x-3 text-sm text-slate-600">
                      {item.category && (
                        <span className="px-2 py-1 bg-slate-100 rounded text-xs">{item.category}</span>
                      )}
                      {item.duration_seconds && (
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(item.duration_seconds)}
                        </span>
                      )}
                      <span className="uppercase text-xs font-medium">{item.language}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-700 mb-4 line-clamp-2">{item.text_content}</p>

                <div className="flex items-center space-x-3">
                  {item.audio_url ? (
                    <button
                      onClick={() => handlePlayPrerecorded(item)}
                      className="flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                    >
                      {isCurrentlyPlaying ? (
                        <>
                          <Pause className="w-4 h-4" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Play Audio</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePlayTTS(item)}
                      className="flex items-center space-x-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                    >
                      {isCurrentlyPlaying && isSynthesizing ? (
                        <>
                          <Pause className="w-4 h-4" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4" />
                          <span>Read Aloud</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedContent && selectedContent.audio_url && audioRef.current && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-2xl p-4 z-50">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1 min-w-0 mr-4">
                <h4 className="font-semibold text-slate-900 truncate">{selectedContent.title}</h4>
                <p className="text-sm text-slate-600">Now Playing</p>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={skipBackward}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <SkipBack className="w-5 h-5 text-slate-700" />
                </button>

                <button
                  onClick={togglePlayPause}
                  className="p-3 bg-amber-500 hover:bg-amber-600 rounded-full transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-white" />
                  ) : (
                    <Play className="w-6 h-6 text-white" />
                  )}
                </button>

                <button
                  onClick={skipForward}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <SkipForward className="w-5 h-5 text-slate-700" />
                </button>
              </div>

              <div className="text-sm text-slate-600 ml-4">
                {formatTime(currentTime)} /{' '}
                {selectedContent.duration_seconds
                  ? formatTime(selectedContent.duration_seconds)
                  : '0:00'}
              </div>
            </div>

            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full transition-all"
                style={{
                  width: selectedContent.duration_seconds
                    ? `${(currentTime / selectedContent.duration_seconds) * 100}%`
                    : '0%',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
