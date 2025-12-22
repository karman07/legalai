import { ArrowLeft, Play, Headphones, Languages } from 'lucide-react';
import { AudioLesson, AudioSection } from '../../services/api';

interface SubsectionListProps {
  lesson: AudioLesson;
  section: AudioSection;
  sectionIndex: number;
  selectedLanguage: 'english' | 'hindi';
  onSelectSubsection: (subsectionIndex: number) => void;
  onPlaySection: () => void;
  onLanguageChange: (lang: 'english' | 'hindi') => void;
  onBack: () => void;
}

export default function SubsectionList({
  lesson,
  section,
  sectionIndex,
  selectedLanguage,
  onSelectSubsection,
  onPlaySection,
  onLanguageChange,
  onBack,
}: SubsectionListProps) {
  const hasEnglish = !!(section.englishAudio || section.subsections?.some(s => s.englishAudio));
  const hasHindi = !!(section.hindiAudio || section.subsections?.some(s => s.hindiAudio));
  const hasSectionAudio = !!(section.englishAudio || section.hindiAudio || section.easyEnglishAudio || section.easyHindiAudio);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-slate-600 hover:text-amber-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Sections</span>
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
          {lesson.headTitle && (
            <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">
              {lesson.headTitle}
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            Section {sectionIndex + 1}: {section.title}
          </h1>

          {(hasEnglish || hasHindi) && (
            <div className="flex gap-3 mb-6">
              {hasEnglish && (
                <button
                  onClick={() => onLanguageChange('english')}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                    selectedLanguage === 'english'
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Languages className="w-4 h-4 inline mr-2" />
                  English
                </button>
              )}
              {hasHindi && (
                <button
                  onClick={() => onLanguageChange('hindi')}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                    selectedLanguage === 'hindi'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Languages className="w-4 h-4 inline mr-2" />
                  हिंदी
                </button>
              )}
            </div>
          )}

          {hasSectionAudio && (
            <button
              onClick={onPlaySection}
              className="w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" fill="white" />
              Play Section Audio
            </button>
          )}
        </div>

        {section.subsections && section.subsections.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Subsections ({section.subsections.length})
            </h2>

            <div className="space-y-3">
              {section.subsections.map((subsection, subIdx) => {
                const hasAudio = !!(subsection.englishAudio || subsection.hindiAudio || subsection.easyEnglishAudio || subsection.easyHindiAudio);
                
                return (
                  <button
                    key={subIdx}
                    onClick={() => onSelectSubsection(subIdx)}
                    className="w-full text-left p-5 rounded-xl border-2 border-slate-200 hover:border-amber-400 hover:bg-amber-50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 group-hover:from-amber-500 group-hover:to-orange-500 rounded-xl flex items-center justify-center font-bold text-amber-700 group-hover:text-white transition-all flex-shrink-0">
                        {sectionIndex + 1}.{subIdx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-slate-900 mb-1 group-hover:text-amber-700 transition-colors">{subsection.title}</h3>
                        {hasAudio && (
                          <div className="flex items-center gap-1.5 text-sm text-green-600">
                            <Headphones className="w-4 h-4" />
                            <span className="font-medium">Audio available</span>
                          </div>
                        )}
                      </div>
                      <Play className="w-6 h-6 text-slate-400 group-hover:text-amber-600 flex-shrink-0" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
