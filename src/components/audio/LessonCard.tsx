import { FileText, Clock, BookOpen, List } from 'lucide-react';
import { AudioLesson } from '../../services/api';

interface LessonCardProps {
  lesson: AudioLesson;
  onClick: () => void;
}

export default function LessonCard({ lesson, onClick }: LessonCardProps) {
  const totalSubsections = lesson.totalSubsections || 0;

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      onClick={onClick}
      className={`group relative border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-white transform hover:-translate-y-1 ${
        lesson.isActive ? 'cursor-pointer hover:border-amber-400' : 'cursor-not-allowed opacity-50'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/0 to-orange-50/0 group-hover:from-amber-50/40 group-hover:to-orange-50/20 transition-all duration-300 pointer-events-none" />

      <div className="relative p-6">
        {lesson.headTitle && (
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            {lesson.headTitle}
          </div>
        )}

        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
            <FileText className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-2 group-hover:text-amber-600 transition-colors leading-tight">
              {lesson.title}
            </h3>
          </div>
        </div>

        <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {lesson.description || 'Listen to this audio lesson'}
        </p>

        <div className="flex items-center gap-3 text-xs text-slate-600 mb-4">
          {lesson.totalSections && lesson.totalSections > 0 && (
            <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg">
              <List className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-medium text-blue-700">{lesson.totalSections} sections</span>
            </div>
          )}
          {totalSubsections > 0 && (
            <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-lg">
              <BookOpen className="w-3.5 h-3.5 text-purple-600" />
              <span className="font-medium text-purple-700">{totalSubsections} subsections</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatDate(lesson.createdAt)}</span>
        </div>

        {lesson.category && (
          <div className="pt-4 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-700 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
              {lesson.category}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
