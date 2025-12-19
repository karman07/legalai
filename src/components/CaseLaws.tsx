import { useState, useEffect } from 'react';
import { Scale, Search, Filter, Calendar, FileText, X, Download, Eye, Loader2, ChevronLeft, ChevronRight, Building2, File, Image } from 'lucide-react';
import pdfService, { PDF } from '../services/pdfService';
import CustomPDFViewer from './CustomPDFViewer';

export default function CaseLaws() {
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedCourt, setSelectedCourt] = useState<'' | 'supreme' | 'high' | 'district'>('');
  const [selectedPDF, setSelectedPDF] = useState<PDF | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

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
    loadCategories();
  }, []);

  useEffect(() => {
    loadPDFs();
  }, [page, selectedCategory, selectedYear, selectedCourt]);

  const loadCategories = async () => {
    try {
      const response = await pdfService.getCategories();
      setCategories(response.categories);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadPDFs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await pdfService.getPDFs({
        page,
        limit: 12,
        category: selectedCategory || undefined,
        year: selectedYear ? parseInt(selectedYear) : undefined,
        courtLevel: selectedCourt || undefined,
      });
      setPdfs(response.items);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load case laws');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadPDFs();
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await pdfService.searchPDFs(searchTerm, {
        page,
        limit: 12,
      });
      setPdfs(response.items);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedYear('');
    setSelectedCourt('');
    setPage(1);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const toggleExpanded = (cardId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const isExpanded = (cardId: string) => expandedCards[cardId] || false;

  return (
    <div className="max-w-7xl mx-0 lg:ml-4 lg:mr-0 p-4 lg:p-6 overflow-x-hidden">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Legal Documents & Resources</h1>
            <p className="text-slate-600">Browse and view legal documents, case laws, and study materials</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by title, case number, keywords, or document name..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all"
          >
            Search
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories && categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 min-w-[150px]">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={selectedYear}
                onChange={(e) => { setSelectedYear(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={selectedCourt}
                onChange={(e) => { setSelectedCourt(e.target.value as any); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="">All Courts</option>
                <option value="supreme">Supreme Court</option>
                <option value="high">High Court</option>
                <option value="district">District Court</option>
              </select>
            </div>
          </div>

          {(searchTerm || selectedCategory || selectedYear || selectedCourt) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center gap-2"
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

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && pdfs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-600 mb-2">No documents found</h3>
          <p className="text-slate-500">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Document Grid */}
      {!loading && pdfs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {pdfs.map((pdf) => {
            const FileIcon = getFileIcon(pdf.fileName);
            const fileType = getFileType(pdf.fileName);
            
            return (
              <div
                key={pdf._id}
                className="group bg-white rounded-2xl overflow-hidden border-2 border-slate-200 hover:border-amber-400 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Header Section */}
                <div className="p-6 border-b border-slate-200">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <FileIcon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-amber-600 transition-colors leading-tight">
                        {pdf.caseTitle || pdf.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        {pdf.year && (
                          <span className="inline-flex items-center px-3 py-1 border-2 border-amber-500 text-amber-700 text-xs font-bold rounded-lg">
                            {pdf.year}
                          </span>
                        )}
                        {pdf.category && (
                          <span className="inline-flex items-center px-3 py-1 border-2 border-slate-300 text-slate-700 text-xs font-semibold rounded-lg">
                            {pdf.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 space-y-4">
                  {/* Citation */}
                  {pdf.citation && (
                    <div className="border-l-4 border-amber-500 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-amber-600" />
                        <p className="text-xs text-slate-600 font-bold uppercase tracking-wide">Citation</p>
                      </div>
                      <p className="text-sm font-mono text-slate-900 font-medium leading-relaxed">{pdf.citation}</p>
                    </div>
                  )}

                  {/* Case Number */}
                  {pdf.caseNumber && (
                    <div className="border-l-4 border-slate-400 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-slate-600" />
                        <p className="text-xs text-slate-600 font-bold uppercase tracking-wide">Case Number</p>
                      </div>
                      <p className="text-sm font-mono text-slate-900 font-medium">{pdf.caseNumber}</p>
                    </div>
                  )}

                  {/* Court Information */}
                  {pdf.court && (
                    <div className="border-l-4 border-amber-500 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-amber-600" />
                        <p className="text-xs text-slate-600 font-bold uppercase tracking-wide">Court</p>
                      </div>
                      <p className="text-sm text-slate-900 font-bold mb-2">{pdf.court.name}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center px-2 py-1 border border-amber-400 text-amber-700 text-xs font-semibold rounded-lg capitalize">
                          {pdf.court.level} Court
                        </span>
                        {pdf.court.state && (
                          <span className="inline-flex items-center px-2 py-1 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg">
                            {pdf.court.state}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Judgment Date */}
                  {pdf.judgmentDate && (
                    <div className="border-l-4 border-slate-400 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-slate-600" />
                        <p className="text-xs text-slate-600 font-bold uppercase tracking-wide">Judgment Date</p>
                      </div>
                      <p className="text-sm text-slate-900 font-medium">
                        {new Date(pdf.judgmentDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                  {/* Judges Section */}
                  {pdf.judges && pdf.judges.length > 0 && (
                    <div className="border-l-4 border-amber-500 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-3">
                        <Scale className="w-4 h-4 text-amber-600" />
                        <p className="text-xs text-slate-600 font-bold uppercase tracking-wide">Presiding Judges</p>
                      </div>
                      <div className="space-y-2">
                        {pdf.judges.slice(0, 2).map((judge, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-slate-900">
                            <div className="w-1.5 h-1.5 rounded-full border-2 border-amber-500"></div>
                            <span className="font-medium">{judge}</span>
                          </div>
                        ))}
                        {pdf.judges.length > 2 && (
                          <button className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 mt-2">
                            <span>+{pdf.judges.length - 2} more judges</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {pdf.description && (
                    <div className="border-l-3 border-slate-500 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <p className="text-xs text-slate-700 font-bold uppercase tracking-wide">Document Description</p>
                      </div>
                      <p className={`text-sm text-slate-800 leading-relaxed ${!isExpanded(`${pdf._id}-desc`) && pdf.description.length > 150 ? 'line-clamp-3' : ''}`}>
                        {pdf.description}
                      </p>
                      {pdf.description.length > 150 && (
                        <button
                          onClick={() => toggleExpanded(`${pdf._id}-desc`)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-semibold mt-2 flex items-center gap-1"
                        >
                          {isExpanded(`${pdf._id}-desc`) ? '← Show Less' : 'Read More →'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Summary Section */}
                  {pdf.summary && (
                    <div className="border-l-3 border-indigo-500 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Scale className="w-4 h-4 text-indigo-600" />
                        <p className="text-xs text-slate-700 font-bold uppercase tracking-wide">Case Summary</p>
                      </div>
                      <p className={`text-sm text-slate-800 leading-relaxed ${!isExpanded(`${pdf._id}-summary`) && pdf.summary.length > 200 ? 'line-clamp-4' : ''}`}>
                        {pdf.summary}
                      </p>
                      {pdf.summary.length > 200 && (
                        <button
                          onClick={() => toggleExpanded(`${pdf._id}-summary`)}
                          className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold mt-2 flex items-center gap-1"
                        >
                          {isExpanded(`${pdf._id}-summary`) ? '← Show Less' : 'Read More →'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Full Text Preview */}
                  {pdf.fullText && (
                    <div className="border-l-3 border-slate-500 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-slate-600" />
                        <p className="text-xs text-slate-700 font-bold uppercase tracking-wide">Full Judgment Text</p>
                      </div>
                      <p className={`text-sm text-slate-800 leading-relaxed ${!isExpanded(`${pdf._id}-fulltext`) ? 'line-clamp-3' : ''}`}>
                        {pdf.fullText}
                      </p>
                      {pdf.fullText.length > 200 && (
                        <button
                          onClick={() => toggleExpanded(`${pdf._id}-fulltext`)}
                          className="text-xs text-slate-600 hover:text-slate-700 font-semibold mt-2 flex items-center gap-1"
                        >
                          {isExpanded(`${pdf._id}-fulltext`) ? '← Show Less' : 'Read More →'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Keywords */}
                  {pdf.keywords && pdf.keywords.length > 0 && (
                    <div className="border-l-4 border-slate-400 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-slate-600 text-base font-bold">#</span>
                        <p className="text-xs text-slate-600 font-bold uppercase tracking-wide">Legal Keywords</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {pdf.keywords.slice(0, 5).map((keyword, idx) => (
                          <span key={idx} className="inline-flex items-center px-3 py-1 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg">
                            {keyword}
                          </span>
                        ))}
                        {pdf.keywords.length > 5 && (
                          <span className="inline-flex items-center px-3 py-1 border border-amber-400 text-amber-700 text-xs font-semibold rounded-lg">
                            +{pdf.keywords.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* File Info */}
                  <div className="pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-3">
                        {pdf.fileSize && (
                          <div className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            <span className="font-medium">{formatFileSize(pdf.fileSize)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <File className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-medium uppercase">{pdf.fileName.split('.').pop()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
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
                </div>

                {/* Action Buttons */}
                <div className="p-5 border-t border-slate-200 flex items-center gap-3">
                  <button
                    onClick={() => setSelectedPDF(pdf)}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 px-5 rounded-xl transition-all flex items-center justify-center gap-2 group"
                  >
                    <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>View {fileType === 'image' ? 'Image' : 'Document'}</span>
                  </button>
                  <a
                    href={pdfService.getFileUrl(pdf.fileUrl)}
                    download={pdf.fileName}
                    className="p-3 border-2 border-slate-300 hover:border-amber-500 rounded-xl transition-all group"
                    title={`Download ${pdf.fileName}`}
                  >
                    <Download className="w-5 h-5 text-slate-700 group-hover:text-amber-600 group-hover:scale-110 transition-all" />
                  </a>
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
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="px-4 py-2 text-slate-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Custom PDF Viewer */}
      {selectedPDF && (
        <CustomPDFViewer
          pdf={selectedPDF}
          fileUrl={pdfService.getFileUrl(selectedPDF.fileUrl)}
          onClose={() => setSelectedPDF(null)}
        />
      )}
    </div>
  );
}