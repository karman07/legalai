import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Volume2, FileAudio, Clock, Tag, Languages, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { audioLessonsAPI, AudioLesson } from '../services/api';

export default function AudioLessons() {
  const navigate = useNavigate();
  const [audioLessons, setAudioLessons] = useState<AudioLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchAudioLessons();
  }, [page]);



  const fetchAudioLessons = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await audioLessonsAPI.getAudioLessons(page, 10);
      setAudioLessons(response.items);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load audio lessons';
      if (errorMsg.includes('403') || errorMsg.toLowerCase().includes('forbidden') || errorMsg.toLowerCase().includes('insufficient permissions')) {
        setError('You need to be logged in as an admin to view audio lessons');
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPlayer = (lessonId: string) => {
    navigate(`/audio-player/${lessonId}`);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const categories = ['all', ...Array.from(new Set(audioLessons.map(l => l.category).filter((c): c is string => Boolean(c))))];
  const filteredLessons = selectedCategory === 'all' 
    ? audioLessons 
    : audioLessons.filter(l => l.category === selectedCategory);

  if (loading && audioLessons.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading audio lessons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-3">Audio Lessons</h1>
          <p className="text-lg text-slate-600">Immersive legal education through audio lectures</p>
        </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

        {categories.length > 1 && (
          <div className="mb-8 flex flex-wrap gap-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                    : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-amber-400 shadow-sm'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}
          </div>
        )}

        <div className="grid gap-6">
          {filteredLessons.map((lesson) => (
            <div
              key={lesson._id}
              className="bg-white border-2 border-slate-200 rounded-2xl p-8 hover:shadow-2xl hover:border-amber-300 transition-all duration-300 transform hover:-translate-y-1"
            >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-start space-x-4">
                  <button
                    onClick={() => handleOpenPlayer(lesson._id)}
                    disabled={!lesson.isActive}
                    className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-110 ${
                      lesson.isActive
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xl hover:shadow-2xl'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Play className="w-7 h-7 ml-1" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2 hover:text-amber-600 transition-colors cursor-pointer" onClick={() => handleOpenPlayer(lesson._id)}>
                      {lesson.title}
                    </h3>
                    
                    {lesson.description && (
                      <p className="text-slate-600 mb-3">{lesson.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-5 text-sm text-slate-600">
                      <div className="flex items-center space-x-1">
                        <FileAudio className="w-4 h-4" />
                        <span>{lesson.fileName}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Volume2 className="w-4 h-4" />
                        <span>{formatFileSize(lesson.fileSize)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(lesson.createdAt)}</span>
                      </div>

                      {lesson.language && (
                        <div className="flex items-center space-x-1">
                          <Languages className="w-4 h-4" />
                          <span>{lesson.language.toUpperCase()}</span>
                        </div>
                      )}

                      {lesson.category && (
                        <div className="flex items-center space-x-1">
                          <Tag className="w-4 h-4" />
                          <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-full text-xs font-semibold">
                            {lesson.category}
                          </span>
                        </div>
                      )}
                    </div>

                    {lesson.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {lesson.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Transcription Status */}
                    <div className="flex items-center space-x-2 mt-3">
                      {getStatusIcon(lesson.transcriptionStatus)}
                      <span className="text-sm text-slate-500 capitalize">
                        Transcription: {lesson.transcriptionStatus}
                      </span>
                    </div>

                    {/* Show transcript if available */}
                    {lesson.transcript && lesson.transcriptionStatus === 'completed' && (
                      <details className="mt-4">
                        <summary className="cursor-pointer text-sm font-semibold text-amber-600 hover:text-amber-700 flex items-center space-x-2">
                          <span>View Transcript</span>
                        </summary>
                        <div className="mt-3 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl text-sm text-slate-700 leading-relaxed border border-slate-200">
                          {lesson.transcript}
                        </div>
                      </details>
                    )}

                    {lesson.transcriptionError && (
                      <div className="mt-2 text-sm text-red-600">
                        Transcription error: {lesson.transcriptionError}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

          {filteredLessons.length === 0 && !loading && (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-300">
              <FileAudio className="w-20 h-20 text-slate-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No audio lessons found</h3>
              <p className="text-slate-600 text-lg">
                {selectedCategory !== 'all'
                  ? 'Try selecting a different category'
                  : 'Check back later for new content'}
              </p>
            </div>
          )}
      </div>

        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center space-x-3">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="px-6 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 hover:border-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Previous
            </button>
            
            <span className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg">
              Page {page} of {totalPages}
            </span>
            
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="px-6 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 hover:border-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
