import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Volume2, Grid3X3, List, Filter, SortAsc } from 'lucide-react';
import { audioLessonsAPI, AudioLesson } from '../services/api';
import LessonCard from './audio/LessonCard';

type ViewMode = 'grid' | 'list';
type SortBy = 'newest' | 'oldest' | 'title';

function LessonSkeletonCard({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl border border-brand-200 p-4 flex gap-4 animate-pulse">
        <div className="w-12 h-12 rounded-xl bg-brand-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-brand-200 rounded w-2/3" />
          <div className="h-3 bg-brand-100 rounded w-full" />
          <div className="h-3 bg-brand-100 rounded w-1/2" />
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl border border-brand-200 overflow-hidden animate-pulse">
      <div className="p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-200 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-brand-200 rounded w-3/4" />
            <div className="h-3 bg-brand-100 rounded w-1/3" />
          </div>
        </div>
        <div className="h-3 bg-brand-100 rounded w-full" />
        <div className="h-3 bg-brand-100 rounded w-5/6" />
      </div>
      <div className="px-5 pb-5">
        <div className="h-10 bg-brand-200 rounded-xl" />
      </div>
    </div>
  );
}

export default function AudioLessons() {
  const navigate = useNavigate();
  const [audioLessons, setAudioLessons] = useState<AudioLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [showFilters, setShowFilters] = useState(false);

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

  const filteredAndSortedLessons = audioLessons
    .filter(l =>
      searchQuery === '' ||
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  if (loading && audioLessons.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-gold-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="mb-8">
            <div className="h-10 bg-brand-200 rounded w-1/3 mb-3 animate-pulse" />
            <div className="h-4 bg-brand-100 rounded w-1/2 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <LessonSkeletonCard key={i} viewMode="grid" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-gold-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-brand-900 mb-2">Audiobooks</h1>
              <p className="text-brand-600 dark:text-brand-300">Explore our comprehensive collection of legal audio content</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-bold bg-brand-900 bg-clip-text text-transparent">{filteredAndSortedLessons.length}</div>
                <div className="text-xs text-brand-500">Available Lessons</div>
              </div>
            </div>
          </div>

          {/* Search and Controls */}
          <div className="bg-white rounded-2xl shadow-sm border border-brand-200 p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-400" />
                <input
                  type="text"
                  placeholder="Search lessons by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-brand-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <div className="flex bg-brand-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'grid'
                      ? 'bg-brand-900 text-white shadow-sm'
                      : 'text-brand-600 hover:text-brand-900'
                      }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'list'
                      ? 'bg-brand-900 text-white shadow-sm'
                      : 'text-brand-600 hover:text-brand-900'
                      }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Filters Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg border transition-all ${showFilters
                    ? 'bg-gradient-to-r bg-gold-50 border-gold-200 text-gold-600'
                    : 'bg-white border-brand-300 text-brand-600 hover:bg-brand-50 hover:border-gold-400'
                    }`}
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-brand-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Categories */}
                  {categories.length > 1 && (
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-brand-700 dark:text-brand-300 mb-2">Category</label>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {categories.map(cat => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat ?? 'all')}
                            className={`px-4 py-2 font-medium transition-all rounded-lg whitespace-nowrap text-sm shadow-sm ${selectedCategory === cat
                              ? 'bg-brand-900 text-white shadow-md transform hover:scale-105'
                              : 'bg-white text-brand-600 hover:bg-brand-50 border border-brand-300 hover:border-gold-400'
                              }`}
                          >
                            {cat === 'all' ? 'All Categories' : cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sort */}
                  <div className="sm:w-48">
                    <label className="block text-sm font-medium text-brand-700 dark:text-brand-300 mb-2">Sort by</label>
                    <div className="relative">
                      <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-400" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortBy)}
                        className="w-full pl-10 pr-4 py-2 border border-brand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white text-sm"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="title">Title A-Z</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Lessons Grid/List – keep visible with reduced opacity during page transitions */}
        <div className={`${viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
          } transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          {filteredAndSortedLessons.map((lesson) => (
            <LessonCard
              key={lesson._id}
              lesson={lesson}
              viewMode={viewMode}
              onClick={() => lesson.isActive && navigate(`/audio-player/${lesson._id}`)}
            />
          ))}
        </div>

        {filteredAndSortedLessons.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-brand-200">
            <Volume2 className="w-16 h-16 text-brand-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-brand-900 mb-2">No lessons found</h3>
            <p className="text-brand-500">
              {searchQuery ? 'Try adjusting your search terms or filters' : 'No audio lessons available'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="px-5 py-2.5 text-sm font-medium bg-white border border-brand-300 rounded-lg hover:bg-brand-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:border-gold-400"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 text-sm font-medium rounded-lg transition-all ${page === pageNum
                      ? 'bg-brand-900 text-white shadow-md transform hover:scale-105'
                      : 'bg-white border border-brand-300 text-brand-700 hover:bg-brand-50 hover:border-gold-400'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="px-5 py-2.5 text-sm font-medium bg-white border border-brand-300 rounded-lg hover:bg-brand-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:border-gold-400"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
