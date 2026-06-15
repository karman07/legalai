import { useState, useEffect } from 'react';
import { Scale, Search, FileText, X, Download, Eye, ChevronLeft, ChevronRight, File, Image, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function PDFSkeletonCard() {
  return (
    <div className="bg-white dark:bg-brand-800 rounded-2xl overflow-hidden border border-brand-200 dark:border-brand-700 flex flex-col animate-pulse">
      <div className="p-5 border-b border-brand-100 dark:border-brand-700/60">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-brand-200 dark:bg-brand-700 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-brand-200 dark:bg-brand-700 rounded w-3/4" />
            <div className="h-3 bg-brand-100 dark:bg-brand-700/60 rounded w-1/2" />
          </div>
        </div>
      </div>
      <div className="p-4 space-y-3 flex-1">
        <div className="h-3 bg-brand-100 dark:bg-brand-700/60 rounded w-full" />
        <div className="h-3 bg-brand-100 dark:bg-brand-700/60 rounded w-5/6" />
        <div className="h-3 bg-brand-100 dark:bg-brand-700/60 rounded w-4/6" />
      </div>
      <div className="px-4 py-3 border-t border-brand-100 dark:border-brand-700/60">
        <div className="h-10 bg-brand-200 dark:bg-brand-700 rounded-xl" />
      </div>
    </div>
  );
}
import pdfService, { PDF } from '../services/pdfService';
import CustomPDFViewer from './CustomPDFViewer';
import { incrementDashboardMetric } from '../lib/dashboardMetrics';
import progressService from '../services/progressService';

type YearBucket = {
  year: number;
  count: number;
};

export default function CaseLaws() {
  const { user } = useAuth();
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [years, setYears] = useState<YearBucket[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedPDF, setSelectedPDF] = useState<PDF | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeSearch, setActiveSearch] = useState('');

  const hasData = (val: string | undefined | null): val is string => {
    if (!val) return false;
    const t = val.trim().toLowerCase();
    return t !== '' && t !== 'information not available' && t !== 'n/a' && t !== 'na';
  };

  const getFileType = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (['md', 'markdown'].includes(ext)) return 'markdown';
    if (['doc', 'docx'].includes(ext)) return 'word';
    if (['txt'].includes(ext)) return 'text';
    return 'other';
  };

  const getFileIcon = (fileName: string) => {
    const type = getFileType(fileName);
    if (type === 'image') return Image;
    if (type === 'pdf') return FileText;
    return File;
  };
  useEffect(() => {
    fetchYears();
  }, []);

  useEffect(() => {
    // show year grid when no year selected and no active search
    if (selectedYear === null && !activeSearch) return;
    fetchDocs(page, activeSearch, selectedYear);
  }, [page, activeSearch, selectedYear]);

  const fetchYears = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await pdfService.getYears();
      setYears(response.items || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load years');
    } finally {
      setLoading(false);
    }
  };

  // year === null → search / list across ALL years
  const fetchDocs = async (pg: number, query: string, year: number | null) => {
    setLoading(true);
    setError('');
    try {
      const yearParam = year ? { year } : {};
      const response = query.trim()
        ? await pdfService.searchPDFs(query, { page: pg, limit: 12, ...yearParam })
        : await pdfService.getPDFs({ page: pg, limit: 12, ...yearParam });
      setPdfs(response.items);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load case laws');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    setPage(1);
    setActiveSearch(searchTerm);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPage(1);
    setActiveSearch('');
    setPdfs([]);
  };

  const handleSelectYear = (year: number) => {
    setSelectedYear(year);
    setPage(1);
    setSearchTerm('');
    setActiveSearch('');
    setPdfs([]);
  };

  const handleBackToYears = () => {
    setSelectedYear(null);
    setPage(1);
    setSearchTerm('');
    setActiveSearch('');
    setPdfs([]);
    setTotalPages(1);
  };

  // true when showing global (cross-year) search results
  const isGlobalSearch = selectedYear === null && !!activeSearch;

  const handleOpenDocument = (pdf: PDF) => {
    setSelectedPDF(pdf);
    const userId = user?.id || user?._id;
    if (userId) {
      incrementDashboardMetric(userId, 'casesViewed', 1);
    }
    void progressService.track('law_read', 1);
  };



  return (
    <div className="max-w-7xl mx-0 lg:ml-4 lg:mr-0 p-4 lg:p-6 overflow-x-hidden">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 bg-brand-100 dark:bg-brand-900 rounded-xl flex items-center justify-center">
            <Scale className="w-5 h-5 text-brand-700 dark:text-gold-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-brand-900 dark:text-brand-100">Case Laws & Documents</h1>
            <p className="text-brand-500 dark:text-brand-400 text-sm">
              {isGlobalSearch
                ? `Showing results for "${activeSearch}" across all years`
                : selectedYear !== null
                  ? `Showing cases for ${selectedYear}`
                  : 'Search across all years or choose a year below'}
            </p>
          </div>
        </div>

        {/* ── Search bar — always visible ─────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          {/* Back button: show when inside a year OR showing global results */}
          {(selectedYear !== null || isGlobalSearch) && (
            <button
              onClick={handleBackToYears}
              className="px-4 py-2.5 bg-white dark:bg-brand-800 border border-brand-200 dark:border-brand-700 text-brand-700 dark:text-brand-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 text-sm flex-shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
              Years
            </button>
          )}

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={
                selectedYear !== null
                  ? `Search ${selectedYear} cases — title, case no., bench, petitioner…`
                  : 'Search all years — case name, number, bench, petitioner…'
              }
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-brand-800 border border-brand-200 dark:border-brand-700 rounded-xl text-brand-800 dark:text-brand-100 placeholder:text-brand-400 dark:placeholder:text-brand-500 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={!searchTerm.trim()}
            className="px-5 py-2.5 bg-brand-900 dark:bg-brand-700 hover:bg-brand-800 dark:hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-sm flex-shrink-0"
          >
            Search
          </button>

          {(searchTerm || activeSearch) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 bg-brand-100 dark:bg-brand-800 hover:bg-brand-200 dark:hover:bg-brand-700 text-brand-600 dark:text-brand-300 rounded-xl transition-colors flex items-center justify-center gap-1.5 text-sm flex-shrink-0"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        {/* Global search result count badge */}
        {isGlobalSearch && !loading && (
          <p className="text-xs text-brand-500 dark:text-brand-400">
            {pdfs.length === 0
              ? 'No results found'
              : `Page ${page} of ${totalPages} — searching across all years`}
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Skeleton — year grid loading */}
      {loading && selectedYear === null && !isGlobalSearch && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-brand-800 rounded-2xl border border-brand-200 dark:border-brand-700 p-5 animate-pulse">
              <div className="h-5 w-16 bg-brand-200 dark:bg-brand-700 rounded mb-3" />
              <div className="h-3 w-20 bg-brand-100 dark:bg-brand-700/60 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Skeleton — doc grid loading (year view OR global search) */}
      {loading && (selectedYear !== null || isGlobalSearch) && pdfs.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 12 }).map((_, i) => <PDFSkeletonCard key={i} />)}
        </div>
      )}

      {/* Year grid */}
      {!loading && selectedYear === null && !isGlobalSearch && years.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {years.map((item) => (
            <button
              key={item.year}
              onClick={() => handleSelectYear(item.year)}
              className="text-left bg-white dark:bg-brand-800 rounded-2xl border border-brand-200 dark:border-brand-700 p-5 hover:border-gold-400 hover:shadow-card transition-all"
            >
              <p className="text-2xl font-bold text-brand-900 dark:text-brand-100">{item.year}</p>
              <p className="text-sm text-brand-500 dark:text-brand-400 mt-1">{item.count} case{item.count === 1 ? '' : 's'}</p>
            </button>
          ))}
        </div>
      )}

      {/* Empty States */}
      {!loading && selectedYear === null && !isGlobalSearch && years.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-brand-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-brand-600 dark:text-brand-300 mb-2">No years available</h3>
          <p className="text-brand-500 dark:text-brand-400">Add case documents with year or judgment date metadata</p>
        </div>
      )}

      {!loading && (selectedYear !== null || isGlobalSearch) && pdfs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-brand-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-brand-600 dark:text-brand-300 mb-2">No documents found</h3>
          <p className="text-brand-500 dark:text-brand-400">
            {isGlobalSearch ? `No cases matched "${activeSearch}" across any year` : 'Try adjusting your search or filters'}
          </p>
        </div>
      )}

      {/* Document Grid — year view or global search results */}
      {(selectedYear !== null || isGlobalSearch) && pdfs.length > 0 && (
        <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          {pdfs.map((pdf) => {
            const fileName = pdf.file || pdf.fileUrl?.split('/').pop() || 'document.pdf';
            const FileIcon = getFileIcon(fileName);
            const fileType = getFileType(fileName);
            const fileUrlToUse = pdf.fileUrl || `/uploads/documents/${pdf.file}`;

            return (
              <div
                key={pdf._id}
                className="group bg-white dark:bg-brand-800 rounded-2xl overflow-hidden border border-brand-200 dark:border-brand-700 hover:border-brand-400 dark:hover:border-brand-500 hover:shadow-card transition-all duration-200 flex flex-col"
              >
                {/* Header Section */}
                <div className="p-5 border-b border-brand-100 dark:border-brand-700/60">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-brand-100 dark:bg-brand-700 flex items-center justify-center flex-shrink-0">
                      <FileIcon className="w-5 h-5 text-brand-600 dark:text-gold-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-brand-900 dark:text-brand-100 mb-1 line-clamp-2 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors leading-tight">
                        {pdf.title || pdf.case_no || 'Case Document'}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        {pdf.citation && (
                          <p className="text-xs font-mono text-brand-500 dark:text-brand-400 truncate">{pdf.citation}</p>
                        )}
                        {/* Show year badge when searching across all years */}
                        {isGlobalSearch && pdf.year && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400 rounded-full text-[10px] font-bold flex-shrink-0">
                            <Calendar className="w-2.5 h-2.5" />
                            {pdf.year}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="px-5 py-4 flex-1 flex flex-col gap-3">
                  {/* Petitioner — most important field, show prominently */}
                  {hasData(pdf.pet) && (
                    <div>
                      <p className="text-[10px] font-bold text-gold-600 uppercase tracking-wider mb-1">Petitioner</p>
                      <p className="text-sm font-semibold text-brand-900 dark:text-brand-100 leading-snug">{pdf.pet}</p>
                    </div>
                  )}

                  {/* Compact metadata grid — only show populated fields */}
                  {(() => {
                    const meta: { label: string; value: string }[] = [];
                    if (hasData(pdf.case_no)) meta.push({ label: 'Case No.', value: pdf.case_no! });
                    if (hasData(pdf.diary_no)) meta.push({ label: 'Diary No.', value: pdf.diary_no! });
                    if (hasData(pdf.bench)) meta.push({ label: 'Bench', value: pdf.bench! });
                    if (hasData(pdf.judgement_by)) meta.push({ label: 'Judgement By', value: pdf.judgement_by! });
                    if (hasData(pdf.pet_adv)) meta.push({ label: 'Pet. Advocate', value: pdf.pet_adv! });
                    if (hasData(pdf.res_adv)) meta.push({ label: 'Res. Advocate', value: pdf.res_adv! });
                    if (pdf.judgment_dates) meta.push({ label: 'Judgment Date', value: new Date(pdf.judgment_dates).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) });
                    if (!meta.length) return null;
                    return (
                      <div className="grid grid-cols-1 gap-2">
                        {meta.map(({ label, value }) => (
                          <div key={label} className="flex items-start gap-2">
                            <span className="text-[10px] font-bold text-brand-400 dark:text-brand-500 uppercase tracking-wider whitespace-nowrap mt-0.5 w-24 flex-shrink-0">{label}</span>
                            <span className="text-xs text-brand-800 dark:text-brand-200 leading-snug">{value}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {/* External link */}
                  {hasData(pdf.link) && (
                    <a href={pdf.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-gold-600 hover:text-gold-700 font-medium underline-offset-2 underline truncate">
                      <FileText className="w-3 h-3 flex-shrink-0" />
                      External source
                    </a>
                  )}

                  {/* Footer meta */}
                  <div className="mt-auto pt-3 border-t border-brand-100 dark:border-brand-700/60 flex items-center justify-between text-[10px] text-brand-400 dark:text-brand-500">
                    <span className="uppercase font-semibold">{fileName.split('.').pop()}</span>
                    {pdf.createdAt && (
                      <span>{new Date(pdf.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-4 py-3 border-t border-brand-100 dark:border-brand-700/60 flex items-center gap-2">
                  {(pdf.file || pdf.fileUrl) && (
                    <>
                      <button
                        onClick={() => handleOpenDocument(pdf)}
                        className="flex-1 bg-gold-500 hover:bg-gold-600 text-white font-bold py-3 px-5 rounded-xl transition-all flex items-center justify-center gap-2 group"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View {fileType === 'image' ? 'Image' : 'Document'}</span>
                      </button>
                      <a
                        href={pdfService.getFileUrl(fileUrlToUse)}
                        download={fileName}
                        className="p-2.5 border border-brand-200 dark:border-brand-700 hover:border-gold-400 hover:bg-gold-50 dark:hover:bg-gold-900/20 rounded-xl transition-all"
                        title={`Download ${fileName}`}
                      >
                        <Download className="w-4 h-4 text-brand-500 dark:text-brand-400" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {(selectedYear !== null || isGlobalSearch) && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white dark:bg-brand-800 border border-brand-200 dark:border-brand-700 rounded-lg text-brand-700 dark:text-brand-200 hover:bg-brand-50 dark:hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="px-4 py-2 text-brand-600 dark:text-brand-300">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-white dark:bg-brand-800 border border-brand-200 dark:border-brand-700 rounded-lg text-brand-700 dark:text-brand-200 hover:bg-brand-50 dark:hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Custom PDF Viewer */}
      {selectedPDF && (selectedPDF.file || selectedPDF.fileUrl) && (
        <CustomPDFViewer
          pdf={selectedPDF}
          fileUrl={pdfService.getFileUrl(selectedPDF.fileUrl || `/uploads/${selectedPDF.file}`)}
          onClose={() => setSelectedPDF(null)}
        />
      )}
    </div>
  );
}