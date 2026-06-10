import { ArrowLeft, ChevronRight, Headphones, Play, Layers, Loader2, CheckSquare, Square, X, Check } from 'lucide-react';
import { AudioLesson, AudioSectionDetail, AudioSubsectionSlim } from '../../services/api';
import { useState } from 'react';

interface SubsectionListProps {
  lesson: AudioLesson;
  sectionHead: AudioSectionDetail;
  sectionIndex: number;
  subsections: AudioSubsectionSlim[];
  selectedLanguage: 'english' | 'hindi';
  onPlayCombinedAudio: () => void;
  onSelectSubsection?: (subsectionIndex: number) => void;
  onPlaySelected?: (indices: number[]) => void;
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
  onSelectSubsection,
  onPlaySelected,
  onLanguageChange,
  onBack,
}: SubsectionListProps) {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedSubs, setSelectedSubs] = useState<Set<number>>(new Set());

  const hasEnglish = sectionHead.hasEnglishAudio || subsections.some(s => s.hasEnglishAudio);
  const hasHindi = sectionHead.hasHindiAudio || subsections.some(s => s.hasHindiAudio);
  const hasSectionAudio = sectionHead.hasEnglishAudio || sectionHead.hasHindiAudio ||
    sectionHead.hasEasyEnglishAudio || sectionHead.hasEasyHindiAudio;
  const canPlay = hasSectionAudio || sectionHead.totalSubsections > 0;

  const subHasAudio = (s: AudioSubsectionSlim) =>
    selectedLanguage === 'english'
      ? s.hasEnglishAudio || s.hasEasyEnglishAudio
      : s.hasHindiAudio || s.hasEasyHindiAudio;

  const playableSubs = subsections.filter(subHasAudio);

  const toggleSub = (idx: number) => {
    const sub = subsections.find(s => s._index === idx);
    if (!sub || !subHasAudio(sub)) return;
    setSelectedSubs(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const selectAll = () => setSelectedSubs(new Set(playableSubs.map(s => s._index)));

  const exitSelection = () => {
    setSelectionMode(false);
    setSelectedSubs(new Set());
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Sticky header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-gold-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sections</span>
          </button>

          {onPlaySelected && subsections.length > 0 && (
            selectionMode ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={selectAll}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <Square className="w-3.5 h-3.5" />
                  All ({playableSubs.length})
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

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Section info card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7">
          {lesson.headTitle && (
            <p className="text-xs font-semibold text-gold-600 uppercase tracking-widest mb-2">
              {lesson.headTitle}
            </p>
          )}
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug mb-5">
            {sectionHead.title}
          </h1>

          {/* Language toggle */}
          {(hasEnglish || hasHindi) && (
            <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl mb-5">
              {hasEnglish && (
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
              )}
              {hasHindi && (
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
              )}
            </div>
          )}

          {/* Play All button — hidden in selection mode */}
          {!selectionMode && canPlay && (
            <button
              onClick={onPlayCombinedAudio}
              className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 bg-brand-900 hover:bg-brand-800 active:bg-brand-950 text-white rounded-xl font-semibold text-sm transition-all shadow-sm"
            >
              <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
              </div>
              Play All Audio
              <Layers className="w-4 h-4 ml-auto opacity-60" />
            </button>
          )}
        </div>

        {/* Subsections list */}
        {subsections.length > 0 ? (
          <div className="space-y-2">
            {subsections.map((sub) => {
              const hasAudio = subHasAudio(sub);
              const isSelected = selectedSubs.has(sub._index);
              const isDisabled = selectionMode && !hasAudio;
              const preview = sub.englishTextPreview;

              return (
                <div
                  key={sub._index}
                  className={`bg-white rounded-xl border transition-all group ${
                    isDisabled
                      ? 'border-slate-100 opacity-50'
                      : isSelected
                      ? 'border-amber-300 ring-2 ring-amber-200 shadow-sm'
                      : 'border-slate-100 hover:border-gold-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 px-4 py-4">
                    {/* Checkbox in selection mode */}
                    {selectionMode && (
                      <button
                        onClick={() => toggleSub(sub._index)}
                        disabled={isDisabled}
                        className="flex-shrink-0 disabled:cursor-not-allowed"
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isDisabled
                            ? 'bg-slate-100 border-slate-200'
                            : isSelected
                            ? 'bg-amber-500 border-amber-500'
                            : 'bg-white border-slate-300 hover:border-amber-400'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                        </div>
                      </button>
                    )}

                    {/* Content */}
                    <div
                      className={`flex-1 min-w-0 ${isDisabled ? 'cursor-default' : 'cursor-pointer'}`}
                      onClick={() => {
                        if (isDisabled) return;
                        if (selectionMode) { toggleSub(sub._index); return; }
                        onSelectSubsection?.(sub._index);
                      }}
                    >
                      <p className={`font-semibold text-sm leading-snug transition-colors ${
                        isSelected ? 'text-amber-700' : 'text-slate-900 group-hover:text-gold-700'
                      }`}>
                        {sub.title}
                      </p>
                      {preview && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1 leading-relaxed">
                          {preview}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {hasAudio ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gold-600 bg-gold-50 px-2 py-0.5 rounded-full border border-gold-100">
                            <Headphones className="w-2.5 h-2.5" />
                            Audio
                          </span>
                        ) : selectionMode ? (
                          <span className="text-[11px] text-slate-400">No audio</span>
                        ) : null}
                      </div>
                    </div>

                    {/* Right side — chevron in normal mode */}
                    {!selectionMode && onSelectSubsection && (
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-gold-500 flex-shrink-0 transition-colors" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 text-gold-500 animate-spin" />
          </div>
        )}
      </div>

      {/* Floating selection bar */}
      {selectionMode && selectedSubs.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold">{selectedSubs.size}</span>
            </div>
            <span className="text-sm font-semibold whitespace-nowrap">
              {selectedSubs.size === 1 ? 'subsection selected' : 'subsections selected'}
            </span>
          </div>
          <div className="w-px h-5 bg-slate-700" />
          <button
            onClick={() => setSelectedSubs(new Set())}
            className="text-slate-400 hover:text-white text-xs font-medium transition-colors whitespace-nowrap"
          >
            Clear
          </button>
          <button
            onClick={() => {
              onPlaySelected?.(Array.from(selectedSubs));
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
