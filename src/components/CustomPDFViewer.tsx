import { useState, useRef, useEffect } from 'react';
import { X, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, StickyNote, Menu, FileText } from 'lucide-react';
import { PDF } from '../services/pdfService';
import NotesPanel from './NotesPanel';
import ReactMarkdown from 'react-markdown';

interface CustomPDFViewerProps {
  pdf: PDF;
  fileUrl: string;
  onClose: () => void;
}

const getFileType = (url: string, fileName?: string) => {
  const name = fileName || url;
  if (name.endsWith('.pdf')) return 'pdf';
  if (name.endsWith('.md')) return 'markdown';
  if (name.endsWith('.txt')) return 'text';
  return 'pdf';
};

export default function CustomPDFViewer({ pdf, fileUrl, onClose }: CustomPDFViewerProps) {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [thumbnails, setThumbnails] = useState<{ [key: number]: string }>({});
  const [fileType, setFileType] = useState<'pdf' | 'markdown' | 'text'>('pdf');
  const [textContent, setTextContent] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const type = getFileType(fileUrl, pdf.fileName);
    setFileType(type);

    if (type === 'pdf') {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.async = true;
      script.onload = () => {
        (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        loadPDF();
      };
      document.body.appendChild(script);
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    } else {
      loadTextFile();
    }
  }, []);

  const loadTextFile = async () => {
    setLoading(true);
    try {
      const response = await fetch(fileUrl);
      const text = await response.text();
      setTextContent(text);
      setLoading(false);
    } catch (error) {
      console.error('Error loading file:', error);
      setLoading(false);
    }
  };

  const loadPDF = async () => {
    setLoading(true);
    try {
      const pdfDocument = await (window as any).pdfjsLib.getDocument({
        url: fileUrl,
        withCredentials: false,
      }).promise;
      setPdfDoc(pdfDocument);
      setTotalPages(pdfDocument.numPages);
      setCurrentPage(1);
      setLoading(false);
    } catch (error) {
      console.error('Error loading PDF:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    const renderPage = async () => {
      const page = await pdfDoc.getPage(currentPage);
      const canvas = canvasRef.current;
      const context = canvas!.getContext('2d');

      const viewport = page.getViewport({ scale, rotation });
      canvas!.height = viewport.height;
      canvas!.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;
    };

    renderPage();
  }, [pdfDoc, currentPage, scale, rotation]);

  useEffect(() => {
    if (!pdfDoc || !showThumbnails) return;

    const generateThumbnails = async () => {
      const thumbs: { [key: number]: string } = {};
      for (let i = 1; i <= Math.min(totalPages, 20); i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
        thumbs[i] = canvas.toDataURL();
      }
      setThumbnails(thumbs);
    };

    generateThumbnails();
  }, [pdfDoc, showThumbnails, totalPages]);

  return (
    <div className="fixed inset-0 bg-white flex z-50">
      <div className="w-full h-full flex flex-col">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 shadow-lg">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-xl font-bold text-white truncate">{pdf.caseTitle || pdf.title}</h2>
              {pdf.citation && <p className="text-xs sm:text-sm text-amber-100 font-mono hidden sm:block">{pdf.citation}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 ml-2 sm:ml-4">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="px-2 sm:px-4 py-2 bg-white/90 hover:bg-white active:bg-white text-amber-600 rounded-lg flex items-center gap-1 sm:gap-2 transition-all font-semibold shadow-md text-sm touch-manipulation"
            >
              <StickyNote className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Notes</span>
            </button>
            <a
              href={fileUrl}
              download={pdf.fileName}
              className="p-2 bg-white/90 hover:bg-white active:bg-white rounded-lg transition-all shadow-md touch-manipulation"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
            </a>
            <button onClick={onClose} className="p-2 bg-white/90 hover:bg-white active:bg-white rounded-lg transition-all shadow-md touch-manipulation">
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Thumbnail Sidebar - Hidden on mobile */}
          {showThumbnails && fileType === 'pdf' && (
            <div className="hidden md:block w-48 bg-slate-50 border-r border-slate-200 overflow-y-auto">
              <div className="p-3">
                <h3 className="text-slate-800 font-semibold mb-3 text-sm">Pages</h3>
                <div className="space-y-2">
                  {[...Array(Math.min(totalPages, 20))].map((_, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                        currentPage === idx + 1
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      {thumbnails[idx + 1] ? (
                        <img src={thumbnails[idx + 1]} alt={`Page ${idx + 1}`} className="w-full" />
                      ) : (
                        <div className="aspect-[8.5/11] bg-white flex items-center justify-center">
                          <span className="text-slate-400 text-xs">Loading...</span>
                        </div>
                      )}
                      <div className="text-center py-1 text-xs font-medium text-slate-600">
                        {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Enhanced Toolbar */}
            {fileType === 'pdf' && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-3 sm:px-6 py-3 bg-white border-b border-slate-200 shadow-sm gap-3 sm:gap-0">
              <div className="flex items-center gap-2 sm:gap-3 justify-center sm:justify-start">
                <button
                  onClick={() => setShowThumbnails(!showThumbnails)}
                  className="hidden md:block p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 text-slate-700 transition-all touch-manipulation"
                  title="Toggle thumbnails"
                >
                  <Menu className="w-5 h-5" />
                </button>
                
                <div className="hidden md:block w-px h-6 bg-slate-300"></div>

                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 disabled:opacity-30 text-slate-700 transition-all touch-manipulation"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg min-w-[100px] sm:min-w-[120px] justify-center shadow-md">
                  {totalPages > 0 ? (
                    <>
                      <span className="font-bold text-white text-sm sm:text-base">{currentPage}</span>
                      <span className="text-amber-100 text-sm sm:text-base">/</span>
                      <span className="text-white text-sm sm:text-base">{totalPages}</span>
                    </>
                  ) : (
                    <span className="text-white text-xs sm:text-sm">Loading...</span>
                  )}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 disabled:opacity-30 text-slate-700 transition-all touch-manipulation"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 justify-center sm:justify-end">
                <button
                  onClick={() => setScale(s => Math.max(0.5, s - 0.25))}
                  disabled={scale <= 0.5}
                  className="p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 disabled:opacity-30 text-slate-700 transition-all touch-manipulation"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>

                <span className="text-xs sm:text-sm font-semibold text-slate-700 min-w-[50px] sm:min-w-[60px] text-center px-2 sm:px-3 py-1 bg-slate-100 rounded-lg">
                  {Math.round(scale * 100)}%
                </span>

                <button
                  onClick={() => setScale(s => Math.min(3, s + 0.25))}
                  disabled={scale >= 3}
                  className="p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 disabled:opacity-30 text-slate-700 transition-all touch-manipulation"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>

                <div className="w-px h-6 bg-slate-300"></div>

                <button
                  onClick={() => setRotation(r => (r + 90) % 360)}
                  className="p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 text-slate-700 transition-all touch-manipulation"
                >
                  <RotateCw className="w-5 h-5" />
                </button>
              </div>
            </div>
            )}

            {/* Content Display */}
            <div className="flex-1 overflow-auto bg-slate-100 p-2 sm:p-4 md:p-8">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <div className="text-slate-700 text-xl font-semibold">Loading...</div>
                </div>
              ) : fileType === 'pdf' ? (
                <div className="flex justify-center">
                  <div className="bg-white shadow-2xl rounded-lg overflow-hidden" style={{ width: 'fit-content' }}>
                    <canvas ref={canvasRef} className="max-w-full h-auto" />
                  </div>
                </div>
              ) : fileType === 'markdown' ? (
                <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-lg p-8">
                  <div className="prose prose-slate prose-amber max-w-none prose-headings:text-slate-900 prose-h1:text-3xl prose-h1:font-bold prose-h1:border-b prose-h1:border-amber-200 prose-h1:pb-3 prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-8 prose-h3:text-xl prose-h3:font-semibold prose-p:text-slate-700 prose-p:leading-relaxed prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 prose-strong:font-semibold prose-code:text-amber-700 prose-code:bg-amber-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-blockquote:border-l-4 prose-blockquote:border-amber-500 prose-blockquote:bg-amber-50 prose-blockquote:italic prose-ul:list-disc prose-ol:list-decimal prose-li:text-slate-700">
                    <ReactMarkdown>{textContent}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-lg p-8">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700 leading-relaxed">{textContent}</pre>
                </div>
              )}
            </div>
          </div>

          {/* Notes Panel - Full screen on mobile, sidebar on desktop */}
          {showNotes && (
            <div className="fixed inset-0 md:relative md:inset-auto z-50 md:z-auto">
              <NotesPanel
                referenceType="pdf"
                referenceId={pdf._id}
                currentContext={currentPage}
                onClose={() => setShowNotes(false)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
