import { List, BookOpen, Play, Tag, Check } from 'lucide-react';
import { AudioLesson } from '../../services/api';

interface LessonCardProps {
  lesson: AudioLesson;
  viewMode?: 'grid' | 'list';
  selectionMode?: boolean;
  isSelected?: boolean;
  onClick: () => void;
}

function getAbbreviation(title: string): string {
  const cleaned = title.replace(/[()]/g, '');
  const initials = cleaned.split(/\s+/).filter(w => /^[A-Z]/.test(w)).map(w => w[0]).join('').slice(0, 3);
  return initials || title.slice(0, 2).toUpperCase();
}

export default function LessonCard({ lesson, viewMode = 'grid', selectionMode, isSelected, onClick }: LessonCardProps) {
  const totalSubsections = lesson.totalSubsections || 0;
  const abbr = getAbbreviation(lesson.title);

  const selectionRing = isSelected ? 'ring-2 ring-amber-400 border-amber-300' : '';

  const CheckCircle = () => (
    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
      isSelected ? 'bg-amber-500 border-amber-500' : 'bg-white border-slate-300'
    }`}>
      {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
    </div>
  );

  if (viewMode === 'list') {
    return (
      <div
        onClick={onClick}
        className={`group bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer ${
          lesson.isActive || selectionMode ? 'hover:border-amber-200 hover:shadow-md' : 'opacity-50 cursor-not-allowed'
        } ${selectionRing}`}
      >
        <div className="p-5 flex gap-4 items-center">
          {selectionMode && <CheckCircle />}

          <div className="w-[52px] h-[52px] bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-amber-700 tracking-tight">{abbr}</span>
          </div>

          <div className="flex-1 min-w-0">
            {lesson.headTitle && (
              <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-widest mb-0.5">{lesson.headTitle}</p>
            )}
            <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-amber-700 transition-colors mb-2">
              {lesson.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {lesson.totalSections && lesson.totalSections > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  <List className="w-3 h-3" />
                  {lesson.totalSections} sections
                </span>
              )}
              {totalSubsections > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  <BookOpen className="w-3 h-3" />
                  {totalSubsections} subsections
                </span>
              )}
              {lesson.category && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">
                  <Tag className="w-3 h-3" />
                  {lesson.category}
                </span>
              )}
            </div>
          </div>

          {!selectionMode && lesson.isActive && (
            <button className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-colors">
              <Play className="w-3.5 h-3.5 fill-white" />
              Play
            </button>
          )}
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      onClick={onClick}
      className={`group bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col cursor-pointer ${
        lesson.isActive || selectionMode
          ? 'hover:border-amber-200 hover:shadow-lg hover:-translate-y-0.5'
          : 'opacity-50 cursor-not-allowed'
      } ${selectionRing}`}
    >
      <div className="h-0.5 bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="p-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-11 h-11 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-amber-700 tracking-tight">{abbr}</span>
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            {lesson.headTitle && (
              <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-widest mb-0.5">
                {lesson.headTitle}
              </p>
            )}
            <h3 className="text-[15px] font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-amber-700 transition-colors">
              {lesson.title}
            </h3>
          </div>
          {selectionMode && (
            <div className="flex-shrink-0 mt-0.5">
              <CheckCircle />
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4 flex-1">
          {lesson.description || 'Unabridged audio recording of this Bare Act.'}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-2 flex-wrap mb-5">
          {lesson.totalSections && lesson.totalSections > 0 && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
              <List className="w-3 h-3" />
              {lesson.totalSections} sections
            </span>
          )}
          {totalSubsections > 0 && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
              <BookOpen className="w-3 h-3" />
              {totalSubsections} subsections
            </span>
          )}
          {lesson.category && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">
              {lesson.category}
            </span>
          )}
        </div>

        {/* Play button / Selected indicator */}
        {selectionMode ? (
          <div className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            isSelected ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {isSelected ? (
              <><Check className="w-3.5 h-3.5 stroke-[3]" /> Selected</>
            ) : (
              'Tap to select'
            )}
          </div>
        ) : (
          lesson.isActive && (
            <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-colors">
              <Play className="w-3.5 h-3.5 fill-white" />
              Start Listening
            </button>
          )
        )}
      </div>
    </div>
  );
}
