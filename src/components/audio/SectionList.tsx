import { ArrowLeft, Search, ChevronRight, Headphones, Grid3X3, List, Play } from 'lucide-react';
import { AudioLesson } from '../../services/api';
import { useState } from 'react';

type ViewMode = 'grid' | 'list';

interface SectionListProps {
  lesson: AudioLesson;
  onSelectSection: (sectionIndex: number) => void;
  onBack: () => void;
}

export default function SectionList({ lesson, onSelectSection, onBack }: SectionListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const filteredSections = lesson.sections?.filter(section =>
    searchQuery === '' || section.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const SectionCard = ({ section, idx, isGrid }: { section: any, idx: number, isGrid: boolean }) => {
    const totalSubsections = section.totalSubsections || section.subsections?.length || 0;
    const hasAudio = !!(section.englishAudio || section.hindiAudio || section.easyEnglishAudio || section.easyHindiAudio);
    const sectionNumber = lesson.sections?.indexOf(section) + 1 || idx + 1;
    const description = section.englishText || '';
    const [showFullDescription, setShowFullDescription] = useState(false);
    
    const truncateText = (text: string, maxLength: number) => {
      if (!text) return '';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };
    
    if (isGrid) {
      return (
        <div className="group relative bg-white border-2 border-slate-200 rounded-2xl overflow-hidden hover:border-amber-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/0 to-orange-50/0 group-hover:from-amber-50/50 group-hover:to-orange-50/30 transition-all duration-300" />
          <div className="relative p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 group-hover:from-amber-500 group-hover:to-orange-500 rounded-xl flex items-center justify-center font-bold text-xl text-amber-700 group-hover:text-white transition-all flex-shrink-0">
                {sectionNumber}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 group-hover:text-amber-700 transition-colors text-left">
                  {section.title}
                </h3>
              </div>
            </div>
            
            {description && (
              <div className="mb-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  {showFullDescription ? description : truncateText(description, 120)}
                </p>
                {description.length > 120 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowFullDescription(!showFullDescription);
                    }}
                    className="text-xs text-amber-600 hover:text-amber-700 font-medium mt-1"
                  >
                    {showFullDescription ? 'Read less' : 'Read more'}
                  </button>
                )}
              </div>
            )}
            
            <div className="flex items-center gap-3 mb-4">
              {totalSubsections > 0 && (
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1.5 rounded-lg border border-amber-200">
                  <List className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-medium text-amber-700">{totalSubsections} parts</span>
                </div>
              )}
              {hasAudio && (
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1.5 rounded-lg border border-amber-200">
                  <Headphones className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-medium text-amber-700">Audio</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-center pt-4 border-t border-slate-100">
              <button
                onClick={() => onSelectSection(lesson.sections?.indexOf(section) || idx)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium text-xs hover:from-amber-600 hover:to-orange-600 transition-all shadow-md transform hover:scale-105"
              >
                <Play className="w-3 h-3" fill="white" />
                <span>Explore</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <button
        onClick={() => onSelectSection(lesson.sections?.indexOf(section) || idx)}
        className="w-full text-left p-5 rounded-xl border-2 border-slate-200 hover:border-amber-400 hover:bg-amber-50 transition-all group"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 group-hover:from-amber-500 group-hover:to-orange-500 rounded-xl flex items-center justify-center font-bold text-xl text-amber-700 group-hover:text-white transition-all flex-shrink-0">
            {sectionNumber}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-amber-700 transition-colors">{section.title}</h3>
            {description && (
              <p className="text-sm text-slate-600 mb-3 leading-relaxed line-clamp-2">
                {truncateText(description, 150)}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm">
              {totalSubsections > 0 && (
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1.5 rounded-lg border border-amber-200">
                  <List className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-medium text-amber-700">{totalSubsections} subsections</span>
                </div>
              )}
              {hasAudio && (
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1.5 rounded-lg border border-amber-200">
                  <Headphones className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-medium text-amber-700">Audio</span>
                </div>
              )}
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-amber-600 flex-shrink-0" />
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
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
              <span className="px-3 py-1.5 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 rounded-lg text-sm font-medium border border-amber-200">
                {lesson.category}
              </span>
            )}
            <span className="px-3 py-1.5 bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 rounded-lg text-sm font-medium border border-slate-200">
              {lesson.totalSections || lesson.sections?.length || 0} sections
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search sections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-amber-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-amber-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-3'
          }>
            {filteredSections.map((section, idx) => (
              <SectionCard 
                key={idx} 
                section={section} 
                idx={idx} 
                isGrid={viewMode === 'grid'} 
              />
            ))}
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
