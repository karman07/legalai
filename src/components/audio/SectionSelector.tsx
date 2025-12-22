import { Play, ArrowLeft, Volume2, Languages, List, Search, BookOpen, Headphones } from 'lucide-react';
import { AudioLesson } from '../../services/api';

interface SectionSelectorProps {
  lesson: AudioLesson;
  selectedLanguage: 'english' | 'hindi';
  sectionSearchQuery: string;
  onLanguageChange: (lang: 'english' | 'hindi') => void;
  onSearchChange: (query: string) => void;
  onStartLesson: (sectionIndex: number, subsectionIndex?: number) => void;
  onBack: () => void;
}

export default function SectionSelector({
  lesson,
  selectedLanguage,
  sectionSearchQuery,
  onLanguageChange,
  onSearchChange,
  onStartLesson,
  onBack,
}: SectionSelectorProps) {
  const totalAudioCount = lesson.sections?.reduce((sum, section) => {
    let count = 0;
    if (section.englishAudio || section.hindiAudio || section.easyEnglishAudio || section.easyHindiAudio) count++;
    count += section.subsections?.reduce((subSum, sub) => {
      return subSum + (sub.englishAudio || sub.hindiAudio || sub.easyEnglishAudio || sub.easyHindiAudio ? 1 : 0);
    }, 0) || 0;
    return sum + count;
  }, 0) || 0;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="mb-4 flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-5 h-5" />
          Back to Lessons
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Volume2 className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              {lesson.headTitle && (
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  {lesson.headTitle}
                </div>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{lesson.title}</h1>
              {lesson.description && <p className="text-slate-600 mb-4">{lesson.description}</p>}
              <div className="flex flex-wrap items-center gap-3">
                {lesson.category && (
                  <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                    {lesson.category}
                  </span>
                )}
                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                  <Headphones className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold">{totalAudioCount} audio lessons</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            {lesson.sections?.some(s => s.englishAudio || s.subsections?.some(sub => sub.englishAudio)) && (
              <button
                onClick={() => onLanguageChange('english')}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                  selectedLanguage === 'english'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Languages className="w-4 h-4 inline mr-2" />
                English
              </button>
            )}
            {lesson.sections?.some(s => s.hindiAudio || s.subsections?.some(sub => sub.hindiAudio)) && (
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

          <button
            onClick={() => onStartLesson(0)}
            className="w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" fill="white" />
            Start Learning
          </button>
        </div>

        {lesson.sections && lesson.sections.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <List className="w-5 h-5 text-amber-600" />
                Content Structure
              </h2>
              <span className="text-sm text-slate-600">
                {lesson.totalSections || lesson.sections.length} sections
              </span>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search sections and subsections..."
                value={sectionSearchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>

            <div className="space-y-2">
              {lesson.sections
                .filter(
                  (section) =>
                    sectionSearchQuery === '' ||
                    section.title.toLowerCase().includes(sectionSearchQuery.toLowerCase()) ||
                    section.subsections?.some((sub) =>
                      sub.title.toLowerCase().includes(sectionSearchQuery.toLowerCase())
                    )
                )
                .map((section, idx) => {
                  const totalSubsections = section.totalSubsections || section.subsections?.length || 0;
                  const hasAudio = !!(section.englishAudio || section.hindiAudio || section.easyEnglishAudio || section.easyHindiAudio);
                  
                  return (
                    <div
                      key={idx}
                      className="border-2 border-slate-200 rounded-xl overflow-hidden hover:border-blue-300 transition-all"
                    >
                      <button
                        onClick={() => onStartLesson(idx)}
                        className="w-full text-left p-4 hover:bg-blue-50 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 group-hover:from-blue-500 group-hover:to-blue-600 rounded-lg flex items-center justify-center font-bold text-blue-700 group-hover:text-white transition-all flex-shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 mb-1">{section.title}</h3>
                            <div className="flex items-center gap-3 text-xs">
                              {totalSubsections > 0 && (
                                <div className="flex items-center gap-1 text-purple-600">
                                  <BookOpen className="w-3 h-3" />
                                  <span>{totalSubsections} subsections</span>
                                </div>
                              )}
                              {hasAudio && (
                                <div className="flex items-center gap-1 text-green-600">
                                  <Headphones className="w-3 h-3" />
                                  <span>Audio</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Play className="w-5 h-5 text-slate-400 group-hover:text-blue-600 flex-shrink-0" />
                        </div>
                      </button>

                      {section.subsections && section.subsections.length > 0 && (
                        <div className="bg-slate-50 border-t border-slate-200">
                          {section.subsections
                            .filter(
                              (sub) =>
                                sectionSearchQuery === '' ||
                                sub.title.toLowerCase().includes(sectionSearchQuery.toLowerCase())
                            )
                            .map((subsection, subIdx) => {
                              const hasSubAudio = !!(subsection.englishAudio || subsection.hindiAudio || subsection.easyEnglishAudio || subsection.easyHindiAudio);
                              
                              return (
                                <button
                                  key={subIdx}
                                  onClick={() => onStartLesson(idx, subIdx)}
                                  className="w-full text-left p-3 pl-6 hover:bg-purple-50 transition-all group border-b border-slate-100 last:border-b-0"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white group-hover:bg-purple-100 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600 group-hover:text-purple-700 transition-all flex-shrink-0 border border-slate-200">
                                      {idx + 1}.{subIdx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-sm font-medium text-slate-800 mb-0.5">{subsection.title}</h4>
                                      {hasSubAudio && (
                                        <div className="flex items-center gap-1 text-xs text-green-600">
                                          <Headphones className="w-3 h-3" />
                                          <span>Audio available</span>
                                        </div>
                                      )}
                                    </div>
                                    <Play className="w-4 h-4 text-slate-400 group-hover:text-purple-600 flex-shrink-0" />
                                  </div>
                                </button>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
