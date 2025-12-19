import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, FileText, Loader2, Search, Clock, Languages } from 'lucide-react';
import { audioLessonsAPI, AudioLesson } from '../services/api';

export default function AudioLessons() {
  const navigate = useNavigate();
  const [audioLessons, setAudioLessons] = useState<AudioLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAudioLessons();
  }, [page, selectedCategory]);

  const fetchAudioLessons = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await audioLessonsAPI.getAudioLessons(
        page,
        10,
        selectedCategory === 'all' ? undefined : selectedCategory
      );
      setAudioLessons(response.items);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load audio lessons');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const categories = ['all', ...Array.from(new Set(audioLessons.map(l => l.category).filter(Boolean)))];
  const filteredLessons = audioLessons.filter(l =>
    searchQuery === '' ||
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && audioLessons.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold text-slate-900">Audio Lessons</h1>
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-600">{filteredLessons.length}</div>
              <div className="text-xs text-slate-500">Available Lessons</div>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {categories.length > 1 && (
          <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat ?? 'all')}
                className={`px-5 py-2.5 font-medium transition-all rounded-lg whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {cat === 'all' ? 'All Lessons' : cat}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => (
            <div
              key={lesson._id}
              onClick={() => lesson.isActive && navigate(`/audio-player/${lesson._id}`)}
              className={`group relative border border-slate-200 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 bg-white transform hover:-translate-y-1 ${
                lesson.isActive ? 'cursor-pointer hover:border-amber-300' : 'cursor-not-allowed opacity-50'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/0 to-orange-50/0 group-hover:from-amber-50/50 group-hover:to-orange-50/30 transition-all duration-300 pointer-events-none" />

              <div className="relative p-6">
                <div className="flex flex-col items-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm mb-4">
                    <FileText className="w-8 h-8 text-amber-600" />
                  </div>
                  <div className="flex gap-2">
                    {lesson.englishAudio && (
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full flex items-center gap-1">
                        <Languages className="w-3 h-3" />
                        EN {formatDuration(lesson.englishAudio.duration)}
                      </span>
                    )}
                    {lesson.hindiAudio && (
                      <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full flex items-center gap-1">
                        <Languages className="w-3 h-3" />
                        HI {formatDuration(lesson.hindiAudio.duration)}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-amber-600 transition-colors leading-tight text-center">
                  {lesson.title}
                </h3>

                <p className="text-sm text-slate-600 line-clamp-3 min-h-[3.75rem] leading-relaxed mb-4">
                  {lesson.description || 'Listen to this audio lesson'}
                </p>

                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDate(lesson.createdAt)}</span>
                  {lesson.sections && lesson.sections.length > 0 && (
                    <>
                      <span>•</span>
                      <span>{lesson.sections.length} sections</span>
                    </>
                  )}
                </div>

                {lesson.tags && lesson.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {lesson.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-medium">
                        {tag}
                      </span>
                    ))}
                    {lesson.tags.length > 3 && (
                      <span className="text-xs px-2.5 py-1 text-slate-400 font-medium">+{lesson.tags.length - 3}</span>
                    )}
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    {lesson.category && (
                      <span className="text-xs font-semibold text-slate-700 px-2.5 py-1 bg-white rounded-full border border-slate-200">
                        {lesson.category}
                      </span>
                    )}
                    {(lesson.englishTranscription || lesson.hindiTranscription) && (
                      <span className="text-xs text-green-600 font-semibold flex items-center gap-1 px-2.5 py-1 bg-green-50 rounded-full">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Transcript
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredLessons.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <Volume2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No lessons found</h3>
            <p className="text-slate-500">
              {searchQuery ? 'Try adjusting your search terms' : 'No audio lessons available'}
            </p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="px-5 py-2.5 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="px-5 py-2.5 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
