import { useState, useEffect } from 'react';
import { Upload, Edit, Trash2, Eye, Search, FileText } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { mediaService } from '../../services/mediaService';
import type { PDF } from '../../types/media';
import { PDFUploadModal } from './PDFUploadModal';
import { PDFEditModal } from './PDFEditModal';

export const PDFManager = () => {
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingPDF, setEditingPDF] = useState<PDF | null>(null);

  const fetchPDFs = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (statusFilter) params.isActive = statusFilter === 'true';
      const data = await mediaService.listPDFs(params);
      setPdfs(data.pdfs);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPDFs();
  }, [page, limit, statusFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this PDF?')) return;
    try {
      await mediaService.deletePDF(id);
      fetchPDFs();
    } catch (e) {}
  };

  const filteredPDFs = pdfs.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.caseTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search PDFs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select>
          </div>
          <Button onClick={() => setShowUploadModal(true)} className="gap-2">
            <Upload className="w-4 h-4" /> Upload PDF
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredPDFs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">No PDFs found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPDFs.map((pdf) => (
              <Card key={pdf._id} className="hover:shadow-md transition-all border border-gray-200 dark:border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                            {pdf.title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                            {pdf.category && <span>{pdf.category}</span>}
                            {pdf.year && <span>• {pdf.year}</span>}
                            <span>• {formatFileSize(pdf.fileSize)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {pdf.isActive ? (
                            <span className="px-3 py-1 text-xs font-medium rounded-full border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400">
                              Active
                            </span>
                          ) : (
                            <span className="px-3 py-1 text-xs font-medium rounded-full border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>

                      {pdf.caseTitle && (
                        <div className="border-l-4 border-blue-500 pl-4">
                          <p className="font-medium text-gray-900 dark:text-white">{pdf.caseTitle}</p>
                          {pdf.caseNumber && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{pdf.caseNumber}</p>
                          )}
                        </div>
                      )}

                      {pdf.description && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {pdf.description}
                        </p>
                      )}

                      {pdf.summary && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                          {pdf.summary}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm">
                        {pdf.court && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Court:</span>
                            <span className="text-gray-600 dark:text-gray-400">{pdf.court.name}</span>
                          </div>
                        )}
                        {pdf.judges && pdf.judges.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Judges:</span>
                            <span className="text-gray-600 dark:text-gray-400">{pdf.judges.join(', ')}</span>
                          </div>
                        )}
                      </div>

                      {pdf.keywords && pdf.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {pdf.keywords.map((kw, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" onClick={() => window.open(pdf.fileUrl, '_blank')} className="gap-2">
                        <Eye className="w-4 h-4" /> View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingPDF(pdf)} className="gap-2">
                        <Edit className="w-4 h-4" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(pdf._id)} className="gap-2 text-red-600 hover:text-red-700 dark:text-red-400">
                        <Trash2 className="w-4 h-4" /> Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredPDFs.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">{page}</span>
              <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Next
              </Button>
              <Select value={String(limit)} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </Select>
            </div>
          </div>
        )}
      </div>

      {showUploadModal && (
        <PDFUploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            fetchPDFs();
          }}
        />
      )}

      {editingPDF && (
        <PDFEditModal
          pdf={editingPDF}
          onClose={() => setEditingPDF(null)}
          onSuccess={() => {
            setEditingPDF(null);
            fetchPDFs();
          }}
        />
      )}
    </>
  );
};
