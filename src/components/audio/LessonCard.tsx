import { FileText, Clock, BookOpen, List, Play, Calendar, Tag } from 'lucide-react';
import { AudioLesson } from '../../services/api';

interface LessonCardProps {
  lesson: AudioLesson;
  viewMode?: 'grid' | 'list';
  onClick: () => void;
}

export default function LessonCard({ lesson, viewMode = 'grid', onClick }: LessonCardProps) {
  const totalSubsections = lesson.totalSubsections || 0;

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (viewMode === 'list') {
    return (
      <div
        onClick={onClick}
        className={`group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 ${
          lesson.isActive ? 'cursor-pointer hover:border-amber-300' : 'cursor-not-allowed opacity-60'
        }`}
      >
        <div className="p-4 sm:p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
              <FileText className="w-6 h-6 text-amber-600" />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1">
                  {lesson.headTitle && (
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      {lesson.headTitle}
                    </div>
                  )}
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors leading-tight">
                    {lesson.title}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                    {lesson.description || 'Listen to this comprehensive audio lesson'}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-600 mb-3">
                    {lesson.totalSections && lesson.totalSections > 0 && (
                      <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1.5 rounded-lg border border-amber-200">
                        <List className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-medium text-amber-700">{lesson.totalSections} sections</span>
                      </div>
                    )}
                    {totalSubsections > 0 && (
                      <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1.5 rounded-lg border border-amber-200">
                        <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-medium text-amber-700">{totalSubsections} subsections</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-slate-50 to-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-slate-600">{formatDate(lesson.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Right side */}
                <div className="flex flex-col items-end gap-3">
                  {lesson.category && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 rounded-lg border border-amber-200 shadow-sm">
                      <Tag className="w-3 h-3" />
                      {lesson.category}
                    </div>
                  )}
                  {lesson.isActive && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium text-sm hover:from-amber-600 hover:to-orange-600 transition-all shadow-md transform hover:scale-105">
                      <Play className="w-4 h-4" fill="white" />
                      <span>Play Lesson</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      onClick={onClick}
      className={`group relative border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-white transform hover:-translate-y-1 ${
        lesson.isActive ? 'cursor-pointer hover:border-amber-400' : 'cursor-not-allowed opacity-60'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/0 to-orange-50/0 group-hover:from-amber-50/50 group-hover:to-orange-50/30 transition-all duration-300 pointer-events-none" />

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

        <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">
          {lesson.description || 'Listen to this comprehensive audio lesson'}
        </p>

        <div className="flex items-center gap-3 text-xs text-slate-600 mb-4">
          {lesson.totalSections && lesson.totalSections > 0 && (
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1.5 rounded-lg border border-amber-200">
              <List className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-medium text-amber-700">{lesson.totalSections} sections</span>
            </div>
          )}
          {totalSubsections > 0 && (
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1.5 rounded-lg border border-amber-200">
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-medium text-amber-700">{totalSubsections} subsections</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(lesson.createdAt)}</span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {lesson.category && (
            <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 rounded-lg border border-amber-200 shadow-sm">
              <Tag className="w-3 h-3" />
              {lesson.category}
            </div>
          )}
          {lesson.isActive && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium text-xs hover:from-amber-600 hover:to-orange-600 transition-all shadow-md transform hover:scale-105 ml-auto">
              <Play className="w-3 h-3" fill="white" />
              <span>Play</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
