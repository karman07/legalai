import { ArrowLeft, Search, ChevronRight, Headphones, Play, Layers, Loader2, CheckSquare, Square, X, Check } from 'lucide-react';
import { AudioLesson, AudioSectionSlim } from '../../services/api';
import { useState } from 'react';

interface SectionListProps {
  lesson: AudioLesson | null;
  sections: AudioSectionSlim[];
  sectionsPage: number;
  sectionsTotalPages: number;
  sectionsLoading: boolean;
  selectedLanguage?: 'english' | 'hindi';
  onLoadMoreSections: () => void;
  onSelectSection: (sectionIndex: number) => void;
  onPlaySection?: (sectionIndex: number) => void;
  onPlayAll?: () => void;
  onPlaySelected?: (indices: number[]) => void;
  onLanguageChange?: (lang: 'english' | 'hindi') => void;
  onBack: () => void;
}

export default function SectionList({
  lesson, sections, sectionsPage, sectionsTotalPages, sectionsLoading,
  selectedLanguage = 'english', onLoadMoreSections, onSelectSection,
  onPlaySection, onPlayAll, onPlaySelected, onLanguageChange, onBack,
}: SectionListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedSections, setSelectedSections] = useState<Set<number>>(new Set());

  const filteredSections = sections.filter(section =>
    searchQuery === '' || section.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSections = lesson?.totalSections ?? sections.length;
  const hasAnyAudio = sections.some(s => s.hasEnglishAudio || s.hasHindiAudio || s.hasEasyEnglishAudio || s.hasEasyHindiAudio);
  const hasEnglish = sections.some(s => s.hasEnglishAudio || s.hasEasyEnglishAudio);
  const hasHindi = sections.some(s => s.hasHindiAudio || s.hasEasyHindiAudio);

  const sectionHasAudio = (s: AudioSectionSlim) =>
    selectedLanguage === 'english'
      ? s.hasEnglishAudio || s.hasEasyEnglishAudio
      : s.hasHindiAudio || s.hasEasyHindiAudio;

  const toggleSection = (idx: number) => {
    setSelectedSections(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const playableSections = filteredSections.filter(sectionHasAudio);

  const selectAll = () => {
    setSelectedSections(new Set(filteredSections.map(s => s._index)));
  };

  const exitSelection = () => {
    setSelectionMode(false);
    setSelectedSections(new Set());
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Sticky back header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-gold-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Lessons</span>
          </button>

          {onPlaySelected && (
            selectionMode ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={selectAll}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <Square className="w-3.5 h-3.5" />
                  All ({playableSections.length})
                </button>
                <button
                  onClick={exitSelection}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                  Done
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSelectionMode(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all border border-slate-200"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Select
              </button>
            )
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Lesson info card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-7">
          {lesson?.headTitle && (
            <p className="text-[11px] font-semibold text-gold-600 uppercase tracking-widest mb-2">
              {lesson.headTitle}
            </p>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-3">
            {lesson?.title}
          </h1>
          {lesson?.description && (
            <p className="text-sm text-slate-500 leading-relaxed mb-4">{lesson.description}</p>
          )}
          <div className="flex flex-wrap gap-2 mb-5">
            {lesson?.category && (
              <span className="px-3 py-1 bg-gold-50 text-gold-700 rounded-full text-xs font-semibold border border-gold-200">
                {lesson.category}
              </span>
            )}
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
              {totalSections} sections
            </span>
            {hasAnyAudio && (
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold inline-flex items-center gap-1">
                <Headphones className="w-3 h-3" />
                Audio available
              </span>
            )}
          </div>

          {/* Language toggle */}
          {(hasEnglish && hasHindi) && onLanguageChange && (
            <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl mb-5">
              <button
                onClick={() => onLanguageChange('english')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedLanguage === 'english'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                English
              </button>
              <button
                onClick={() => onLanguageChange('hindi')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedLanguage === 'hindi'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                हिंदी
              </button>
            </div>
          )}

          {!selectionMode && onPlayAll && (
            <button
              onClick={onPlayAll}
              className="w-full flex items-center gap-3 px-5 py-3.5 bg-brand-900 hover:bg-brand-800 active:scale-[0.99] text-white rounded-xl font-semibold text-sm transition-all"
            >
              <div className="w-7 h-7 bg-white/15 rounded-full flex items-center justify-center flex-shrink-0">
                <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
              </div>
              <span>Play All Sections</span>
              <Layers className="w-4 h-4 ml-auto opacity-50" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search sections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent shadow-sm placeholder:text-slate-400"
          />
        </div>

        {/* Section cards */}
        <div className="space-y-2">
          {filteredSections.map((section) => {
            const hasAudio = sectionHasAudio(section);
            const partCount = section.totalSubsections;
            const isSelected = selectedSections.has(section._index);

            return (
              <div
                key={section._index}
                className={`bg-white rounded-xl border transition-all group ${
                  isSelected
                    ? 'border-amber-300 ring-2 ring-amber-200 shadow-sm'
                    : 'border-slate-100 hover:border-gold-200 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3 px-4 py-4">
                  {/* Selection checkbox */}
                  {selectionMode && (
                    <button
                      onClick={() => toggleSection(section._index)}
                      className="flex-shrink-0 mt-0.5"
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-amber-500 border-amber-500'
                          : 'bg-white border-slate-300 hover:border-amber-400'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                      </div>
                    </button>
                  )}

                  {/* Clickable content area */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => {
                      selectionMode ? toggleSection(section._index) : onSelectSection(section._index);
                    }}
                  >
                    <span className="inline-block text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded mb-2 tracking-wide">
                      Section {section._index + 1}
                    </span>
                    <p className={`font-semibold text-[15px] leading-snug transition-colors ${
                      isSelected ? 'text-amber-700' : 'text-slate-800 group-hover:text-gold-700'
                    }`}>
                      {section.title}
                    </p>
                    {section.englishTextPreview && (
                      <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {section.englishTextPreview}
                      </p>
                    )}
                    {(partCount > 0 || hasAudio) && (
                      <div className="flex items-center gap-2 mt-3">
                        {partCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                            {partCount} {partCount === 1 ? 'part' : 'parts'}
                          </span>
                        )}
                        {hasAudio && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                            <Headphones className="w-3 h-3" />
                            Audio
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right actions — hidden in selection mode */}
                  {!selectionMode && (
                    <div className="flex items-center gap-1.5 pt-1 flex-shrink-0">
                      {onPlaySection && hasAudio && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPlaySection(section._index);
                          }}
                          className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-100 transition-colors"
                          title="Play this section"
                        >
                          <Play className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                        </button>
                      )}
                      <button
                        onClick={() => onSelectSection(section._index)}
                        className="p-1.5"
                      >
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-gold-500 transition-colors" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredSections.length === 0 && !sectionsLoading && (
            <div className="py-14 text-center">
              <p className="text-sm text-slate-400">
                {searchQuery ? `No sections match "${searchQuery}"` : 'No sections loaded yet.'}
              </p>
            </div>
          )}
        </div>

        {/* Load more */}
        {sectionsPage < sectionsTotalPages && (
          <div className="flex justify-center py-2">
            <button
              onClick={onLoadMoreSections}
              disabled={sectionsLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all text-sm font-medium shadow-sm"
            >
              {sectionsLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</>
                : `Load more — ${sections.length} of ${totalSections}`}
            </button>
          </div>
        )}

        {sectionsLoading && sections.length === 0 && (
          <div className="flex justify-center py-14">
            <Loader2 className="w-6 h-6 text-gold-500 animate-spin" />
          </div>
        )}
      </div>

      {/* Floating selection bar */}
      {selectionMode && selectedSections.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold">{selectedSections.size}</span>
            </div>
            <span className="text-sm font-semibold whitespace-nowrap">
              {selectedSections.size === 1 ? 'section selected' : 'sections selected'}
            </span>
          </div>
          <div className="w-px h-5 bg-slate-700" />
          <button
            onClick={() => setSelectedSections(new Set())}
            className="text-slate-400 hover:text-white text-xs font-medium transition-colors whitespace-nowrap"
          >
            Clear
          </button>
          <button
            onClick={() => {
              onPlaySelected?.(Array.from(selectedSections));
              exitSelection();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-sm font-semibold transition-colors whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            Play Selected
          </button>
        </div>
      )}
    </div>
  );
}
