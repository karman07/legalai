import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, SkipBack, SkipForward, ArrowLeft, Loader2, Languages, BookOpen, StickyNote, Volume2, ChevronDown } from 'lucide-react';
import { audioLessonsAPI, AudioLesson } from '../services/api';
import NotesPanel from './NotesPanel';

type Language = 'english' | 'hindi';
type TranscriptLevel = 'standard' | 'easy';

export default function AudioPlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<AudioLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('english');
  const [transcriptLevel, setTranscriptLevel] = useState<TranscriptLevel>('standard');
  const [showNotes, setShowNotes] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (id) fetchLesson(id);
  }, [id]);

  useEffect(() => {
    if (!lesson) return;
    
    const audioFile = selectedLanguage === 'english' ? lesson.englishAudio : lesson.hindiAudio;
    if (!audioFile) return;

    // Reset state when switching audio
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setCurrentSectionIndex(0);

    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
    const audio = new Audio(`${baseUrl}${audioFile.url}`);
    audioRef.current = audio;

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // Update section index based on current time
      if (lesson.sections) {
        const index = lesson.sections.findIndex(s => audio.currentTime >= s.startTime && audio.currentTime <= s.endTime);
        if (index !== -1) {
          setCurrentSectionIndex(index);
        }
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
  }, [lesson, selectedLanguage]);

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
      const data = await audioLessonsAPI.getAudioLesson(lessonId);
      setLesson(data);
      if (data.englishAudio) setSelectedLanguage('english');
      else if (data.hindiAudio) setSelectedLanguage('hindi');
    } catch {
      setLesson(null);
    } finally {
      setLoading(false);
    }
  };

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

  const getTranscript = () => {
    if (!lesson) return '';
    if (selectedLanguage === 'english') {
      return transcriptLevel === 'easy' ? lesson.easyEnglishTranscription : lesson.englishTranscription;
    }
    return transcriptLevel === 'easy' ? lesson.easyHindiTranscription : lesson.hindiTranscription;
  };

  const getCurrentSection = () => {
    if (!lesson?.sections) return null;
    return lesson.sections[currentSectionIndex] || null;
  };

  const goToSection = (index: number) => {
    if (!lesson?.sections || !audioRef.current) return;
    const section = lesson.sections[index];
    if (section) {
      audioRef.current.currentTime = section.startTime;
      setCurrentSectionIndex(index);
    }
  };

  const getSectionText = (section: any) => {
    if (selectedLanguage === 'english') {
      return transcriptLevel === 'easy' ? section.easyEnglishText : section.englishText;
    }
    return transcriptLevel === 'easy' ? section.easyHindiText : section.hindiText;
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
  const transcript = getTranscript();
  const currentSection = getCurrentSection();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/audio')}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Lessons</span>
              </button>
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg transition-all shadow-md"
              >
                <StickyNote className="w-5 h-5" />
                <span>Notes</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - No Scroll */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Lesson Info & Controls */}
          <div className="bg-white border-b border-slate-200 px-6 py-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Volume2 className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-slate-900 line-clamp-1">{lesson.title}</h1>
                  {lesson.category && (
                    <span className="text-sm text-slate-600">{lesson.category}</span>
                  )}
                </div>
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  {lesson.englishAudio && (
                    <button
                      onClick={() => setSelectedLanguage('english')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                        selectedLanguage === 'english'
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Languages className="w-4 h-4 inline mr-1" />
                      English
                    </button>
                  )}
                  {lesson.hindiAudio && (
                    <button
                      onClick={() => setSelectedLanguage('hindi')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                        selectedLanguage === 'hindi'
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Languages className="w-4 h-4 inline mr-1" />
                      हिंदी
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTranscriptLevel('standard')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                      transcriptLevel === 'standard'
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 inline mr-1" />
                    Standard
                  </button>
                  <button
                    onClick={() => setTranscriptLevel('easy')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                      transcriptLevel === 'easy'
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 inline mr-1" />
                    Easy
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Current Section Display with Navigation */}
          {currentSection && lesson.sections && lesson.sections.length > 0 && (
            <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
              <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <button
                  onClick={() => goToSection(Math.max(0, currentSectionIndex - 1))}
                  disabled={currentSectionIndex === 0}
                  className="p-2 hover:bg-amber-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronDown className="w-5 h-5 text-amber-900 rotate-90" />
                </button>
                <div className="flex-1 text-center">
                  <h3 className="font-bold text-amber-900 text-sm">{currentSection.title}</h3>
                  <p className="text-xs text-slate-600">Section {currentSectionIndex + 1} of {lesson.sections.length}</p>
                </div>
                <button
                  onClick={() => goToSection(Math.min(lesson.sections!.length - 1, currentSectionIndex + 1))}
                  disabled={currentSectionIndex === lesson.sections.length - 1}
                  className="p-2 hover:bg-amber-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronDown className="w-5 h-5 text-amber-900 -rotate-90" />
                </button>
              </div>
            </div>
          )}

          {/* Transcript Section - Auto-highlight */}
          {transcript && (
            <div className="flex-1 overflow-auto bg-slate-50">
              <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {lesson.sections && lesson.sections.length > 0 ? (
                      lesson.sections.map((section, idx) => {
                        const sectionText = getSectionText(section);
                        const isActive = idx === currentSectionIndex;
                        return sectionText ? (
                          <div
                            key={idx}
                            className={`mb-4 p-3 rounded-lg transition-all ${
                              isActive ? 'bg-amber-100 border-l-4 border-amber-500' : 'hover:bg-slate-50'
                            }`}
                          >
                            <p className={isActive ? 'text-slate-900 font-medium' : 'text-slate-700'}>
                              {sectionText}
                            </p>
                          </div>
                        ) : null;
                      })
                    ) : (
                      transcript
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Audio Player */}
        <div className="bg-white border-t border-slate-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4">
            {/* Progress Bar with Time Labels */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-mono">
                <span className="text-amber-600 font-semibold">{formatTime(currentTime)}</span>
                <span className="text-slate-600">{formatTime(duration)}</span>
              </div>
              <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden cursor-pointer group" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const percentage = x / rect.width;
                if (audioRef.current) {
                  audioRef.current.currentTime = percentage * duration;
                }
              }}>
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-100"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handleSkip(-10)}
                className="p-2 hover:bg-slate-100 rounded-full transition-all"
                title="Rewind 10s"
              >
                <SkipBack className="w-5 h-5 text-slate-600" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-full transition-all shadow-lg"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-white" fill="white" />
                ) : (
                  <Play className="w-6 h-6 text-white" fill="white" />
                )}
              </button>

              <button
                onClick={() => handleSkip(10)}
                className="p-2 hover:bg-slate-100 rounded-full transition-all"
                title="Forward 10s"
              >
                <SkipForward className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showNotes && (
        <NotesPanel
          referenceType="audio"
          referenceId={lesson._id}
          currentContext={Math.floor(currentTime)}
          onClose={() => setShowNotes(false)}
        />
      )}
    </div>
  );
}
