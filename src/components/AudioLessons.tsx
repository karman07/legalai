import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Search, Volume2, Grid3X3, List, Filter, SortAsc } from 'lucide-react';
import { audioLessonsAPI, AudioLesson } from '../services/api';
import LessonCard from './audio/LessonCard';

type ViewMode = 'grid' | 'list';
type SortBy = 'newest' | 'oldest' | 'title';

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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Audio Lessons</h1>
              <p className="text-slate-600">Explore our comprehensive collection of legal audio content</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">{filteredAndSortedLessons.length}</div>
                <div className="text-xs text-slate-500">Available Lessons</div>
              </div>
            </div>
          </div>

          {/* Search and Controls */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search lessons by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
              
              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === 'grid'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === 'list'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Filters Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg border transition-all ${
                    showFilters
                      ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-600'
                      : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-amber-300'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Categories */}
                  {categories.length > 1 && (
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {categories.map(cat => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat ?? 'all')}
                            className={`px-4 py-2 font-medium transition-all rounded-lg whitespace-nowrap text-sm shadow-sm ${
                              selectedCategory === cat
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md transform hover:scale-105'
                                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-300 hover:border-amber-300'
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
                    <label className="block text-sm font-medium text-slate-700 mb-2">Sort by</label>
                    <div className="relative">
                      <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortBy)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-sm"
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

        {/* Lessons Grid/List */}
        <div className={`${
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }`}>
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
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <Volume2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No lessons found</h3>
            <p className="text-slate-500">
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
              className="px-5 py-2.5 text-sm font-medium bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:border-amber-300"
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
                    className={`w-10 h-10 text-sm font-medium rounded-lg transition-all ${
                      page === pageNum
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md transform hover:scale-105'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-amber-300'
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
              className="px-5 py-2.5 text-sm font-medium bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:border-amber-300"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
