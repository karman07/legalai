import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Search, Volume2 } from 'lucide-react';
import { audioLessonsAPI, AudioLesson } from '../services/api';
import LessonCard from './audio/LessonCard';

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
            <LessonCard
              key={lesson._id}
              lesson={lesson}
              onClick={() => lesson.isActive && navigate(`/audio-player/${lesson._id}`)}
            />
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
