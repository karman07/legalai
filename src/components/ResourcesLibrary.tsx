import { useEffect, useState } from 'react';
import { FileText, Search, Filter, Download, Eye, Loader2, FolderKanban } from 'lucide-react';
import resourcesService, { ResourceItem } from '../services/resourcesService';
import CustomPDFViewer from './CustomPDFViewer';
import { PDF } from '../services/pdfService';

const PAGE_SIZE = 24;

export default function ResourcesLibrary() {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [fileType, setFileType] = useState<'all' | 'pdf' | 'md'>('all');
  const [category, setCategory] = useState('all');
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    void loadCategories();
  }, []);

  useEffect(() => {
    setPage(1);
    void loadResources(1, true);
  }, [activeSearch, fileType, category]);

  const loadCategories = async () => {
    try {
      const res = await resourcesService.getCategories();
      setCategories(res || []);
    } catch {
      setCategories([]);
    }
  };

  const loadResources = async (targetPage: number, replace = false) => {
    if (replace) setLoading(true);
    else setLoadingMore(true);

    setError('');
    try {
      const response = await resourcesService.getResources({
        page: targetPage,
        limit: PAGE_SIZE,
        search: activeSearch || undefined,
        fileType: fileType === 'all' ? undefined : fileType,
        category: category === 'all' ? undefined : category,
      });

      setResources((prev) => (replace ? response.items : [...prev, ...response.items]));
      setTotalPages(response.totalPages || 1);
      setPage(targetPage);
    } catch (err: any) {
      setError(err.message || 'Failed to load resources');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = () => {
    setActiveSearch(searchTerm.trim());
  };

  const handleReset = () => {
    setSearchTerm('');
    setActiveSearch('');
    setFileType('all');
    setCategory('all');
  };

  const viewerPdf: PDF | null = selectedResource
    ? {
        _id: selectedResource._id,
        title: selectedResource.title,
        file: selectedResource.fileName,
        fileName: selectedResource.fileName,
      }
    : null;

  return (
    <div className="max-w-7xl mx-0 lg:ml-4 lg:mr-0 p-4 lg:p-6 overflow-x-hidden">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 bg-brand-100 dark:bg-brand-900 rounded-xl flex items-center justify-center">
            <FolderKanban className="w-5 h-5 text-brand-700 dark:text-gold-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-brand-900 dark:text-brand-100">Resources Library</h1>
            <p className="text-brand-500 dark:text-brand-400 text-sm">Browse admin-published PDF and Markdown resources</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 mb-3">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by title, category, tags..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-200 rounded-xl text-brand-800 placeholder:text-brand-400 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value as 'all' | 'pdf' | 'md')}
              className="w-full pl-10 pr-3 py-2.5 bg-white border border-brand-200 rounded-xl text-brand-700 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="all">All Types</option>
              <option value="pdf">PDF</option>
              <option value="md">Markdown</option>
            </select>
          </div>

          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-brand-200 rounded-xl text-brand-700 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button onClick={handleSearch} className="flex-1 px-4 py-2.5 bg-brand-900 hover:bg-brand-800 text-white rounded-xl text-sm font-semibold">Search</button>
            <button onClick={handleReset} className="px-4 py-2.5 bg-brand-100 hover:bg-brand-200 text-brand-700 rounded-xl text-sm font-medium">Reset</button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-white border border-brand-200 rounded-2xl p-5 animate-pulse">
              <div className="h-5 bg-brand-200 rounded w-2/3 mb-3" />
              <div className="h-3 bg-brand-100 rounded w-full mb-2" />
              <div className="h-3 bg-brand-100 rounded w-5/6" />
            </div>
          ))}
        </div>
      )}

      {!loading && resources.length === 0 && (
        <div className="text-center py-16 bg-white border border-brand-200 rounded-2xl">
          <FileText className="w-14 h-14 text-brand-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-brand-600 mb-2">No resources found</h3>
          <p className="text-brand-500">Try changing filters or search query</p>
        </div>
      )}

      {!loading && resources.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {resources.map((item) => (
              <div key={item._id} className="bg-white border border-brand-200 rounded-2xl p-5 hover:shadow-card transition-all">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-base font-bold text-brand-900 line-clamp-2">{item.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-md font-semibold ${item.fileType === 'pdf' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {item.fileType.toUpperCase()}
                  </span>
                </div>

                {item.description && (
                  <p className="text-sm text-brand-600 line-clamp-3 mb-3">{item.description}</p>
                )}

                <div className="flex items-center justify-between text-xs text-brand-500 mb-4">
                  <span>{item.category || 'General'}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString('en-IN')}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedResource(item)}
                    className="flex-1 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Open
                  </button>
                  <a
                    href={resourcesService.getFileUrl(item.fileUrl)}
                    download={item.originalName || item.fileName}
                    className="p-2.5 border border-brand-200 rounded-xl hover:bg-brand-50"
                  >
                    <Download className="w-4 h-4 text-brand-600" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {page < totalPages && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => void loadResources(page + 1)}
                disabled={loadingMore}
                className="px-6 py-3 bg-brand-900 hover:bg-brand-800 text-white rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
              >
                {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                {loadingMore ? 'Loading...' : `Load more (${resources.length})`}
              </button>
            </div>
          )}
        </>
      )}

      {selectedResource && viewerPdf && (
        <CustomPDFViewer
          pdf={viewerPdf}
          fileUrl={resourcesService.getFileUrl(selectedResource.fileUrl)}
          onClose={() => setSelectedResource(null)}
        />
      )}
    </div>
  );
}
