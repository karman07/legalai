import { useEffect, useState } from 'react';
import {
  FileText,
  Download,
  Eye,
  Loader2,
  FolderKanban,
  FolderOpen,
  Layers,
  CalendarDays,
  Tag,
  FileBadge,
} from 'lucide-react';
import resourcesService, { ResourceItem } from '../services/resourcesService';
import CustomPDFViewer from './CustomPDFViewer';
import { PDF } from '../services/pdfService';

const PAGE_SIZE = 24;

type ResourcesLibraryProps = {
  contentKind?: 'resource' | 'study-material';
  heading?: string;
  subheading?: string;
  emptyTitle?: string;
};

export default function ResourcesLibrary({
  contentKind = 'resource',
  heading = 'Resources Library',
  subheading = 'Browse admin-published PDF and Markdown resources',
  emptyTitle = 'No resources found',
}: ResourcesLibraryProps) {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [category, setCategory] = useState('');
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    void loadCategories();
  }, [contentKind]);

  useEffect(() => {
    setPage(1);
    void loadResources(1, true);
  }, [category, contentKind]);

  const loadCategories = async () => {
    try {
      const res = await resourcesService.getCategories(contentKind);
      const resolved = res || [];
      setCategories(resolved);
      if (!resolved.includes(category)) {
        setCategory('');
      }
    } catch {
      setCategories([]);
      setCategory('');
    }
  };

  const loadResources = async (targetPage: number, replace = false) => {
    if (!category) {
      setResources([]);
      setPage(1);
      setTotalPages(1);
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    if (replace) setLoading(true);
    else setLoadingMore(true);

    setError('');
    try {
      const response = await resourcesService.getResources({
        page: targetPage,
        limit: PAGE_SIZE,
        category,
        kind: contentKind,
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
            <h1 className="text-2xl font-bold text-brand-900 dark:text-brand-100">{heading}</h1>
            <p className="text-brand-500 dark:text-brand-400 text-sm">{subheading}</p>
          </div>
        </div>
        <div className="bg-white border border-brand-200 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-brand-600" />
            <p className="text-sm font-semibold text-brand-700">Select Category First</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`text-left rounded-xl border p-3 transition-all ${
                  category === c
                    ? 'bg-brand-900 text-white border-brand-900 shadow-md'
                    : 'bg-brand-50 text-brand-700 border-brand-100 hover:bg-brand-100 hover:border-brand-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold leading-tight">{c}</p>
                    <p className={`text-xs mt-1 ${category === c ? 'text-brand-100' : 'text-brand-500'}`}>
                      Open this category
                    </p>
                  </div>
                  <FolderOpen className={`w-4 h-4 ${category === c ? 'text-white' : 'text-brand-500'}`} />
                </div>
              </button>
            ))}
          </div>
          {!category && categories.length > 0 && (
            <p className="mt-3 text-xs text-brand-500">Choose one category to view files.</p>
          )}
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

      {!loading && !category && categories.length > 0 && (
        <div className="text-center py-16 bg-white border border-brand-200 rounded-2xl">
          <FileText className="w-14 h-14 text-brand-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-brand-600 mb-2">Select a category first</h3>
          <p className="text-brand-500">Resources will appear after category selection.</p>
        </div>
      )}

      {!loading && category && resources.length === 0 && (
        <div className="text-center py-16 bg-white border border-brand-200 rounded-2xl">
          <FileText className="w-14 h-14 text-brand-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-brand-600 mb-2">{emptyTitle}</h3>
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
                    <span className="inline-flex items-center gap-1">
                      <FileBadge className="w-3 h-3" />
                      {item.fileType.toUpperCase()}
                    </span>
                  </span>
                </div>

                {item.description && (
                  <p className="text-sm text-brand-600 line-clamp-3 mb-3">{item.description}</p>
                )}

                <div className="space-y-2 text-xs text-brand-500 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      {item.category || 'General'}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {new Date(item.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
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
