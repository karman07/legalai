import { useState, useEffect, useRef, useCallback } from 'react';
import {
  BookOpen, CheckCircle, XCircle, RotateCcw, Trophy, Clock, Target,
  TrendingUp, Search, Loader2, AlertCircle, ChevronRight, ChevronLeft,
  Play, BookMarked, Flag, FastForward, Menu, X, Timer,
  BarChart2, Award,
} from 'lucide-react';
import quizService, { Quiz, QuizSubmitResponse } from '../services/quizService';
import notesService, { Note } from '../services/notesService';
import Dialog from './Dialog';
import { useAuth } from '../contexts/AuthContext';
import { incrementDashboardMetric } from '../lib/dashboardMetrics';

type ViewState = 'list' | 'quiz' | 'result';

// ── Countdown timer hook ──────────────────────────────────────────────────────
function useCountdown(duration: number, key: number, active: boolean, onExpire: () => void) {
  const [remaining, setRemaining] = useState(duration);
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;

  useEffect(() => { setRemaining(duration); }, [duration, key]);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { clearInterval(id); setTimeout(() => expireRef.current(), 0); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [active, duration, key]);

  const pct = duration > 0 ? (remaining / duration) * 100 : 100;
  const mm = Math.floor(remaining / 60).toString().padStart(2, '0');
  const ss = (remaining % 60).toString().padStart(2, '0');
  return { remaining, display: `${mm}:${ss}`, pct };
}

// ── Option label helper ───────────────────────────────────────────────────────
const OPT = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function MCQQuiz() {
  const { user } = useAuth();
  const [viewState, setViewState] = useState<ViewState>('list');

  // List state
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [subjects, setSubjects] = useState<Array<{ name: string; pyqCount: number; mockCount: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [typeFilter, setTypeFilter] = useState<'pyq' | 'mocktest'>('pyq');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // Quiz state
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [skipped, setSkipped] = useState<boolean[]>([]);
  const [markedForReview, setMarkedForReview] = useState<boolean[]>([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizSubmitResponse | null>(null);
  const [questionNotes, setQuestionNotes] = useState<Record<number, Note | null>>({});
  const [timerDuration, setTimerDuration] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Refs for stable timer callback
  const quizRef = useRef<Quiz | null>(null);
  const answersRef = useRef<(number | null)[]>([]);
  quizRef.current = selectedQuiz;
  answersRef.current = userAnswers;

  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'info' | 'confirm';
    title?: string;
    message: string;
    onConfirm?: () => void;
  }>({ isOpen: false, type: 'info', message: '' });

  // Timer
  const handleExpire = useCallback(() => {
    const quiz = quizRef.current;
    const answers = answersRef.current;
    if (!quiz) return;
    setTimedOut(true);
    setSubmitting(true);
    quizService.submitQuiz(quiz._id, answers.map(a => a ?? -1))
      .then(r => { setQuizResult(r); setViewState('result'); })
      .catch(() => setViewState('result'))
      .finally(() => setSubmitting(false));
  }, []);

  const { display: timerDisplay, pct: timerPct } = useCountdown(
    timerDuration, timerKey, viewState === 'quiz', handleExpire
  );

  // ── Load subjects once ────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setSubjectsLoading(true);
      try {
        const [p, m] = await Promise.all([
          quizService.getQuizzes({ type: 'pyq', limit: 200 }),
          quizService.getQuizzes({ type: 'mocktest', limit: 200 }),
        ]);
        const map: Record<string, { pyqCount: number; mockCount: number }> = {};
        p.items.forEach(q => {
          if (!map[q.topic]) map[q.topic] = { pyqCount: 0, mockCount: 0 };
          map[q.topic].pyqCount++;
        });
        m.items.forEach(q => {
          if (!map[q.topic]) map[q.topic] = { pyqCount: 0, mockCount: 0 };
          map[q.topic].mockCount++;
        });
        setSubjects(
          Object.entries(map)
            .map(([name, c]) => ({ name, ...c }))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      } catch {}
      setSubjectsLoading(false);
    })();
  }, []);

  // ── Load quizzes ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (viewState !== 'list') return;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const r = await quizService.getQuizzes({
          topic: selectedSubject || undefined,
          type: typeFilter,
          page,
          limit: 12,
        });
        setQuizzes(r.items);
        setTotalPages(r.totalPages);
      } catch (e: any) {
        setError(e.message || 'Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    })();
  }, [page, selectedSubject, typeFilter, viewState]);

  // ── Start quiz ───────────────────────────────────────────────────────────
  const startQuiz = async (quiz: Quiz) => {
    setLoading(true);
    setError('');
    try {
      const full = await quizService.getQuiz(quiz._id);
      const len = full.questions.length;
      setSelectedQuiz(full);
      setUserAnswers(new Array(len).fill(null));
      setSkipped(new Array(len).fill(false));
      setMarkedForReview(new Array(len).fill(false));
      setCurrentQuestion(0);
      setTimedOut(false);
      setQuizResult(null);
      setQuestionNotes({});
      const secs = len * (quiz.type === 'mocktest' ? 60 : 90);
      setTimerDuration(secs);
      setTimerKey(k => k + 1);
      try {
        const notes = await notesService.getNotesByReference('quiz', quiz._id);
        const nm: Record<number, Note | null> = {};
        notes.forEach(n => { const q = n.reference.metadata?.question; if (q !== undefined) nm[q] = n; });
        setQuestionNotes(nm);
      } catch {}
      setViewState('quiz');
    } catch (e: any) {
      setError(e.message || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  // ── Quiz actions ─────────────────────────────────────────────────────────
  const selectAnswer = (idx: number) => {
    const a = [...userAnswers];
    a[currentQuestion] = idx;
    setUserAnswers(a);
    if (skipped[currentQuestion]) {
      const s = [...skipped];
      s[currentQuestion] = false;
      setSkipped(s);
    }
  };

  const skipCurrent = () => {
    const s = [...skipped];
    s[currentQuestion] = true;
    setSkipped(s);
    if (selectedQuiz && currentQuestion < selectedQuiz.questions.length - 1) {
      setCurrentQuestion(q => q + 1);
    }
  };

  const handleNext = () => {
    if (userAnswers[currentQuestion] === null) {
      const s = [...skipped];
      s[currentQuestion] = true;
      setSkipped(s);
    }
    setCurrentQuestion(q => q + 1);
  };

  const toggleMark = () => {
    const m = [...markedForReview];
    m[currentQuestion] = !m[currentQuestion];
    setMarkedForReview(m);
  };

  const doSubmit = async () => {
    if (!selectedQuiz) return;
    setSubmitting(true);
    setError('');
    try {
      const result = await quizService.submitQuiz(selectedQuiz._id, userAnswers.map(a => a ?? -1));
      const uid = user?.id || user?._id;
      if (uid) incrementDashboardMetric(uid, 'questionsPracticed', result.totalQuestions);
      setQuizResult(result);
      setViewState('result');
    } catch (e: any) {
      setError(e.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = () => {
    const unanswered = userAnswers.filter(a => a === null).length;
    if (unanswered > 0) {
      setDialog({
        isOpen: true, type: 'confirm',
        title: 'Submit Quiz?',
        message: `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. These will be marked incorrect. Continue?`,
        onConfirm: () => { setDialog(d => ({ ...d, isOpen: false })); doSubmit(); },
      });
    } else {
      doSubmit();
    }
  };

  const resetToList = () => {
    setViewState('list');
    setSelectedQuiz(null);
    setTimerDuration(0);
    setTimedOut(false);
    setQuizResult(null);
    setCurrentQuestion(0);
    setUserAnswers([]);
    setSkipped([]);
    setMarkedForReview([]);
    setError('');
    setMobileNavOpen(false);
  };

  const retakeQuiz = () => {
    if (!selectedQuiz) return;
    const len = selectedQuiz.questions.length;
    setUserAnswers(new Array(len).fill(null));
    setSkipped(new Array(len).fill(false));
    setMarkedForReview(new Array(len).fill(false));
    setCurrentQuestion(0);
    setQuizResult(null);
    setTimedOut(false);
    const secs = len * (selectedQuiz.type === 'mocktest' ? 60 : 90);
    setTimerDuration(secs);
    setTimerKey(k => k + 1);
    setViewState('quiz');
  };

  const filteredQuizzes = quizzes.filter(q =>
    !searchTerm ||
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const visibleSubjects = subjects.filter(s =>
    typeFilter === 'pyq' ? s.pyqCount > 0 : s.mockCount > 0
  );

  const totalSubjectCount = visibleSubjects.reduce(
    (acc, s) => acc + (typeFilter === 'pyq' ? s.pyqCount : s.mockCount), 0
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  if (viewState === 'list') {
    return (
      <>
        {/* ── Page header ─────────────────────────────────────────────── */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gold-500 rounded-xl flex items-center justify-center shadow-sm">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-brand-900 dark:text-brand-100">MCQ Practice</h1>
              <p className="text-sm text-brand-500 dark:text-brand-400">Legal exam preparation</p>
            </div>
          </div>
        </div>

        {/* ── Type toggle + Search row ─────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* PYQ / Mock Test toggle */}
          <div className="bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 rounded-xl p-1 flex gap-1 flex-shrink-0 self-start sm:self-auto shadow-sm">
            {(['pyq', 'mocktest'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTypeFilter(t); setSelectedSubject(''); setPage(1); }}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                  typeFilter === t
                    ? 'bg-gold-500 text-white shadow-sm'
                    : 'text-brand-600 dark:text-brand-400 hover:text-brand-900 dark:hover:text-brand-100 hover:bg-brand-100 dark:hover:bg-brand-800'
                }`}
              >
                {t === 'pyq' ? 'PYQ' : 'Mock Test'}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={`Search ${typeFilter === 'pyq' ? 'previous year questions' : 'mock tests'}...`}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 rounded-xl text-sm text-brand-800 dark:text-brand-200 placeholder-brand-400 focus:outline-none focus:ring-2 focus:ring-gold-500 transition shadow-sm"
            />
          </div>
        </div>

        {/* ── Subject chips (horizontal scroll) ────────────────────────── */}
        <div className="mb-5">
          <p className="text-[10px] font-bold text-brand-400 dark:text-brand-500 uppercase tracking-widest mb-2">
            Filter by Subject
          </p>
          {subjectsLoading ? (
            <div className="flex items-center gap-2 py-1">
              <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />
              <span className="text-xs text-brand-400">Loading subjects...</span>
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 pb-1 min-w-max">
                {/* All chip */}
                <button
                  onClick={() => { setSelectedSubject(''); setPage(1); }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all flex-shrink-0 ${
                    selectedSubject === ''
                      ? 'bg-gold-500 text-white border-gold-500 shadow-sm'
                      : 'bg-white dark:bg-brand-900 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-700 hover:border-gold-400 hover:text-gold-700 dark:hover:text-gold-400'
                  }`}
                >
                  All
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    selectedSubject === '' ? 'bg-white/25 text-white' : 'bg-brand-100 dark:bg-brand-800 text-brand-500 dark:text-brand-400'
                  }`}>
                    {totalSubjectCount}
                  </span>
                </button>
                {visibleSubjects.map(s => {
                  const count = typeFilter === 'pyq' ? s.pyqCount : s.mockCount;
                  const active = selectedSubject === s.name;
                  return (
                    <button
                      key={s.name}
                      onClick={() => { setSelectedSubject(s.name); setPage(1); }}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all flex-shrink-0 ${
                        active
                          ? 'bg-gold-500 text-white border-gold-500 shadow-sm'
                          : 'bg-white dark:bg-brand-900 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-700 hover:border-gold-400 hover:text-gold-700 dark:hover:text-gold-400'
                      }`}
                    >
                      {s.name}
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                        active ? 'bg-white/25 text-white' : 'bg-brand-100 dark:bg-brand-800 text-brand-500 dark:text-brand-400'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Active filter breadcrumb ─────────────────────────────────── */}
        {selectedSubject && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-brand-500 dark:text-brand-400">Showing:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400 rounded-lg text-sm font-semibold border border-gold-200 dark:border-gold-800">
              {selectedSubject}
              <button onClick={() => { setSelectedSubject(''); setPage(1); }} className="ml-0.5 hover:text-gold-900 dark:hover:text-gold-200 transition">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          </div>
        )}

        {/* ── Error ───────────────────────────────────────────────────── */}
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl px-4 py-3 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* ── Loading ─────────────────────────────────────────────────── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-gold-500 animate-spin mb-3" />
            <p className="text-sm text-brand-500">Loading quizzes...</p>
          </div>
        )}

        {/* ── Empty state ─────────────────────────────────────────────── */}
        {!loading && filteredQuizzes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-brand-100 dark:bg-brand-800 rounded-2xl flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-brand-400" />
            </div>
            <h3 className="text-base font-semibold text-brand-700 dark:text-brand-300 mb-1">No quizzes found</h3>
            <p className="text-sm text-brand-500">Try a different subject or clear the search</p>
          </div>
        )}

        {/* ── Quiz grid ───────────────────────────────────────────────── */}
        {!loading && filteredQuizzes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredQuizzes.map(quiz => (
              <div
                key={quiz._id}
                className="bg-white dark:bg-brand-900 rounded-2xl border border-brand-200 dark:border-brand-800 overflow-hidden hover:shadow-lg hover:border-gold-300 dark:hover:border-gold-700/50 transition-all duration-200 flex flex-col group"
              >
                <div className="p-5 flex-1">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-gold-100 dark:bg-gold-900/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-gold-200 dark:group-hover:bg-gold-900/50 transition-colors">
                      <BookOpen className="w-5 h-5 text-gold-600 dark:text-gold-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400 uppercase tracking-wide">
                          {quiz.topic}
                        </span>
                        {quiz.type && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${
                            quiz.type === 'pyq'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                              : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                          }`}>
                            {quiz.type === 'pyq' ? 'PYQ' : 'Mock'}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-brand-900 dark:text-brand-100 leading-snug line-clamp-2 text-sm lg:text-base group-hover:text-gold-700 dark:group-hover:text-gold-400 transition-colors">
                        {quiz.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-brand-500 dark:text-brand-400 line-clamp-2 mb-4 leading-relaxed">
                    {quiz.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-brand-400 dark:text-brand-500">
                    <span className="flex items-center gap-1">
                      <Target className="w-3.5 h-3.5" />
                      {quiz.questions.length} Questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {Math.ceil(quiz.questions.length * (quiz.type === 'mocktest' ? 1 : 1.5))} min
                    </span>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <button
                    onClick={() => startQuiz(quiz)}
                    className="w-full bg-gold-500 hover:bg-gold-600 active:bg-gold-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow-md"
                  >
                    <Play className="w-4 h-4" />
                    Start Quiz
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────────────── */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 text-sm font-semibold text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-800 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="px-4 py-2 text-sm text-brand-500 dark:text-brand-400 font-medium">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 text-sm font-semibold text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-800 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <Dialog
          isOpen={dialog.isOpen}
          onClose={() => setDialog(d => ({ ...d, isOpen: false }))}
          type={dialog.type}
          title={dialog.title}
          message={dialog.message}
          onConfirm={dialog.onConfirm}
        />
      </>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // QUIZ VIEW — fixed full-screen above FeatureLayout sidebar
  // ═══════════════════════════════════════════════════════════════════════════
  if (viewState === 'quiz' && selectedQuiz) {
    const totalQ = selectedQuiz.questions.length;
    const currentQ = selectedQuiz.questions[currentQuestion];
    const answeredCount = userAnswers.filter(a => a !== null).length;
    const skippedCount = skipped.filter(Boolean).length;
    const markedCount = markedForReview.filter(Boolean).length;
    const isLast = currentQuestion === totalQ - 1;
    const progress = ((currentQuestion + 1) / totalQ) * 100;

    const timerCritical = timerPct <= 25;
    const timerWarning = timerPct <= 50;

    const navBtnClass = (i: number) =>
      `aspect-square rounded-xl font-bold text-xs sm:text-sm transition-all border-2 ${
        i === currentQuestion
          ? 'bg-gold-500 text-white border-gold-600 shadow-md scale-110 z-10 relative'
          : markedForReview[i]
          ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-700 hover:bg-indigo-200'
          : userAnswers[i] !== null
          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200'
          : skipped[i]
          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700 hover:bg-amber-200'
          : 'bg-white dark:bg-brand-800 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-700'
      }`;

    return (
      <>
        <div className="fixed inset-0 z-[100] flex flex-col bg-brand-50 dark:bg-brand-950 overflow-hidden">
          {/* Time's Up overlay */}
          {timedOut && submitting && (
            <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-brand-900 rounded-3xl p-8 max-w-xs w-full text-center shadow-2xl border border-brand-200 dark:border-brand-800">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Timer className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-brand-900 dark:text-brand-100 mb-2">Time's Up!</h2>
                <p className="text-sm text-brand-500 dark:text-brand-400 mb-5">Submitting your quiz automatically...</p>
                <Loader2 className="w-6 h-6 text-gold-500 animate-spin mx-auto" />
              </div>
            </div>
          )}

          {/* Mobile question navigator bottom drawer */}
          {mobileNavOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setMobileNavOpen(false)} />
              <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-brand-900 rounded-t-3xl shadow-2xl border-t border-brand-200 dark:border-brand-800 max-h-[75vh] overflow-y-auto">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-brand-900 dark:text-brand-100">Question Navigator</h3>
                    <button onClick={() => setMobileNavOpen(false)} className="p-1.5 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-800 transition">
                      <X className="w-5 h-5 text-brand-500" />
                    </button>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs mb-4">
                    {[
                      { color: 'bg-gold-500', label: 'Current' },
                      { color: 'bg-emerald-100 border border-emerald-300', label: 'Answered' },
                      { color: 'bg-amber-100 border border-amber-300', label: 'Skipped' },
                      { color: 'bg-indigo-100 border border-indigo-300', label: 'Marked' },
                    ].map(({ color, label }) => (
                      <span key={label} className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400">
                        <span className={`w-3.5 h-3.5 rounded-sm ${color}`} />
                        {label}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 sm:grid-cols-9 gap-2">
                    {selectedQuiz.questions.map((_, i) => (
                      <button key={i} onClick={() => { setCurrentQuestion(i); setMobileNavOpen(false); }} className={navBtnClass(i)}>
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  {/* Stats row */}
                  <div className="flex gap-4 mt-4 pt-4 border-t border-brand-200 dark:border-brand-800 text-xs text-brand-500">
                    <span>Answered: <b className="text-emerald-600 dark:text-emerald-400">{answeredCount}</b></span>
                    <span>Skipped: <b className="text-amber-600 dark:text-amber-400">{skippedCount}</b></span>
                    <span>Marked: <b className="text-indigo-600 dark:text-indigo-400">{markedCount}</b></span>
                    <span>Total: <b className="text-brand-700 dark:text-brand-300">{totalQ}</b></span>
                  </div>

                  <button
                    onClick={() => { setMobileNavOpen(false); handleSubmit(); }}
                    disabled={submitting}
                    className="mt-4 w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Submit Quiz
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Header ─────────────────────────────────────────────────── */}
          <header className="flex-shrink-0 bg-brand-900 dark:bg-brand-950 shadow-lg">
            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3">
              {/* Exit */}
              <button
                onClick={() => setDialog({
                  isOpen: true, type: 'confirm',
                  title: 'Exit Quiz',
                  message: 'Are you sure you want to exit? Your progress will not be saved.',
                  onConfirm: () => { setDialog(d => ({ ...d, isOpen: false })); resetToList(); },
                })}
                className="p-2 rounded-xl hover:bg-white/10 transition flex-shrink-0"
                title="Exit quiz"
              >
                <ChevronLeft className="w-5 h-5 text-white/70" />
              </button>

              {/* Title area */}
              <div className="flex-1 min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-white truncate leading-tight">{selectedQuiz.title}</h2>
                <div className="flex items-center gap-2 text-xs text-white/50 mt-0.5">
                  <span className="hidden sm:inline">{selectedQuiz.topic}</span>
                  <span className="hidden sm:inline">·</span>
                  <span>{answeredCount}/{totalQ} answered</span>
                </div>
              </div>

              {/* Timer */}
              <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl flex-shrink-0 transition-colors ${
                timerCritical ? 'bg-red-500/25 animate-pulse'
                : timerWarning ? 'bg-amber-500/20'
                : 'bg-white/10'
              }`}>
                <Timer className={`w-4 h-4 flex-shrink-0 ${
                  timerCritical ? 'text-red-400'
                  : timerWarning ? 'text-amber-400'
                  : 'text-emerald-400'
                }`} />
                <span className={`font-mono font-bold tabular-nums text-sm sm:text-base ${
                  timerCritical ? 'text-red-400'
                  : timerWarning ? 'text-amber-300'
                  : 'text-white'
                }`}>
                  {timerDisplay}
                </span>
              </div>

              {/* Mobile: open navigator */}
              <button
                onClick={() => setMobileNavOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition flex-shrink-0"
                title="Question navigator"
              >
                <Menu className="w-5 h-5 text-white/70" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-white/10">
              <div
                className="h-1 bg-gold-400 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </header>

          {/* ── Body ───────────────────────────────────────────────────── */}
          <div className="flex-1 flex overflow-hidden">
            {/* Question area */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto p-4 sm:p-6 pb-28 lg:pb-8">
                {/* Question card */}
                <div className="bg-white dark:bg-brand-900 rounded-2xl border border-brand-200 dark:border-brand-800 shadow-sm overflow-hidden mb-4">
                  {/* Status badges */}
                  {(markedForReview[currentQuestion] || skipped[currentQuestion]) && (
                    <div className="px-5 pt-4 flex items-center gap-2">
                      {markedForReview[currentQuestion] && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                          <Flag className="w-3 h-3" /> Marked for Review
                        </span>
                      )}
                      {skipped[currentQuestion] && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          <FastForward className="w-3 h-3" /> Skipped
                        </span>
                      )}
                    </div>
                  )}

                  <div className="p-5 sm:p-6">
                    {/* Question header */}
                    <div className="flex items-start gap-4 mb-5">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gold-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-white font-bold text-sm">{currentQuestion + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-brand-400 dark:text-brand-500 uppercase tracking-wide mb-2">
                          Question {currentQuestion + 1} of {totalQ}
                        </p>
                        <p className="text-base sm:text-lg font-semibold text-brand-900 dark:text-brand-100 leading-relaxed">
                          {currentQ.text}
                        </p>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-2.5">
                      {currentQ.options.map((option, i) => {
                        const selected = userAnswers[currentQuestion] === i;
                        return (
                          <button
                            key={i}
                            onClick={() => selectAnswer(i)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 group ${
                              selected
                                ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20 shadow-sm'
                                : 'border-brand-200 dark:border-brand-700 hover:border-gold-300 dark:hover:border-gold-700/60 hover:bg-brand-50 dark:hover:bg-brand-800/50 active:scale-[0.99]'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                              selected ? 'border-gold-500 bg-gold-500' : 'border-brand-300 dark:border-brand-600 group-hover:border-gold-400'
                            }`}>
                              {selected && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            <span className={`text-sm sm:text-base leading-relaxed ${selected ? 'text-brand-900 dark:text-brand-100 font-medium' : 'text-brand-700 dark:text-brand-300'}`}>
                              <span className={`font-bold mr-2 ${selected ? 'text-gold-600 dark:text-gold-400' : 'text-brand-400 dark:text-brand-500'}`}>
                                {OPT[i]}.
                              </span>
                              {option}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="mb-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl px-4 py-3 flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                )}

                {/* Desktop navigation row */}
                <div className="hidden lg:flex items-center gap-2.5">
                  <button
                    onClick={() => setCurrentQuestion(q => Math.max(0, q - 1))}
                    disabled={currentQuestion === 0}
                    className="flex items-center gap-2 px-4 py-2.5 border-2 border-brand-200 dark:border-brand-700 rounded-xl text-sm font-semibold text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>

                  <button
                    onClick={toggleMark}
                    className={`flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl text-sm font-semibold transition ${
                      markedForReview[currentQuestion]
                        ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400'
                        : 'border-brand-200 dark:border-brand-700 text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-800'
                    }`}
                  >
                    <Flag className="w-4 h-4" />
                    {markedForReview[currentQuestion] ? 'Unmark' : 'Mark'}
                  </button>

                  {!isLast && (
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-2 px-4 py-2.5 border-2 border-brand-200 dark:border-brand-700 rounded-xl text-sm font-semibold text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-800 transition"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  )}

                  <div className="flex-1" />

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition shadow-sm disabled:opacity-60"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Submit Quiz
                  </button>
                </div>
              </div>
            </div>

            {/* ── Desktop Question Navigator sidebar ─────────────────── */}
            <aside className="hidden lg:flex w-72 xl:w-80 bg-white dark:bg-brand-900 border-l border-brand-200 dark:border-brand-800 flex-col flex-shrink-0">
              <div className="p-4 border-b border-brand-200 dark:border-brand-800">
                <h4 className="text-sm font-bold text-brand-800 dark:text-brand-200 mb-3">Question Navigator</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-brand-600 dark:text-brand-400">
                  {[
                    { color: 'bg-gold-500', label: 'Current' },
                    { color: 'bg-emerald-100 border border-emerald-300', label: 'Answered' },
                    { color: 'bg-amber-100 border border-amber-300', label: 'Skipped' },
                    { color: 'bg-indigo-100 border border-indigo-300', label: 'Marked' },
                    { color: 'bg-white dark:bg-brand-800 border border-brand-300 dark:border-brand-600', label: 'Unanswered' },
                  ].map(({ color, label }) => (
                    <span key={label} className="flex items-center gap-1.5">
                      <span className={`w-3.5 h-3.5 rounded-sm flex-shrink-0 ${color}`} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-5 gap-2">
                  {selectedQuiz.questions.map((_, i) => (
                    <button key={i} onClick={() => setCurrentQuestion(i)} className={navBtnClass(i)}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-brand-200 dark:border-brand-800 space-y-3">
                <div className="grid grid-cols-3 gap-2 text-xs text-center">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl py-2 border border-emerald-200 dark:border-emerald-800">
                    <div className="font-bold text-emerald-700 dark:text-emerald-400 text-base">{answeredCount}</div>
                    <div className="text-emerald-600 dark:text-emerald-500">Answered</div>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl py-2 border border-amber-200 dark:border-amber-800">
                    <div className="font-bold text-amber-700 dark:text-amber-400 text-base">{skippedCount}</div>
                    <div className="text-amber-600 dark:text-amber-500">Skipped</div>
                  </div>
                  <div className="bg-brand-50 dark:bg-brand-800 rounded-xl py-2 border border-brand-200 dark:border-brand-700">
                    <div className="font-bold text-brand-700 dark:text-brand-300 text-base">{totalQ - answeredCount - skippedCount}</div>
                    <div className="text-brand-500 dark:text-brand-400">Left</div>
                  </div>
                </div>

              </div>
            </aside>
          </div>

          {/* ── Mobile bottom action bar ──────────────────────────────── */}
          <div className="lg:hidden flex-shrink-0 bg-white dark:bg-brand-900 border-t border-brand-200 dark:border-brand-800 px-3 py-3 shadow-lg">
            {/* Scrollable question strip */}
            <div className="overflow-x-auto scrollbar-hide mb-2.5">
              <div className="flex gap-1.5 pb-0.5 min-w-max">
                {selectedQuiz.questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentQuestion(i)}
                    className={`w-8 h-8 flex-shrink-0 rounded-lg text-xs font-bold border-2 transition-all ${
                      i === currentQuestion ? 'bg-gold-500 text-white border-gold-600 scale-110'
                      : markedForReview[i] ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                      : userAnswers[i] !== null ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                      : skipped[i] ? 'bg-amber-100 text-amber-700 border-amber-300'
                      : 'bg-brand-100 dark:bg-brand-800 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-700'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentQuestion(q => Math.max(0, q - 1))}
                disabled={currentQuestion === 0}
                className="p-2.5 rounded-xl border-2 border-brand-200 dark:border-brand-700 text-brand-600 dark:text-brand-400 disabled:opacity-40 transition active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={toggleMark}
                className={`p-2.5 rounded-xl border-2 transition active:scale-95 ${
                  markedForReview[currentQuestion]
                    ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400'
                    : 'border-brand-200 dark:border-brand-700 text-brand-600 dark:text-brand-400'
                }`}
              >
                <Flag className="w-4 h-4" />
              </button>

              {!isLast && (
                <button
                  onClick={handleNext}
                  className="p-2.5 rounded-xl border-2 border-brand-200 dark:border-brand-700 text-brand-600 dark:text-brand-400 transition active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => setMobileNavOpen(true)}
                className="p-2.5 rounded-xl border-2 border-brand-200 dark:border-brand-700 text-brand-600 dark:text-brand-400 transition active:scale-95"
              >
                <Menu className="w-4 h-4" />
              </button>

              <div className="flex-1" />

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition text-sm disabled:opacity-60 active:scale-95"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Submit
              </button>
            </div>
          </div>
          {/* Dialog lives INSIDE the z-[100] stacking context so it appears above the quiz overlay */}
          <Dialog
            isOpen={dialog.isOpen}
            onClose={() => setDialog(d => ({ ...d, isOpen: false }))}
            type={dialog.type}
            title={dialog.title}
            message={dialog.message}
            onConfirm={dialog.onConfirm}
          />
        </div>
      </>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RESULT VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  if (viewState === 'result' && quizResult && selectedQuiz) {
    const { score, totalQuestions, percentage } = quizResult;
    const passed = percentage >= 60;
    const skippedCount = skipped.filter(Boolean).length;
    const wrong = totalQuestions - score - skippedCount;

    return (
      <>
        <div className="max-w-4xl mx-auto">
          {/* Timeout banner */}
          {timedOut && (
            <div className="mb-5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl px-5 py-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <Timer className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="font-bold text-red-700 dark:text-red-400 text-sm">Time Expired</p>
                <p className="text-xs text-red-600 dark:text-red-500">Quiz was submitted automatically when the timer ran out.</p>
              </div>
            </div>
          )}

          {/* Score card */}
          <div className="bg-white dark:bg-brand-900 rounded-3xl border border-brand-200 dark:border-brand-800 p-6 lg:p-8 mb-5 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-brand-100 dark:bg-brand-800 rounded-2xl flex items-center justify-center border border-brand-200 dark:border-brand-700">
                <Trophy className="w-7 h-7 text-gold-500" />
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-brand-900 dark:text-brand-100">Quiz Complete</h2>
                <p className="text-sm text-brand-500 dark:text-brand-400">{selectedQuiz.title}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-center">
              <div className="lg:col-span-2 text-center lg:text-left">
                <div className={`text-6xl lg:text-7xl font-extrabold tabular-nums leading-none ${
                  passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-brand-700 dark:text-brand-300'
                }`}>
                  {percentage.toFixed(0)}%
                </div>
                <p className="text-sm text-brand-500 dark:text-brand-400 mt-2">
                  {score} of {totalQuestions} correct
                </p>
              </div>

              <div className="lg:col-span-3 space-y-3">
                <div className="w-full h-4 bg-brand-200 dark:bg-brand-700 rounded-full overflow-hidden">
                  <div
                    className={`h-4 rounded-full transition-all duration-1000 ${passed ? 'bg-emerald-500' : 'bg-gold-500'}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold border ${
                    passed
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                      : 'bg-gold-50 dark:bg-gold-900/20 text-gold-700 dark:text-gold-400 border-gold-200 dark:border-gold-800'
                  }`}>
                    {passed ? <Award className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                    {passed ? 'Passed' : 'Needs Improvement'}
                  </span>
                  <span className="text-sm text-brand-500 dark:text-brand-400">
                    {passed ? 'Great performance!' : 'Review and try again.'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Total', value: totalQuestions, icon: Target, bg: 'bg-brand-100 dark:bg-brand-800', color: 'text-brand-700 dark:text-brand-300', border: 'border-brand-200 dark:border-brand-700' },
              { label: 'Correct', value: score, icon: CheckCircle, bg: 'bg-emerald-50 dark:bg-emerald-900/20', color: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
              { label: 'Wrong', value: wrong < 0 ? 0 : wrong, icon: XCircle, bg: 'bg-rose-50 dark:bg-rose-900/20', color: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800' },
              { label: 'Skipped', value: skippedCount, icon: FastForward, bg: 'bg-amber-50 dark:bg-amber-900/20', color: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
            ].map(({ label, value, icon: Icon, bg, color, border }) => (
              <div key={label} className={`bg-white dark:bg-brand-900 rounded-2xl border ${border} p-4 text-center shadow-sm`}>
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mx-auto mb-2.5`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className={`text-3xl font-extrabold tabular-nums ${color}`}>{value}</div>
                <div className="text-xs font-semibold text-brand-500 dark:text-brand-400 mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Detailed review */}
          <div className="mb-5">
            <h3 className="text-base lg:text-lg font-bold text-brand-900 dark:text-brand-100 mb-4 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-gold-500" />
              Detailed Review
            </h3>

            <div className="space-y-3">
              {quizResult.details.map((detail, i) => {
                const wasSkipped = skipped[i] || userAnswers[i] === null;
                const correctAnswer = selectedQuiz.questions[i]?.options[detail.correctIndex];
                const yourAnswer = wasSkipped
                  ? null
                  : selectedQuiz.questions[i]?.options[detail.selectedIndex] ?? 'Not answered';
                const optLetter = (idx: number) => String.fromCharCode(65 + idx);

                // A skipped question is never correct regardless of what backend says
                const isCorrect = !wasSkipped && detail.correct;

                return (
                  <div
                    key={i}
                    className={`bg-white dark:bg-brand-900 rounded-2xl border shadow-sm overflow-hidden ${
                      wasSkipped
                        ? 'border-amber-200 dark:border-amber-800/60'
                        : isCorrect
                        ? 'border-emerald-200 dark:border-emerald-800/60'
                        : 'border-rose-200 dark:border-rose-800/60'
                    }`}
                  >
                    {/* Card header */}
                    <div className={`flex items-center gap-3 px-4 py-3 border-b ${
                      wasSkipped
                        ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-800/40'
                        : isCorrect
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-800/40'
                        : 'bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-800/40'
                    }`}>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${
                        wasSkipped ? 'bg-amber-500' : isCorrect ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}>
                        {i + 1}
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-widest ${
                        wasSkipped
                          ? 'text-amber-600 dark:text-amber-400'
                          : isCorrect
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {wasSkipped ? '— Skipped' : isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    </div>

                    {/* Question text */}
                    <div className="px-4 pt-4 pb-3">
                      <p className="text-sm lg:text-base font-semibold text-brand-900 dark:text-brand-100 leading-relaxed">
                        {detail.question}
                      </p>
                    </div>

                    {/* Answer comparison */}
                    <div className={`mx-4 mb-3 rounded-xl overflow-hidden border ${
                      wasSkipped
                        ? 'border-amber-200 dark:border-amber-800/50'
                        : isCorrect
                        ? 'border-emerald-200 dark:border-emerald-800/50'
                        : 'border-brand-200 dark:border-brand-700'
                    }`}>
                      {/* Your answer row */}
                      <div className={`flex items-center gap-3 px-4 py-3 ${
                        wasSkipped
                          ? 'bg-amber-50 dark:bg-amber-950/20'
                          : isCorrect
                          ? 'bg-emerald-50 dark:bg-emerald-950/20'
                          : 'bg-rose-50 dark:bg-rose-950/20'
                      }`}>
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-[10px] font-black ${
                          wasSkipped
                            ? 'bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200'
                            : isCorrect
                            ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200'
                            : 'bg-rose-200 dark:bg-rose-800 text-rose-800 dark:text-rose-200'
                        }`}>
                          {wasSkipped ? '—' : optLetter(detail.selectedIndex)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`text-[10px] font-bold uppercase tracking-wide block mb-0.5 ${
                            wasSkipped
                              ? 'text-amber-600 dark:text-amber-400'
                              : isCorrect
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-500 dark:text-rose-400'
                          }`}>Your answer</span>
                          <span className={`text-sm font-medium leading-snug italic ${
                            wasSkipped
                              ? 'text-amber-700 dark:text-amber-300'
                              : isCorrect
                              ? 'text-emerald-900 dark:text-emerald-200'
                              : 'text-rose-900 dark:text-rose-200'
                          }`}>
                            {wasSkipped ? 'Skipped — not answered' : yourAnswer}
                          </span>
                        </div>
                        {wasSkipped
                          ? <FastForward className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          : isCorrect
                          ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          : <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                        }
                      </div>

                      {/* Correct answer row — shown when wrong or skipped */}
                      {(!isCorrect) && (
                        <>
                          <div className="h-px bg-brand-100 dark:bg-brand-800" />
                          <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/20">
                            <div className="w-6 h-6 rounded-md bg-emerald-200 dark:bg-emerald-800 flex items-center justify-center flex-shrink-0 text-[10px] font-black text-emerald-800 dark:text-emerald-200">
                              {optLetter(detail.correctIndex)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide block mb-0.5">Correct answer</span>
                              <span className="text-sm font-medium text-emerald-900 dark:text-emerald-200 leading-snug">{correctAnswer}</span>
                            </div>
                            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Explanation */}
                    {detail.explanation && (
                      <div className="mx-4 mb-3 flex gap-3 p-3.5 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/40">
                        <div className="w-5 h-5 rounded-md bg-gold-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-[9px] font-black">!</span>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">Explanation</p>
                          <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">{detail.explanation}</p>
                        </div>
                      </div>
                    )}

                    {/* Footer: save to notes */}
                    <div className="px-4 pb-4 flex items-center justify-end">
                      {questionNotes[i] ? (
                        <button
                          onClick={async () => {
                            try { await notesService.deleteNote(questionNotes[i]!._id); setQuestionNotes(p => ({ ...p, [i]: null })); }
                            catch {}
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-semibold transition border border-rose-200 dark:border-rose-800/40"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Remove Note
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            try {
                              const note = await notesService.createNote({
                                title: `Q${i + 1}: ${selectedQuiz.title}`,
                                content: `${detail.question}\n\n${wasSkipped ? 'Skipped (not answered)' : `Your answer: ${yourAnswer}`}\nCorrect: ${correctAnswer}${detail.explanation ? `\n\nExplanation: ${detail.explanation}` : ''}`,
                                reference: { type: 'quiz', id: selectedQuiz._id, metadata: { question: i } },
                                tags: [selectedQuiz.topic],
                              });
                              setQuestionNotes(p => ({ ...p, [i]: note }));
                            } catch {}
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 dark:bg-brand-800 hover:bg-brand-100 dark:hover:bg-brand-700 text-brand-600 dark:text-brand-300 rounded-lg text-xs font-semibold transition border border-brand-200 dark:border-brand-700"
                        >
                          <BookMarked className="w-3.5 h-3.5" /> Save to Notes
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
            <button
              onClick={resetToList}
              className="flex items-center justify-center gap-2.5 py-4 px-6 bg-gold-500 hover:bg-gold-600 active:bg-gold-700 text-white font-bold rounded-2xl transition shadow-sm text-sm lg:text-base"
            >
              <RotateCcw className="w-5 h-5" /> Try Another Quiz
            </button>
            <button
              onClick={retakeQuiz}
              className="flex items-center justify-center gap-2.5 py-4 px-6 bg-white dark:bg-brand-900 border-2 border-gold-400 dark:border-gold-600 text-gold-600 dark:text-gold-400 font-bold rounded-2xl hover:bg-gold-50 dark:hover:bg-gold-900/20 active:scale-[0.99] transition text-sm lg:text-base"
            >
              <Play className="w-5 h-5" /> Retake Quiz
            </button>
          </div>
        </div>

        <Dialog
          isOpen={dialog.isOpen}
          onClose={() => setDialog(d => ({ ...d, isOpen: false }))}
          type={dialog.type}
          title={dialog.title}
          message={dialog.message}
          onConfirm={dialog.onConfirm}
        />
      </>
    );
  }

  return (
    <Dialog
      isOpen={dialog.isOpen}
      onClose={() => setDialog(d => ({ ...d, isOpen: false }))}
      type={dialog.type}
      title={dialog.title}
      message={dialog.message}
      onConfirm={dialog.onConfirm}
    />
  );
}
