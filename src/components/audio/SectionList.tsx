import { ArrowLeft, Search, ChevronRight, Headphones } from 'lucide-react';
import { AudioLesson } from '../../services/api';
import { useState } from 'react';

interface SectionListProps {
  lesson: AudioLesson;
  onSelectSection: (sectionIndex: number) => void;
  onBack: () => void;
}

export default function SectionList({ lesson, onSelectSection, onBack }: SectionListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSections = lesson.sections?.filter(section =>
    searchQuery === '' || section.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-slate-600 hover:text-amber-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Lessons</span>
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
          {lesson.headTitle && (
            <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">
              {lesson.headTitle}
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">{lesson.title}</h1>
          {lesson.description && (
            <p className="text-slate-600 mb-4">{lesson.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            {lesson.category && (
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                {lesson.category}
              </span>
            )}
            <span className="text-sm text-slate-600">
              {lesson.totalSections || lesson.sections?.length || 0} sections
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search sections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredSections.map((section, idx) => {
              const totalSubsections = section.totalSubsections || section.subsections?.length || 0;
              const hasAudio = !!(section.englishAudio || section.hindiAudio || section.easyEnglishAudio || section.easyHindiAudio);
              
              return (
                <button
                  key={idx}
                  onClick={() => onSelectSection(lesson.sections?.indexOf(section) || idx)}
                  className="w-full text-left p-5 rounded-xl border-2 border-slate-200 hover:border-amber-400 hover:bg-amber-50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 group-hover:from-amber-500 group-hover:to-orange-500 rounded-xl flex items-center justify-center font-bold text-xl text-amber-700 group-hover:text-white transition-all flex-shrink-0">
                      {lesson.sections?.indexOf(section) + 1 || idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-amber-700 transition-colors">{section.title}</h3>
                      <div className="flex items-center gap-4 text-sm">
                        {totalSubsections > 0 && (
                          <span className="text-slate-600">{totalSubsections} subsections</span>
                        )}
                        {hasAudio && (
                          <div className="flex items-center gap-1.5 text-green-600">
                            <Headphones className="w-4 h-4" />
                            <span className="font-medium">Audio</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-amber-600 flex-shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>

          {filteredSections.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No sections found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
