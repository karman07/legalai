import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Volume2, Grid3X3, List, ChevronLeft, ChevronRight, Headphones, BookOpen, Layers, Play, CheckSquare, X, Square } from 'lucide-react';
import { audioLessonsAPI, AudioLesson } from '../services/api';
import LessonCard from './audio/LessonCard';

type ViewMode = 'grid' | 'list';
type SortBy = 'newest' | 'oldest' | 'title';

function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden animate-pulse">
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex-shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3 bg-slate-100 rounded w-1/4" />
            <div className="h-4 bg-slate-200 rounded w-3/4" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-slate-100 rounded w-full" />
          <div className="h-3 bg-slate-100 rounded w-5/6" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 bg-slate-100 rounded-full w-24" />
          <div className="h-6 bg-slate-100 rounded-full w-28" />
        </div>
        <div className="h-10 bg-slate-100 rounded-xl" />
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
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedLessons, setSelectedLessons] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAudioLessons();
  }, [page]);

  const fetchAudioLessons = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await audioLessonsAPI.getAudioLessons(page, 50);
      setAudioLessons(response.items);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load audio lessons');
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set(audioLessons.map(l => l.category).filter(Boolean) as string[]));

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
    setPage(1);
  };

  const clearCategories = () => {
    setSelectedCategories(new Set());
    setPage(1);
  };

  const toggleLessonSelection = (id: string) => {
    setSelectedLessons(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedLessons(new Set(filteredAndSorted.filter(l => l.isActive).map(l => l._id)));
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedLessons(new Set());
  };

  const filteredAndSorted = audioLessons
    .filter(l => {
      if (selectedCategories.size > 0 && (!l.category || !selectedCategories.has(l.category))) return false;
      if (searchQuery !== '' &&
          !l.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !l.description?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title': return a.title.localeCompare(b.title);
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const totalSectionsAll = audioLessons.reduce((s, l) => s + (l.totalSections || 0), 0);
  const totalSubsectionsAll = audioLessons.reduce((s, l) => s + (l.totalSubsections || 0), 0);

  const handleCardClick = (lesson: AudioLesson) => {
    if (selectionMode) {
      if (lesson.isActive) toggleLessonSelection(lesson._id);
      return;
    }
    if (lesson.isActive) navigate(`/audio-player/${lesson._id}`);
  };

  const playFirstSelected = () => {
    const first = filteredAndSorted.find(l => selectedLessons.has(l._id) && l.isActive);
    if (first) navigate(`/audio-player/${first._id}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero ── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-full text-amber-600 text-xs font-semibold mb-5">
            <Headphones className="w-3.5 h-3.5" />
            Legal Audio Library
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3 tracking-tight">
            Audiobooks
          </h1>
          <p className="text-slate-500 text-base sm:text-lg mb-7 max-w-xl">
            India's Bare Acts — unabridged, narrated in English &amp; Hindi.
          </p>

          {/* Search */}
          <div className="relative max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all text-sm"
            />
          </div>

          {/* Stats strip */}
          {!loading && audioLessons.length > 0 && (
            <div className="flex items-center gap-6 mt-6 flex-wrap">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Volume2 className="w-4 h-4 text-amber-500" />
                <span><span className="text-slate-900 font-semibold">{audioLessons.length}</span> books</span>
              </div>
              {totalSectionsAll > 0 && (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Layers className="w-4 h-4 text-amber-500" />
                  <span><span className="text-slate-900 font-semibold">{totalSectionsAll.toLocaleString()}</span> sections</span>
                </div>
              )}
              {totalSubsectionsAll > 0 && (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  <span><span className="text-slate-900 font-semibold">{totalSubsectionsAll.toLocaleString()}</span> subsections</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Controls bar ── */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 overflow-x-auto">
          {/* Category pills — multi-select */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto pb-0.5">
            <button
              onClick={clearCategories}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategories.size === 0
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedCategories.has(cat)
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="flex-shrink-0 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="title">A–Z</option>
          </select>


          {/* View toggle */}
          <div className="flex-shrink-0 flex items-center bg-slate-100 rounded-lg p-1 gap-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-700'}`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-700'}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Active category chips */}
        {selectedCategories.size > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-2 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400">Showing:</span>
            {Array.from(selectedCategories).map(cat => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-full hover:bg-amber-100 transition-colors"
              >
                {cat}
                <X className="w-3 h-3" />
              </button>
            ))}
            <button onClick={clearCategories} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7 pb-28">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        {loading && audioLessons.length === 0 ? (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
            : 'space-y-3'
          }>
            {Array.from({ length: viewMode === 'grid' ? 6 : 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div
            className={`transition-opacity duration-150 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'} ${
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
                : 'space-y-3'
            }`}
          >
            {filteredAndSorted.map(lesson => (
              <LessonCard
                key={lesson._id}
                lesson={lesson}
                viewMode={viewMode}
                selectionMode={selectionMode}
                isSelected={selectedLessons.has(lesson._id)}
                onClick={() => handleCardClick(lesson)}
              />
            ))}
          </div>
        )}

        {filteredAndSorted.length === 0 && !loading && (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Volume2 className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-700 mb-1">No lessons found</p>
            <p className="text-sm text-slate-400">
              {searchQuery ? `No results for "${searchQuery}"` : 'No audio lessons available yet.'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => setPage(num)}
                className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                  page === num
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ── Floating selection bar ── */}
      {selectedLessons.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">{selectedLessons.size}</span>
            </div>
            <span className="text-sm font-semibold whitespace-nowrap">
              {selectedLessons.size === 1 ? '1 book selected' : `${selectedLessons.size} books selected`}
            </span>
          </div>
          <div className="w-px h-5 bg-slate-700" />
          <button
            onClick={() => setSelectedLessons(new Set())}
            className="text-slate-400 hover:text-white text-xs font-medium transition-colors whitespace-nowrap"
          >
            Clear
          </button>
          <button
            onClick={playFirstSelected}
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
