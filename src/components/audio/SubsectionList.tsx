import { ArrowLeft, Languages, Layers } from 'lucide-react';
import { AudioLesson, AudioSectionDetail, AudioSubsectionSlim } from '../../services/api';

interface SubsectionListProps {
  lesson: AudioLesson;
  sectionHead: AudioSectionDetail;
  sectionIndex: number;
  subsections: AudioSubsectionSlim[];
  selectedLanguage: 'english' | 'hindi';
  onPlayCombinedAudio: () => void;
  onLanguageChange: (lang: 'english' | 'hindi') => void;
  onBack: () => void;
}

export default function SubsectionList({
  lesson,
  sectionHead,
  sectionIndex,
  subsections,
  selectedLanguage,
  onPlayCombinedAudio,
  onLanguageChange,
  onBack,
}: SubsectionListProps) {
  const hasEnglish = sectionHead.hasEnglishAudio || subsections.some(s => s.hasEnglishAudio);
  const hasHindi   = sectionHead.hasHindiAudio   || subsections.some(s => s.hasHindiAudio);
  const hasSectionAudio = sectionHead.hasEnglishAudio || sectionHead.hasHindiAudio ||
    sectionHead.hasEasyEnglishAudio || sectionHead.hasEasyHindiAudio;

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-gold-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-slate-600 hover:text-gold-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Sections</span>
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
          {lesson.headTitle && (
            <div className="text-xs font-semibold text-gold-600 uppercase tracking-wider mb-2">{lesson.headTitle}</div>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            Section {sectionIndex + 1}: {sectionHead.title}
          </h1>

          {(hasEnglish || hasHindi) && (
            <div className="flex gap-3 mb-6">
              {hasEnglish && (
                <button
                  onClick={() => onLanguageChange('english')}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all shadow-sm ${
                    selectedLanguage === 'english'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-brand-300'
                  }`}
                >
                  <Languages className="w-4 h-4 inline mr-2" />
                  English
                </button>
              )}
              {hasHindi && (
                <button
                  onClick={() => onLanguageChange('hindi')}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all shadow-sm ${
                    selectedLanguage === 'hindi'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-brand-300'
                  }`}
                >
                  <Languages className="w-4 h-4 inline mr-2" />
                  हिंदी
                </button>
              )}
            </div>
          )}

          {(hasSectionAudio || sectionHead.totalSubsections > 0) && (
            <div className="rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50 to-gold-50 p-4 sm:p-5">
              <button
                onClick={onPlayCombinedAudio}
                className="w-full px-6 py-4 bg-brand-900 hover:bg-brand-800 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Layers className="w-5 h-5" />
                Play All Audio
              </button>
              <p className="mt-3 text-sm text-slate-600 text-center">
                Continuous playback for this section and all available subsection audio.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
