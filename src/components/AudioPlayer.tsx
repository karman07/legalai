import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, SkipBack, SkipForward, Loader2, ArrowLeft, StickyNote } from 'lucide-react';
import { audioLessonsAPI, AudioLesson } from '../services/api';
import SectionList from './audio/SectionList';
import SubsectionList from './audio/SubsectionList';
import NotesPanel from './NotesPanel';

type Language = 'english' | 'hindi';
type TextMode = 'government' | 'easy';
type ViewMode = 'sections' | 'subsections' | 'player';

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
  const [viewMode, setViewMode] = useState<ViewMode>('sections');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentSubsectionIndex, setCurrentSubsectionIndex] = useState(-1);
  const [showNotes, setShowNotes] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (id) fetchLesson(id);
  }, [id]);

  useEffect(() => {
    if (!lesson || viewMode !== 'player') return;
    
    let audioFile;
    const section = lesson.sections?.[currentSectionIndex];
    
    if (!section) return;

    if (currentSubsectionIndex >= 0 && section.subsections?.[currentSubsectionIndex]) {
      const subsection = section.subsections[currentSubsectionIndex];
      audioFile = textMode === 'easy'
        ? (selectedLanguage === 'english' ? subsection.easyEnglishAudio : subsection.easyHindiAudio)
        : (selectedLanguage === 'english' ? subsection.englishAudio : subsection.hindiAudio);
    } else {
      audioFile = textMode === 'easy'
        ? (selectedLanguage === 'english' ? section.easyEnglishAudio : section.easyHindiAudio)
        : (selectedLanguage === 'english' ? section.englishAudio : section.hindiAudio);
    }
    
    if (audioFile?.url) {
      const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
      setAudioUrl(`${baseUrl}${audioFile.url}`);
      setIsPlaying(false);
    }
  }, [lesson, selectedLanguage, textMode, viewMode, currentSectionIndex, currentSubsectionIndex]);

  const fetchLesson = async (lessonId: string) => {
    try {
      setLoading(true);
      const data = await audioLessonsAPI.getAudioLesson(lessonId);
      setLesson(data);
      if (data.sections?.[0]?.englishAudio) setSelectedLanguage('english');
      else if (data.sections?.[0]?.hindiAudio) setSelectedLanguage('hindi');
    } catch {
      setLesson(null);
    } finally {
      setLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSkip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      audioRef.current.currentTime = percentage * duration;
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePrevSection = () => {
    if (currentSubsectionIndex > 0) {
      setCurrentSubsectionIndex(currentSubsectionIndex - 1);
    } else if (currentSectionIndex > 0) {
      const prevSection = lesson?.sections?.[currentSectionIndex - 1];
      setCurrentSectionIndex(currentSectionIndex - 1);
      setCurrentSubsectionIndex(prevSection?.subsections?.length ? prevSection.subsections.length - 1 : -1);
    }
  };

  const handleNextSection = () => {
    if (!lesson?.sections) return;
    const currentSection = lesson.sections[currentSectionIndex];
    
    if (currentSection?.subsections && currentSubsectionIndex < currentSection.subsections.length - 1) {
      setCurrentSubsectionIndex(currentSubsectionIndex + 1);
    } else if (currentSectionIndex < lesson.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentSubsectionIndex(-1);
    }
  };

  const startPlayer = (sectionIndex: number, subsectionIndex: number = -1) => {
    setCurrentSectionIndex(sectionIndex);
    setCurrentSubsectionIndex(subsectionIndex);
    setViewMode('player');
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

  if (viewMode === 'sections') {
    return (
      <SectionList
        lesson={lesson}
        onSelectSection={(idx) => {
          setCurrentSectionIndex(idx);
          setViewMode('subsections');
        }}
        onBack={() => navigate('/audio')}
      />
    );
  }

  if (viewMode === 'subsections') {
    const currentSection = lesson.sections?.[currentSectionIndex];
    if (!currentSection) return null;

    return (
      <SubsectionList
        lesson={lesson}
        section={currentSection}
        sectionIndex={currentSectionIndex}
        selectedLanguage={selectedLanguage}
        onSelectSubsection={(subIdx) => startPlayer(currentSectionIndex, subIdx)}
        onPlaySection={() => startPlayer(currentSectionIndex, -1)}
        onLanguageChange={setSelectedLanguage}
        onBack={() => setViewMode('sections')}
      />
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const currentSection = lesson.sections?.[currentSectionIndex];

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={handleTimeUpdate}
      />

      <div className="bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button onClick={() => setViewMode('subsections')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
              {currentSubsectionIndex >= 0
                ? `${currentSection?.title} › ${currentSection?.subsections?.[currentSubsectionIndex]?.title}`
                : currentSection?.title}
            </h1>
            <p className="text-xs text-slate-500">
              {currentSubsectionIndex >= 0
                ? `Subsection ${currentSectionIndex + 1}.${currentSubsectionIndex + 1}`
                : `Section ${currentSectionIndex + 1}`}
            </p>
          </div>
          <button onClick={() => setShowNotes(!showNotes)} className="flex items-center gap-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition-all">
            <StickyNote className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Notes</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {currentSection && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">
                  {currentSubsectionIndex >= 0 
                    ? currentSection.subsections?.[currentSubsectionIndex]?.title
                    : currentSection.title}
                </h2>
                <div className="flex gap-2 mb-6">
                  <button onClick={() => setTextMode('government')} className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${textMode === 'government' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                    Standard
                  </button>
                  <button onClick={() => setTextMode('easy')} className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${textMode === 'easy' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                    Easy
                  </button>
                </div>
                <div className="p-6 bg-slate-50 rounded-xl">
                  <p className="text-base leading-relaxed text-slate-900 whitespace-pre-wrap">
                    {(() => {
                      const content = currentSubsectionIndex >= 0 
                        ? currentSection.subsections?.[currentSubsectionIndex]
                        : currentSection;
                      
                      if (textMode === 'government') {
                        return (selectedLanguage === 'english' ? content?.englishText : content?.hindiText) || 'No transcription available';
                      } else {
                        return (selectedLanguage === 'english' ? content?.easyEnglishText : content?.easyHindiText) || 'No easy transcription available';
                      }
                    })()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border-t border-slate-200 shadow-2xl flex-shrink-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className="mb-5">
            <div className="flex items-center justify-between text-sm font-bold mb-3">
              <span className="text-amber-600">{formatTime(currentTime)}</span>
              <span className="text-slate-500">{formatTime(duration)}</span>
            </div>
            <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden cursor-pointer group" onClick={handleSeek}>
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all" style={{ width: `${progress}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            <button onClick={() => handleSkip(-10)} className="p-3 hover:bg-slate-100 rounded-full transition-all">
              <SkipBack className="w-5 h-5 text-slate-700" />
            </button>
            <button onClick={handlePrevSection} disabled={currentSectionIndex === 0 && currentSubsectionIndex <= 0} className="p-3 hover:bg-slate-100 rounded-full transition-all disabled:opacity-30">
              <SkipBack className="w-4 h-4 text-slate-700" />
            </button>
            <button onClick={togglePlayPause} className="p-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-full transition-all shadow-xl">
              {isPlaying ? <Pause className="w-8 h-8 text-white" fill="white" /> : <Play className="w-8 h-8 text-white" fill="white" />}
            </button>
            <button onClick={handleNextSection} className="p-3 hover:bg-slate-100 rounded-full transition-all">
              <SkipForward className="w-4 h-4 text-slate-700" />
            </button>
            <button onClick={() => handleSkip(10)} className="p-3 hover:bg-slate-100 rounded-full transition-all">
              <SkipForward className="w-5 h-5 text-slate-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Notes Panel Overlay */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${showNotes ? 'visible' : 'invisible'}`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 md:hidden ${
            showNotes ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setShowNotes(false)}
        />
        
        {/* Notes Panel */}
        <div className={`absolute right-0 top-0 bottom-0 w-full md:w-96 transform transition-transform duration-300 ease-out ${
          showNotes ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <NotesPanel
            referenceType="audio"
            referenceId={lesson._id}
            currentContext={Math.floor(currentTime)}
            onClose={() => setShowNotes(false)}
          />
        </div>
      </div>
    </div>
  );
}
