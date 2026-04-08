import { useState, useRef, useEffect, useCallback } from 'react';
import {
  X, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw,
  StickyNote, Menu, FileText, Volume2, VolumeX, Play, Pause, Square,
  Settings2, ChevronDown, Sparkles, Send, Loader2,
} from 'lucide-react';
import { PDF } from '../services/pdfService';
import NotesPanel from './NotesPanel';
import ReactMarkdown from 'react-markdown';
import chatService from '../services/chatService';

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

  // ── TTS state ──────────────────────────────────────────────
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const [ttsPaused, setTtsPaused] = useState(false);
  const [ttsRate, setTtsRate] = useState(1.0);
  const [ttsVoice, setTtsVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [ttsText, setTtsText] = useState('');
  const [showTtsPanel, setShowTtsPanel] = useState(false);
  const [ttsSupported] = useState(() => 'speechSynthesis' in window);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // ── Text-selection AI chat state ───────────────────────────
  const [selectionPopup, setSelectionPopup] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiConversationId, setAiConversationId] = useState<string | null>(null);
  const aiChatRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const chatStorageKey = `ai-chat:pdf:${pdf._id}`;

  type ChatMessageItem = { role: 'user' | 'ai'; text: string };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(chatStorageKey);
      if (!saved) return;
      const parsed = JSON.parse(saved) as {
        aiMessages?: ChatMessageItem[];
        aiConversationId?: string | null;
        aiQuery?: string;
      };
      setAiMessages(parsed.aiMessages ?? []);
      setAiConversationId(parsed.aiConversationId ?? null);
      setAiQuery(parsed.aiQuery ?? '');
    } catch {
      // Ignore malformed localStorage payloads
    }
  }, [chatStorageKey]);

  useEffect(() => {
    const payload = JSON.stringify({ aiMessages, aiConversationId, aiQuery });
    localStorage.setItem(chatStorageKey, payload);
  }, [chatStorageKey, aiMessages, aiConversationId, aiQuery]);

  // Load available TTS voices
  useEffect(() => {
    if (!ttsSupported) return;
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en') || v.lang.startsWith('hi'));
      setVoices(available);
      if (available.length > 0 && !ttsVoice) setTtsVoice(available[0]);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, [ttsSupported]);

  // Extract text from current PDF page whenever page/doc changes
  const extractPageText = useCallback(async (): Promise<string> => {
    if (!pdfDoc) return textContent;
    if (fileType !== 'pdf') return textContent;
    try {
      const page = await pdfDoc.getPage(currentPage);
      const content = await page.getTextContent();
      return content.items.map((item: any) => item.str).join(' ').replace(/\s+/g, ' ').trim();
    } catch {
      return '';
    }
  }, [pdfDoc, currentPage, fileType, textContent]);

  // Stop TTS when page changes
  useEffect(() => {
    stopTTS();
  }, [currentPage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  const stopTTS = () => {
    window.speechSynthesis?.cancel();
    setTtsPlaying(false);
    setTtsPaused(false);
  };

  const playTTS = async () => {
    if (!ttsSupported) return;
    if (ttsPaused) {
      window.speechSynthesis.resume();
      setTtsPlaying(true);
      setTtsPaused(false);
      return;
    }
    const text = await extractPageText();
    if (!text) return;
    setTtsText(text.slice(0, 5000));
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text.slice(0, 5000));
    utterance.rate = ttsRate;
    utterance.lang = 'en-IN';
    if (ttsVoice) utterance.voice = ttsVoice;
    utterance.onstart = () => { setTtsPlaying(true); setTtsPaused(false); };
    utterance.onend = () => { setTtsPlaying(false); setTtsPaused(false); };
    utterance.onerror = () => { setTtsPlaying(false); setTtsPaused(false); };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const pauseTTS = () => {
    window.speechSynthesis.pause();
    setTtsPlaying(false);
    setTtsPaused(true);
  };

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

  // ── Text-selection handler ─────────────────────────────────
  const handleContentMouseUp = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? '';
    if (text.length > 3) {
      const range = selection!.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedText(text);
      setSelectionPopup({ x: rect.left + rect.width / 2, y: rect.top - 8 });
    } else {
      setSelectionPopup(null);
    }
  }, []);

  const openAiChat = useCallback(() => {
    if (selectedText) {
      setAiQuery(prev => prev.trim() ? prev : `Selected text:\n"${selectedText}"\n\nQuestion: `);
    }
    setShowAiChat(true);
    setSelectionPopup(null);
  }, [selectedText]);

  const sendAiMessage = useCallback(async () => {
    const rawQuery = aiQuery.trim();
    if (!rawQuery || aiLoading) return;

    const userMsg = { role: 'user' as const, text: rawQuery };
    setAiMessages(prev => [...prev, userMsg]);
    setAiQuery('');
    setAiLoading(true);

    try {
      const res = await chatService.sendMessage(rawQuery, aiConversationId);
      setAiConversationId(res.conversationId);
      setAiMessages(prev => [...prev, { role: 'ai' as const, text: res.response }]);
    } catch (err: any) {
      setAiMessages(prev => [...prev, { role: 'ai' as const, text: `Error: ${err.message ?? 'Failed to get response'}` }]);
    } finally {
      setAiLoading(false);
    }
  }, [aiQuery, aiLoading, selectedText, aiConversationId]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (aiChatRef.current) {
      aiChatRef.current.scrollTop = aiChatRef.current.scrollHeight;
    }
  }, [aiMessages]);

  // Close popup on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (selectionPopup && !(e.target as Element)?.closest('[data-ai-popup]')) {
        setSelectionPopup(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [selectionPopup]);

  return (
    <div className="fixed inset-0 bg-brand-50 flex z-50 flex-col">
      <div className="w-full h-full flex flex-col">

        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-3 bg-brand-900 border-b border-brand-800 flex-shrink-0">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white truncate leading-tight">
                {pdf.caseTitle || pdf.title}
              </h2>
              {pdf.citation && (
                <p className="text-xs text-brand-400 font-mono hidden sm:block truncate">{pdf.citation}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 ml-3 flex-shrink-0">
            {ttsSupported && fileType === 'pdf' && (
              <button
                onClick={() => setShowTtsPanel(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  showTtsPanel
                    ? 'bg-gold-500 text-white'
                    : 'bg-brand-800 hover:bg-brand-700 text-brand-300'
                }`}
                title="Listen to this page"
              >
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline">Listen</span>
              </button>
            )}
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-800 hover:bg-brand-700 text-brand-300 hover:text-white rounded-lg text-xs font-semibold transition-all"
            >
              <StickyNote className="w-4 h-4" />
              <span className="hidden sm:inline">Notes</span>
            </button>
            <a
              href={fileUrl}
              download={pdf.fileName}
              className="p-2 bg-brand-800 hover:bg-brand-700 text-brand-300 hover:text-white rounded-lg transition-all"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={() => { stopTTS(); onClose(); }}
              className="p-2 bg-brand-800 hover:bg-red-500/20 text-brand-300 hover:text-red-400 rounded-lg transition-all"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── TTS Panel ──────────────────────────────────── */}
        {showTtsPanel && ttsSupported && fileType === 'pdf' && (
          <div className="flex-shrink-0 bg-brand-900 border-b border-brand-700 px-3 sm:px-5 py-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Playback controls */}
              <div className="flex items-center gap-1.5">
                {!ttsPlaying && !ttsPaused ? (
                  <button
                    onClick={playTTS}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gold-500 hover:bg-gold-400 text-white rounded-lg text-xs font-semibold transition-all"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Play Page {currentPage}</span>
                  </button>
                ) : ttsPlaying ? (
                  <button
                    onClick={pauseTTS}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-700 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold transition-all"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </button>
                ) : (
                  <button
                    onClick={playTTS}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gold-500 hover:bg-gold-400 text-white rounded-lg text-xs font-semibold transition-all"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Resume</span>
                  </button>
                )}
                {(ttsPlaying || ttsPaused) && (
                  <button
                    onClick={stopTTS}
                    className="p-1.5 bg-brand-700 hover:bg-red-500/20 text-brand-300 hover:text-red-400 rounded-lg transition-all"
                    title="Stop"
                  >
                    <Square className="w-3.5 h-3.5" />
                  </button>
                )}
                {(ttsPlaying || ttsPaused) && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gold-500/15 rounded-lg border border-gold-500/30">
                    <div className={`w-2 h-2 rounded-full ${ttsPlaying ? 'bg-gold-400 animate-pulse' : 'bg-brand-500'}`} />
                    <span className="text-xs font-medium text-gold-300">
                      {ttsPlaying ? 'Reading...' : 'Paused'}
                    </span>
                  </div>
                )}
              </div>

              {/* Speed control */}
              <div className="flex items-center gap-2 ml-auto">
                <Settings2 className="w-3.5 h-3.5 text-brand-500" />
                <span className="text-xs text-brand-400">Speed:</span>
                <div className="flex items-center gap-1">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                    <button
                      key={rate}
                      onClick={() => {
                        setTtsRate(rate);
                        if (utteranceRef.current) utteranceRef.current.rate = rate;
                      }}
                      className={`px-2 py-0.5 rounded text-xs font-mono font-semibold transition-all ${
                        ttsRate === rate
                          ? 'bg-gold-500 text-white'
                          : 'text-brand-400 hover:text-brand-200 hover:bg-brand-800'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>

                {/* Voice selector */}
                {voices.length > 1 && (
                  <div className="relative ml-2">
                    <select
                      value={ttsVoice?.name || ''}
                      onChange={e => {
                        const v = voices.find(v => v.name === e.target.value);
                        if (v) setTtsVoice(v);
                      }}
                      className="appearance-none bg-brand-800 border border-brand-700 text-brand-300 text-xs rounded-lg px-2.5 py-1.5 pr-6 focus:outline-none focus:border-gold-500 cursor-pointer"
                    >
                      {voices.map(v => (
                        <option key={v.name} value={v.name}>{v.name.split(' ')[0]}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-brand-500 pointer-events-none" />
                  </div>
                )}
              </div>
            </div>

            {ttsText && (
              <p className="mt-2 text-xs text-brand-500 truncate">
                <span className="text-brand-600 font-medium">Reading: </span>
                {ttsText.slice(0, 120)}…
              </p>
            )}
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          {/* Thumbnail Sidebar */}
          {showThumbnails && fileType === 'pdf' && (
            <div className="hidden md:flex w-44 bg-brand-900 border-r border-brand-800 flex-col overflow-y-auto">
              <div className="p-3">
                <h3 className="text-brand-400 font-semibold mb-3 text-xs uppercase tracking-wider">Pages</h3>
                <div className="space-y-2">
                  {[...Array(Math.min(totalPages, 20))].map((_, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                        currentPage === idx + 1
                          ? 'border-gold-500 ring-1 ring-gold-500/30'
                          : 'border-brand-700 hover:border-brand-600'
                      }`}
                    >
                      {thumbnails[idx + 1] ? (
                        <img src={thumbnails[idx + 1]} alt={`Page ${idx + 1}`} className="w-full" />
                      ) : (
                        <div className="aspect-[8.5/11] bg-brand-800 flex items-center justify-center">
                          <span className="text-brand-600 text-xs">…</span>
                        </div>
                      )}
                      <div className={`text-center py-1 text-xs font-semibold ${
                        currentPage === idx + 1 ? 'text-gold-400' : 'text-brand-500'
                      }`}>
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
            {/* Toolbar */}
            {fileType === 'pdf' && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-3 sm:px-5 py-2.5 bg-white border-b border-brand-200 gap-2 sm:gap-0 flex-shrink-0">
                <div className="flex items-center gap-1.5 sm:gap-2 justify-center sm:justify-start">
                  <button
                    onClick={() => setShowThumbnails(!showThumbnails)}
                    className="hidden md:flex p-2 rounded-lg hover:bg-brand-100 text-brand-500 transition-all"
                    title="Toggle thumbnails"
                  >
                    <Menu className="w-4 h-4" />
                  </button>
                  <div className="hidden md:block w-px h-5 bg-brand-200" />
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-brand-100 disabled:opacity-30 text-brand-600 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-900 rounded-lg min-w-[90px] justify-center">
                    {totalPages > 0 ? (
                      <>
                        <span className="font-bold text-white text-sm">{currentPage}</span>
                        <span className="text-brand-500 dark:text-brand-400 text-sm">/</span>
                        <span className="text-brand-300 text-sm">{totalPages}</span>
                      </>
                    ) : (
                      <span className="text-brand-400 text-xs">Loading…</span>
                    )}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-brand-100 disabled:opacity-30 text-brand-600 transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 justify-center sm:justify-end">
                  <button
                    onClick={() => setScale(s => Math.max(0.5, s - 0.25))}
                    disabled={scale <= 0.5}
                    className="p-2 rounded-lg hover:bg-brand-100 disabled:opacity-30 text-brand-600 transition-all"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-semibold text-brand-700 min-w-[48px] text-center px-2 py-1 bg-brand-50 border border-brand-200 rounded-lg">
                    {Math.round(scale * 100)}%
                  </span>
                  <button
                    onClick={() => setScale(s => Math.min(3, s + 0.25))}
                    disabled={scale >= 3}
                    className="p-2 rounded-lg hover:bg-brand-100 disabled:opacity-30 text-brand-600 transition-all"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <div className="w-px h-5 bg-brand-200" />
                  <button
                    onClick={() => setRotation(r => (r + 90) % 360)}
                    className="p-2 rounded-lg hover:bg-brand-100 text-brand-600 transition-all"
                    title="Rotate"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Content Display */}
            <div ref={contentRef} onMouseUp={handleContentMouseUp} className="flex-1 overflow-auto bg-brand-100 p-2 sm:p-4 md:p-8 select-text">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="w-12 h-12 border-3 border-gold-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-brand-600 font-semibold">Loading…</span>
                </div>
              ) : fileType === 'pdf' ? (
                <div className="flex justify-center">
                  <div className="bg-white shadow-elevated rounded-xl overflow-hidden" style={{ width: 'fit-content' }}>
                    <canvas ref={canvasRef} className="max-w-full h-auto" />
                  </div>
                </div>
              ) : fileType === 'markdown' ? (
                <div className="max-w-4xl mx-auto bg-white shadow-card rounded-2xl p-8 border border-brand-200">
                  <div className="prose prose-slate max-w-none prose-headings:text-brand-900 prose-h1:text-3xl prose-h1:font-bold prose-h2:text-xl prose-h2:font-semibold prose-p:text-brand-700 prose-a:text-gold-600 prose-strong:text-brand-900 prose-code:text-brand-700 prose-code:bg-brand-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-brand-900 prose-pre:text-brand-100 prose-blockquote:border-l-4 prose-blockquote:border-gold-500 prose-blockquote:bg-gold-50">
                    <ReactMarkdown>{textContent}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto bg-white shadow-card rounded-2xl p-8 border border-brand-200">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-brand-700 leading-relaxed">{textContent}</pre>
                </div>
              )}
            </div>
          </div>

          {/* Notes Panel */}
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

      {/* ── Text-Selection AI Popup Bubble ─────────────────── */}
      {selectionPopup && (
        <div
          data-ai-popup="true"
          style={{ position: 'fixed', left: selectionPopup.x, top: selectionPopup.y, transform: 'translate(-50%, -100%)' }}
          className="z-[200]"
        >
          <button
            onClick={openAiChat}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-900 hover:bg-brand-700 text-white rounded-full shadow-lg text-xs font-semibold border border-brand-600 transition-all whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            Ask AI
          </button>
        </div>
      )}

      {/* ── AI Chat Mini Panel ──────────────────────────────── */}
      {showAiChat && (
        <div className="fixed bottom-4 right-4 z-[200] w-[92vw] sm:w-[520px] bg-white rounded-2xl shadow-2xl border border-brand-200 flex flex-col overflow-hidden" style={{ maxHeight: '72vh' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-brand-900 text-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-400" />
              <div>
                <p className="font-semibold text-base leading-tight">Ask AI</p>
                <p className="text-[11px] text-brand-300">Context-aware legal assistant</p>
              </div>
            </div>
            <button
              onClick={() => setShowAiChat(false)}
              className="p-1 rounded-lg hover:bg-brand-700 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Selected text context badge */}
          {selectedText && (
            <div className="px-4 py-3 bg-gold-50 border-b border-gold-200 flex-shrink-0">
              <p className="text-xs text-gold-700 font-semibold mb-1">Selected text loaded in draft:</p>
              <p className="text-sm text-gold-800 line-clamp-2 italic">"{selectedText.slice(0, 180)}{selectedText.length > 180 ? '…' : ''}"</p>
            </div>
          )}

          {/* Messages */}
          <div ref={aiChatRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0" style={{ maxHeight: '44vh' }}>
            {aiMessages.length === 0 && (
              <p className="text-sm text-brand-400 text-center py-6">
                {selectedText ? 'Review the draft below and press send when ready.' : 'Ask anything about this document.'}
              </p>
            )}
            {aiMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-brand-900 text-white'
                    : 'bg-brand-50 text-brand-800 border border-brand-200'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {aiLoading && (
              <div className="flex justify-start">
                <div className="bg-brand-50 border border-brand-200 rounded-xl px-3 py-2 flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 text-brand-400 animate-spin" />
                  <span className="text-xs text-brand-500">Thinking…</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex items-end gap-2 p-4 border-t border-brand-200 flex-shrink-0 bg-white">
            <textarea
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAiMessage(); }
              }}
              placeholder="Write or edit your question before sending..."
              rows={4}
              className="flex-1 resize-none text-sm border border-brand-200 rounded-xl px-3.5 py-3 focus:outline-none focus:border-brand-500 text-brand-800 placeholder:text-brand-400"
            />
            <button
              onClick={sendAiMessage}
              disabled={!aiQuery.trim() || aiLoading}
              className="px-4 py-3 bg-brand-900 hover:bg-brand-700 disabled:opacity-40 text-white rounded-xl transition-all flex-shrink-0 text-sm font-semibold"
            >
              <span className="inline-flex items-center gap-1.5">
                <Send className="w-4 h-4" />
                Send
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
