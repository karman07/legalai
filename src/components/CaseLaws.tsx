import { useState, useEffect } from 'react';
import { Scale, Search, FileText, X, Download, Eye, ChevronLeft, ChevronRight, Building2, File, Image, Calendar } from 'lucide-react';

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

export default function CaseLaws() {
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedPDF, setSelectedPDF] = useState<PDF | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeSearch, setActiveSearch] = useState('');

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
    fetchDocs(page, activeSearch);
  }, [page, activeSearch]);

  const fetchDocs = async (pg: number, query: string) => {
    setLoading(true);
    setError('');
    try {
      const response = query.trim()
        ? await pdfService.searchPDFs(query, { page: pg, limit: 12 })
        : await pdfService.getPDFs({ page: pg, limit: 12 });
      setPdfs(response.items);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load case laws');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    setActiveSearch(searchTerm);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPage(1);
    setActiveSearch('');
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
            <p className="text-brand-500 dark:text-brand-400 text-sm">Browse legal documents, case laws and study materials</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-3 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by title, case number, keywords…"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-brand-800 border border-brand-200 dark:border-brand-700 rounded-xl text-brand-800 dark:text-brand-100 placeholder:text-brand-400 dark:placeholder:text-brand-500 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-5 py-2.5 bg-brand-900 dark:bg-brand-700 hover:bg-brand-800 dark:hover:bg-brand-600 text-white font-semibold rounded-xl transition-all text-sm"
          >
            Search
          </button>
          {searchTerm && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 bg-brand-100 dark:bg-brand-800 hover:bg-brand-200 dark:hover:bg-brand-700 text-brand-600 dark:text-brand-300 rounded-xl transition-colors flex items-center gap-1.5 text-sm"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Skeleton grid on initial load */}
      {loading && pdfs.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 12 }).map((_, i) => <PDFSkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty State */}
      {!loading && pdfs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-brand-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-brand-600 dark:text-brand-300 mb-2">No documents found</h3>
          <p className="text-brand-500 dark:text-brand-400">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Document Grid – keep visible with reduced opacity while loading next page */}
      {pdfs.length > 0 && (
        <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          {pdfs.map((pdf) => {
            const fileName = pdf.file || pdf.fileUrl?.split('/').pop() || 'document.pdf';
            const FileIcon = getFileIcon(fileName);
            const fileType = getFileType(fileName);
            const fileUrlToUse = pdf.fileUrl || `/uploads/${pdf.file}`;

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
                      {pdf.citation && (
                        <p className="text-xs font-mono text-brand-500 dark:text-brand-400 truncate">{pdf.citation}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 space-y-2.5 flex-1">
                  {/* Diary Number */}
                  {pdf.diary_no && (
                    <div className="flex items-start gap-2">
                      <FileText className="w-3.5 h-3.5 text-brand-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-brand-400 dark:text-brand-500 uppercase tracking-wider mb-0.5">Diary No.</p>
                        <p className="text-sm font-mono text-brand-800 dark:text-brand-200">{pdf.diary_no}</p>
                      </div>
                    </div>
                  )}

                  {/* Case Number */}
                  {pdf.case_no && (
                    <div className="border-l-4 border-brand-400 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-brand-600" />
                        <p className="text-xs text-brand-600 dark:text-brand-300 font-bold uppercase tracking-wide">Case Number</p>
                      </div>
                      <p className="text-sm font-mono text-brand-900 dark:text-brand-100 font-medium">{pdf.case_no}</p>
                    </div>
                  )}

                  {/* Petitioner */}
                  {pdf.pet && (
                    <div className="border-l-4 border-gold-500 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Scale className="w-4 h-4 text-gold-600" />
                        <p className="text-xs text-brand-600 dark:text-brand-300 font-bold uppercase tracking-wide">Petitioner</p>
                      </div>
                      <p className="text-sm text-brand-900 dark:text-brand-100 font-medium">{pdf.pet}</p>
                    </div>
                  )}

                  {/* Petitioner Advocate */}
                  {pdf.pet_adv && (
                    <div className="border-l-4 border-brand-400 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-4 h-4 text-brand-600" />
                        <p className="text-xs text-brand-600 dark:text-brand-300 font-bold uppercase tracking-wide">Petitioner Advocate</p>
                      </div>
                      <p className="text-sm text-brand-900 dark:text-brand-100 font-medium">{pdf.pet_adv}</p>
                    </div>
                  )}

                  {/* Respondent Advocate */}
                  {pdf.res_adv && (
                    <div className="border-l-4 border-brand-400 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-4 h-4 text-brand-600" />
                        <p className="text-xs text-brand-600 dark:text-brand-300 font-bold uppercase tracking-wide">Respondent Advocate</p>
                      </div>
                      <p className="text-sm text-brand-900 dark:text-brand-100 font-medium">{pdf.res_adv}</p>
                    </div>
                  )}

                  {/* Bench */}
                  {pdf.bench && (
                    <div className="border-l-4 border-gold-500 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Scale className="w-4 h-4 text-gold-600" />
                        <p className="text-xs text-brand-600 dark:text-brand-300 font-bold uppercase tracking-wide">Bench</p>
                      </div>
                      <p className="text-sm text-brand-900 dark:text-brand-100 font-medium">{pdf.bench}</p>
                    </div>
                  )}

                  {/* Judgement By */}
                  {pdf.judgement_by && (
                    <div className="border-l-4 border-gold-500 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Scale className="w-4 h-4 text-gold-600" />
                        <p className="text-xs text-brand-600 dark:text-brand-300 font-bold uppercase tracking-wide">Judgement By</p>
                      </div>
                      <p className="text-sm text-brand-900 dark:text-brand-100 font-medium">{pdf.judgement_by}</p>
                    </div>
                  )}

                  {/* Judgment Date */}
                  {pdf.judgment_dates && (
                    <div className="border-l-4 border-brand-400 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-brand-600" />
                        <p className="text-xs text-brand-600 dark:text-brand-300 font-bold uppercase tracking-wide">Judgment Date</p>
                      </div>
                      <p className="text-sm text-brand-900 dark:text-brand-100 font-medium">
                        {new Date(pdf.judgment_dates).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                  {/* Link */}
                  {pdf.link && (
                    <div className="border-l-4 border-brand-400 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-brand-600" />
                        <p className="text-xs text-brand-600 dark:text-brand-300 font-bold uppercase tracking-wide">External Link</p>
                      </div>
                      <a href={pdf.link} target="_blank" rel="noopener noreferrer" className="text-sm text-gold-600 hover:text-gold-700 font-medium underline break-all">
                        {pdf.link}
                      </a>
                    </div>
                  )}

                  {/* File Info */}
                  {pdf.createdAt && (
                    <div className="pt-3 border-t border-brand-200 dark:border-brand-700">
                      <div className="flex items-center justify-between text-xs text-brand-500 dark:text-brand-400">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <File className="w-3.5 h-3.5 text-brand-500" />
                            <span className="font-medium uppercase">{fileName.split('.').pop()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-brand-500" />
                          <span className="font-medium">
                            {new Date(pdf.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="px-4 py-3 border-t border-brand-100 dark:border-brand-700/60 flex items-center gap-2">
                  {(pdf.file || pdf.fileUrl) && (
                    <>
                      <button
                        onClick={() => setSelectedPDF(pdf)}
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
      {totalPages > 1 && (
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