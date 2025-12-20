import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, SkipBack, SkipForward, ArrowLeft, Loader2, Languages, StickyNote, Volume2, ChevronLeft, ChevronRight, List, ChevronUp, ChevronDown } from 'lucide-react';
import { audioLessonsAPI, AudioLesson } from '../services/api';
import NotesPanel from './NotesPanel';

type Language = 'english' | 'hindi';
type TextMode = 'government' | 'easy';

export default function AudioPlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<AudioLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('english');
  const [textMode, setTextMode] = useState<TextMode>('government');
  const [showNotes, setShowNotes] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(-1);
  const [showSectionSelection, setShowSectionSelection] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (id) fetchLesson(id);
  }, [id]);

  useEffect(() => {
    if (!lesson || showSectionSelection) return;
    
    let audioFile;
    if (currentSectionIndex === -1) {
      audioFile = selectedLanguage === 'english' ? lesson.englishAudio : lesson.hindiAudio;
    } else if (currentSectionIndex >= 0 && lesson.sections?.[currentSectionIndex]) {
      const section = lesson.sections[currentSectionIndex];
      audioFile = selectedLanguage === 'english' ? section.englishAudio : section.hindiAudio;
    }
    
    if (!audioFile) return;

    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);

    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
    const audio = new Audio(`${baseUrl}${audioFile.url}`);
    audioRef.current = audio;

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
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
  }, [lesson, selectedLanguage, showSectionSelection, currentSectionIndex]);

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

  // const goToSection = (index: number) => {
  //   if (!lesson?.sections || index < 0) return;
  //   setCurrentSectionIndex(index);
  //   setIsPlaying(true);
  // };

  const handlePrevSection = () => {
    const newIndex = Math.max(-1, currentSectionIndex - 1);
    setCurrentSectionIndex(newIndex);
    setIsPlaying(true);
  };

  const handleNextSection = () => {
    if (!lesson?.sections) return;
    if (currentSectionIndex === -1) {
      setCurrentSectionIndex(0);
    } else {
      const newIndex = Math.min(lesson.sections.length - 1, currentSectionIndex + 1);
      setCurrentSectionIndex(newIndex);
    }
    setIsPlaying(true);
  };

  const startLesson = (sectionIndex: number = -1) => {
    setCurrentSectionIndex(sectionIndex);
    setShowSectionSelection(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-amber-600 animate-spin" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Lesson not found</h2>
          <button onClick={() => navigate('/audio')} className="text-amber-600 hover:text-amber-700">
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (showSectionSelection) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate('/audio')} className="mb-4 flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-5 h-5" />
            Back to Lessons
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Volume2 className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{lesson.title}</h1>
                {lesson.description && <p className="text-slate-600 mb-4">{lesson.description}</p>}
                {lesson.category && (
                  <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                    {lesson.category}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              {lesson.englishAudio && (
                <button onClick={() => setSelectedLanguage('english')} className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${selectedLanguage === 'english' ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                  <Languages className="w-4 h-4 inline mr-2" />English
                </button>
              )}
              {lesson.hindiAudio && (
                <button onClick={() => setSelectedLanguage('hindi')} className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${selectedLanguage === 'hindi' ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                  <Languages className="w-4 h-4 inline mr-2" />हिंदी
                </button>
              )}
            </div>

            <button onClick={() => startLesson(-1)} className="w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
              <Play className="w-5 h-5" fill="white" />
              Start Full Lesson
            </button>
          </div>

          {lesson.sections && lesson.sections.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <List className="w-5 h-5 text-amber-600" />
                Sections ({lesson.sections.length + 1})
              </h2>
              <div className="space-y-3">
                <button onClick={() => startLesson(-1)} className="w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-amber-400 hover:bg-amber-50 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 group-hover:bg-amber-500 rounded-lg flex items-center justify-center font-bold text-slate-700 group-hover:text-white transition-all">
                      1
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">Main Content</h3>
                      <p className="text-xs text-slate-500">{lesson.title}</p>
                    </div>
                    <Play className="w-5 h-5 text-slate-400 group-hover:text-amber-600" />
                  </div>
                </button>
                {lesson.sections.map((section, idx) => (
                  <button key={idx} onClick={() => startLesson(idx)} className="w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-amber-400 hover:bg-amber-50 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 group-hover:bg-amber-500 rounded-lg flex items-center justify-center font-bold text-slate-700 group-hover:text-white transition-all">
                        {idx + 2}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{section.title}</h3>
                        <p className="text-xs text-slate-500">
                          {formatTime(section.startTime)} - {formatTime(section.endTime)}
                        </p>
                      </div>
                      <Play className="w-5 h-5 text-slate-400 group-hover:text-amber-600" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const currentSection = lesson.sections?.[currentSectionIndex];

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg flex-shrink-0">
        <div className="px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <button onClick={() => setShowSectionSelection(true)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-sm sm:text-lg font-bold text-white truncate">{lesson.title}</h1>
                {lesson.category && <span className="text-xs text-white/80 hidden sm:inline">{lesson.category}</span>}
              </div>
            </div>
          </div>
          <button onClick={() => setShowNotes(!showNotes)} className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all">
            <StickyNote className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Notes</span>
          </button>
        </div>
      </div>

      {lesson.sections && lesson.sections.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-3 sm:px-6 py-2 sm:py-3 flex-shrink-0">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <button onClick={handlePrevSection} disabled={currentSectionIndex === -1} className="p-2 hover:bg-amber-100 active:bg-amber-200 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft className="w-5 h-5 text-amber-900" />
            </button>
            <div className="flex-1 text-center">
              <h3 className="font-bold text-amber-900 text-xs sm:text-sm truncate">{currentSectionIndex === -1 ? 'Main Content' : currentSection?.title}</h3>
              <p className="text-xs text-slate-600">Section {currentSectionIndex + 2} of {lesson.sections.length + 1}</p>
            </div>
            <button onClick={handleNextSection} disabled={currentSectionIndex === (lesson.sections?.length || 0) - 1} className="p-2 hover:bg-amber-100 active:bg-amber-200 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRight className="w-5 h-5 text-amber-900" />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto bg-slate-50 p-3 sm:p-6">
        <div className="max-w-6xl mx-auto">
          {currentSectionIndex === -1 ? (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 sm:p-6">
                <div className="flex gap-2 mb-3">
                  <button onClick={() => setTextMode('government')} className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${textMode === 'government' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                    Government Text
                  </button>
                  <button onClick={() => setTextMode('easy')} className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${textMode === 'easy' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                    Easy Text
                  </button>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm sm:text-base leading-relaxed text-slate-900 whitespace-pre-wrap">
                    {textMode === 'government'
                      ? (selectedLanguage === 'english' ? lesson.englishTranscription : lesson.hindiTranscription) || 'No transcription'
                      : (selectedLanguage === 'english' ? lesson.easyEnglishTranscription : lesson.easyHindiTranscription) || 'No transcription'}
                  </p>
                </div>
              </div>
            </div>
          ) : currentSection ? (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-4 sm:px-6 py-3">
                <h3 className="text-white font-bold text-sm sm:text-lg">Section {currentSectionIndex + 1}</h3>
              </div>
              <div className="p-4 sm:p-6">
                <h4 className="font-bold text-lg sm:text-xl text-slate-900 mb-4">{currentSection.title}</h4>
                <div className="flex gap-2 mb-3">
                  <button onClick={() => setTextMode('government')} className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${textMode === 'government' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                    Government Text
                  </button>
                  <button onClick={() => setTextMode('easy')} className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${textMode === 'easy' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                    Easy Text
                  </button>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm sm:text-base leading-relaxed text-slate-900 whitespace-pre-wrap">
                    {textMode === 'government'
                      ? (selectedLanguage === 'english' ? currentSection.englishText : currentSection.hindiText) || 'No transcription'
                      : (selectedLanguage === 'english' ? currentSection.easyEnglishText : currentSection.easyHindiText) || 'No transcription'}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="bg-white border-t-2 border-slate-200 shadow-2xl flex-shrink-0">
        <div className="px-3 sm:px-6 py-3 sm:py-4">
          <div className="mb-3 sm:mb-4">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-amber-600">{formatTime(currentTime)}</span>
              <span className="text-slate-500">{formatTime(duration)}</span>
            </div>
            <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden cursor-pointer group" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percentage = x / rect.width;
              if (audioRef.current) audioRef.current.currentTime = percentage * duration;
            }}>
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all" style={{ width: `${progress}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <button onClick={() => handleSkip(-10)} className="p-2 sm:p-3 hover:bg-slate-100 rounded-full transition-all">
              <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
            </button>
            <button onClick={handlePrevSection} disabled={currentSectionIndex === -1} className="p-2 sm:p-3 hover:bg-slate-100 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
            </button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="p-4 sm:p-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-full transition-all shadow-xl">
              {isPlaying ? <Pause className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="white" /> : <Play className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="white" />}
            </button>
            <button onClick={handleNextSection} disabled={currentSectionIndex === (lesson.sections?.length || 0) - 1} className="p-2 sm:p-3 hover:bg-slate-100 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
            </button>
            <button onClick={() => handleSkip(10)} className="p-2 sm:p-3 hover:bg-slate-100 rounded-full transition-all">
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
            </button>
          </div>
        </div>
      </div>

      {showNotes && (
        <div className="fixed inset-0 z-[100] md:absolute md:right-0 md:top-0 md:bottom-0 md:w-96">
          <NotesPanel
            referenceType="audio"
            referenceId={lesson._id}
            currentContext={Math.floor(currentTime)}
            onClose={() => setShowNotes(false)}
          />
        </div>
      )}
    </div>
  );
}
