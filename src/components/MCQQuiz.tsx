import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Trophy, 
  Clock, 
  Target,
  Award,
  TrendingUp,
  Filter,
  Search,
  Loader2,
  AlertCircle,
  ChevronRight,
  Play,
  BookMarked,
  Flag,
  FastForward
} from 'lucide-react';
import quizService, { Quiz, QuizSubmitResponse } from '../services/quizService';
import GenerateAIQuiz from './GenerateAIQuiz';

type ViewState = 'list' | 'quiz' | 'result';

export default function MCQQuiz() {
  // UI color/style constants
  const PRIMARY_BTN =
    'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white';
  const SUCCESS_BTN =
    'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-600 hover:via-green-600 hover:to-emerald-700 text-white';
  const NEUTRAL_CARD =
    'bg-white rounded-2xl shadow-lg';
  const HEADER_BG =
    'bg-gradient-to-br from-amber-50 via-amber-100 to-slate-50';
  const HEADER_BORDER = 'border-2 border-amber-200';
  const HEADER_TITLE =
    'text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent';

  // State management
  const [viewState, setViewState] = useState<ViewState>('list');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [skipped, setSkipped] = useState<boolean[]>([]);
  const [markedForReview, setMarkedForReview] = useState<boolean[]>([]);
  const [quizResult, setQuizResult] = useState<QuizSubmitResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'pyq' | 'mocktest' | ''>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeSection, setActiveSection] = useState<'pyq' | 'mocktest' | 'ai' | null>(null);

  // Load quizzes on mount
  useEffect(() => {
    loadQuizzes();
  }, [page, topicFilter]);

  const loadQuizzes = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await quizService.getQuizzes({
        topic: topicFilter || undefined,
        type: typeFilter || undefined,
        page,
        limit: 12,
      });
      setQuizzes(response.items);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (quiz: Quiz) => {
    setLoading(true);
    setError('');
    try {
      // Fetch full quiz details
      const fullQuiz = await quizService.getQuiz(quiz._id);
      setSelectedQuiz(fullQuiz);
      const len = fullQuiz.questions.length;
      setUserAnswers(new Array(len).fill(null));
      setSkipped(new Array(len).fill(false));
      setMarkedForReview(new Array(len).fill(false));
      setCurrentQuestion(0);
      setViewState('quiz');
    } catch (err: any) {
      setError(err.message || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setUserAnswers(newAnswers);
    // Clear skip if answered
    if (skipped[currentQuestion]) {
      const newSkipped = [...skipped];
      newSkipped[currentQuestion] = false;
      setSkipped(newSkipped);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < (selectedQuiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const skipCurrent = () => {
    const next = Math.min((selectedQuiz?.questions.length || 1) - 1, currentQuestion + 1);
    const newSkipped = [...skipped];
    newSkipped[currentQuestion] = true;
    setSkipped(newSkipped);
    setCurrentQuestion(next);
  };

  const toggleMarkForReview = () => {
    const newMarked = [...markedForReview];
    newMarked[currentQuestion] = !newMarked[currentQuestion];
    setMarkedForReview(newMarked);
  };

  const submitQuiz = async () => {
    if (!selectedQuiz) return;
    
    // Check if all questions are answered
    const allAnswered = userAnswers.every(a => a !== null);
    if (!allAnswered) {
      setError('Please answer all questions before submitting');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await quizService.submitQuiz(
        selectedQuiz._id,
        userAnswers as number[]
      );
      setQuizResult(result);
      setViewState('result');
    } catch (err: any) {
      setError(err.message || 'Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  const restartQuiz = () => {
    setViewState('list');
    setSelectedQuiz(null);
    setCurrentQuestion(0);
    setUserAnswers([]);
    setSkipped([]);
    setMarkedForReview([]);
    setQuizResult(null);
    setError('');
    loadQuizzes();
  };

  // Get unique topics for filter
  const uniqueTopics = Array.from(new Set(quizzes.map(q => q.topic))).filter(Boolean);

  // Filter quizzes by search term
  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Quiz List View
  if (viewState === 'list') {
    return (
      <div className="max-w-7xl lg:max-w-6xl mx-0 lg:ml-4 lg:mr-0 p-4 lg:p-6 overflow-x-hidden">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
              <BookMarked className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">MCQ Practice</h1>
              <p className="text-slate-600">Test your knowledge with interactive quizzes</p>
            </div>
          </div>

          {/* Primary Actions: PYQ / Mock / AI — Card style (hidden after selection) */}
          {activeSection === null && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* PYQ Card */}
            <button
              onClick={() => { setActiveSection('pyq'); setTypeFilter('pyq'); setPage(1); }}
              className={`text-left p-6 rounded-2xl transition-all shadow-sm border-2 ${activeSection === 'pyq' ? 'bg-blue-50 border-blue-200' : 'bg-blue-50 border-blue-200 hover:border-blue-300 hover:shadow-md'}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-700" />
                </div>
                <div className="text-sm font-semibold text-blue-700">Previous Year Questions</div>
              </div>
              <div className="text-slate-900 font-bold text-lg mb-1">Previous Year Questions</div>
              <div className="text-slate-600 text-sm">Practice with actual exam questions from previous years</div>
            </button>

            {/* Mock Test Card */}
            <button
              onClick={() => { setActiveSection('mocktest'); setTypeFilter('mocktest'); setPage(1); }}
              className={`text-left p-6 rounded-2xl transition-all shadow-sm border-2 ${activeSection === 'mocktest' ? 'bg-green-50 border-green-200' : 'bg-green-50 border-green-200 hover:border-green-300 hover:shadow-md'}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-700" />
                </div>
                <div className="text-sm font-semibold text-green-700">Mock Tests</div>
              </div>
              <div className="text-slate-900 font-bold text-lg mb-1">Mock Tests</div>
              <div className="text-slate-600 text-sm">Take timed mock tests to simulate exam conditions</div>
            </button>

            {/* AI Custom Quiz Card */}
            <button
              onClick={() => { setActiveSection('ai'); setTypeFilter(''); setPage(1); const el = document.getElementById('ai-generator'); el?.scrollIntoView({ behavior: 'smooth' }); }}
              className={`text-left p-6 rounded-2xl transition-all shadow-sm border-2 ${activeSection === 'ai' ? 'bg-amber-50 border-amber-200' : 'bg-amber-50 border-amber-200 hover:border-amber-300 hover:shadow-md'}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Award className="w-6 h-6 text-amber-700" />
                </div>
                <div className="text-sm font-semibold text-amber-700">AI Custom Quiz</div>
              </div>
              <div className="text-slate-900 font-bold text-lg mb-1">AI Custom Quiz</div>
              <div className="text-slate-600 text-sm">Generate personalized quizzes using AI based on your topics</div>
            </button>
          </div>
          )}

          {/* Back control when a section is active */}
          {activeSection !== null && (
            <div className="mb-4 flex items-center gap-3">
              <button
                onClick={() => { setActiveSection(null); setTypeFilter(''); setTopicFilter(''); setSearchTerm(''); setPage(1); }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Back to Practice Modes
              </button>
              <span className="text-slate-500 text-sm">
                {activeSection === 'pyq' && 'Viewing: Previous Year Questions'}
                {activeSection === 'mocktest' && 'Viewing: Mock Tests'}
                {activeSection === 'ai' && 'Viewing: AI Custom Quiz'}
              </span>
            </div>
          )}

          {/* Search and Filters (only show when PYQ or Mock selected) */}
          {activeSection !== null && activeSection !== 'ai' && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search quizzes..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={topicFilter}
                onChange={(e) => {
                  setTopicFilter(e.target.value);
                  setPage(1);
                }}
                className="pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="">All Topics</option>
                {uniqueTopics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={typeFilter}
                onChange={(e) => {
                  const val = e.target.value as 'pyq' | 'mocktest' | '';
                  setTypeFilter(val);
                  setPage(1);
                }}
                className="pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="">All Types</option>
                <option value="pyq">PYQ</option>
                <option value="mocktest">Mock Test</option>
              </select>
            </div>
          </div>
          )}
        </div>

        {/* AI Generator (only show when AI selected) */}
        {activeSection === 'ai' && (
          <div id="ai-generator" className="mb-6">
            <GenerateAIQuiz
              onGenerated={(quiz) => {
                const len = quiz.questions.length;
                setSelectedQuiz(quiz);
                setUserAnswers(new Array(len).fill(null));
                setSkipped(new Array(len).fill(false));
                setMarkedForReview(new Array(len).fill(false));
                setCurrentQuestion(0);
                setViewState('quiz');
              }}
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        )}

        {/* Quiz Grid */}
        {!loading && filteredQuizzes.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No quizzes found</h3>
            <p className="text-slate-500">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Show quiz cards only when PYQ or Mock selected */}
        {activeSection !== null && activeSection !== 'ai' && !loading && filteredQuizzes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border border-slate-100 overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full mb-3">
                        {quiz.topic}
                      </div>
                      {quiz.type && (
                        <div className="inline-block ml-2 px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full mb-3">
                          {quiz.type === 'pyq' ? 'PYQ' : 'Mock Test'}
                        </div>
                      )}
                      <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-amber-600 transition-colors">
                        {quiz.title}
                      </h3>
                      <p className="text-slate-600 text-sm line-clamp-2">
                        {quiz.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      <span>{quiz.questions.length} Questions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{quiz.questions.length * 1} min</span>
                    </div>
                  </div>

                  <button
                    onClick={() => startQuiz(quiz)}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
                  >
                    <Play className="w-4 h-4" />
                    Start Quiz
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination (only when showing cards) */}
        {activeSection !== null && activeSection !== 'ai' && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-slate-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  }

  // Quiz Taking View
  if (viewState === 'quiz' && selectedQuiz) {
    const progress = ((currentQuestion + 1) / selectedQuiz.questions.length) * 100;
    const currentQ = selectedQuiz.questions[currentQuestion];
    const answeredCount = userAnswers.filter(a => a !== null).length;

    return (
      <div className="max-w-5xl mx-0 lg:ml-4 lg:mr-0 p-4 lg:p-6 overflow-x-hidden">
        {/* Header */}
        <div className={`${HEADER_BG} ${HEADER_BORDER} rounded-2xl shadow-xl p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`${HEADER_TITLE}`}>{selectedQuiz.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                  {selectedQuiz.topic}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Progress</div>
              <div className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
                {answeredCount}/{selectedQuiz.questions.length}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 h-3 rounded-full transition-all duration-300 shadow-md"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Two-column layout: left question, right navigator */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            {/* Question Card */}
            <div className={`${NEUTRAL_CARD} p-8 animate-fade-in-up`}>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">{currentQuestion + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-slate-500 mb-2">
                    Question {currentQuestion + 1} of {selectedQuiz.questions.length}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 leading-tight">
                    {currentQ.text}
                  </h3>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((option, index) => {
                  const isSelected = userAnswers[currentQuestion] === index;

                  return (
                    <button
                      key={index}
                      onClick={() => selectAnswer(index)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 shadow-md'
                          : 'border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? 'border-amber-500 bg-amber-500'
                              : 'border-slate-300'
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <span className="font-medium text-slate-700">{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex gap-3 flex-1">
                <button
                  onClick={previousQuestion}
                  disabled={currentQuestion === 0}
                  className="flex-1 sm:flex-none px-6 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>

                <button
                  onClick={skipCurrent}
                  className="flex-1 sm:flex-none px-6 py-3 bg-white border-2 border-amber-300 rounded-xl text-amber-700 font-semibold hover:bg-amber-50 hover:border-amber-400 transition-all inline-flex items-center justify-center gap-2"
                >
                  <FastForward className="w-5 h-5" />
                  Skip
                </button>

                
              </div>

              {currentQuestion < selectedQuiz.questions.length - 1 ? (
                <button
                  onClick={nextQuestion}
                  className={`w-full sm:w-auto px-8 py-3 ${PRIMARY_BTN} font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2`}
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={submitQuiz}
                  disabled={loading}
                  className={`w-full sm:w-auto px-8 py-3 ${SUCCESS_BTN} font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Submit Quiz
                    </>
                  )}
                </button>
              )}

              <button
                onClick={toggleMarkForReview}
                className={`w-full sm:w-auto px-6 py-3 bg-white border-2 rounded-xl font-semibold transition-all inline-flex items-center justify-center gap-2 ${markedForReview[currentQuestion] ? 'border-indigo-400 text-indigo-700 bg-indigo-50' : 'border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'}`}
              >
                <Flag className="w-5 h-5" />
                {markedForReview[currentQuestion] ? 'Marked for Review' : 'Mark for Review'}
              </button>
            </div>
          </div>

          {/* Right: Question Navigator */}
          <aside className={`${NEUTRAL_CARD} p-6 lg:sticky lg:top-6 max-h-[70vh] overflow-auto rounded-2xl`}>
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Question Navigator</h4>
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle className="w-3 h-3" /> Answered</span>
              <span className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200"><FastForward className="w-3 h-3" /> Skipped</span>
              <span className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200"><Flag className="w-3 h-3" /> Review</span>
        
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-3 gap-2">
              {selectedQuiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`aspect-square rounded-lg font-semibold text-sm transition-all ${
                    index === currentQuestion
                      ? 'bg-amber-500 text-white shadow-md'
                      : markedForReview[index]
                      ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                      : userAnswers[index] !== null
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : skipped[index]
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </aside>
        </div>
      </div>
    );
  }

  // Results View
  if (viewState === 'result' && quizResult && selectedQuiz) {
    const percentage = quizResult.percentage;
    const passed = percentage >= 60;

    return (
      <div className="max-w-5xl mx-0 lg:ml-4 lg:mr-0 p-4 lg:p-6 overflow-x-hidden">
        {/* Score Card - Professional, neutral styling */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 md:p-10 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200">
              <Trophy className="w-8 h-8 text-slate-700" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Quiz Complete</h2>
              <p className="text-slate-600 text-sm md:text-base">{selectedQuiz.title}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-1 text-center md:text-left">
              <div className="text-6xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                {percentage.toFixed(0)}%
              </div>
              <div className="mt-2 text-slate-600">
                {quizResult.score} of {quizResult.totalQuestions} correct
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="w-full h-3 bg-slate-200 rounded-full">
                <div
                  className={`h-3 rounded-full transition-all ${passed ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="mt-3 text-sm text-slate-600">
                {passed ? 'Good job—solid performance.' : 'Review topics and try again.'}
              </div>
            </div>
          </div>

          <div className={`mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${passed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
            {passed ? <Award className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            {passed ? 'Passed' : 'Needs Improvement'}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center border border-slate-200">
            <div className="w-14 h-14 bg-slate-100 rounded-xl mx-auto mb-4 flex items-center justify-center border border-slate-200">
              <Target className="w-7 h-7 text-slate-700" />
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2">
              {quizResult.totalQuestions}
            </div>
            <div className="text-sm font-semibold text-slate-600">Total Questions</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center border border-slate-200">
            <div className="w-14 h-14 bg-emerald-50 rounded-xl mx-auto mb-4 flex items-center justify-center border border-emerald-200">
              <CheckCircle className="w-7 h-7 text-emerald-600" />
            </div>
            <div className="text-4xl font-bold text-emerald-700 mb-2">
              {quizResult.score}
            </div>
            <div className="text-sm font-semibold text-emerald-700">Correct Answers</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center border border-slate-200">
            <div className="w-14 h-14 bg-rose-50 rounded-xl mx-auto mb-4 flex items-center justify-center border border-rose-200">
              <XCircle className="w-7 h-7 text-rose-600" />
            </div>
            <div className="text-4xl font-bold text-rose-700 mb-2">
              {quizResult.totalQuestions - quizResult.score}
            </div>
            <div className="text-sm font-semibold text-rose-700">Wrong Answers</div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-slate-200">
          <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            Detailed Results
          </h3>

          <div className="space-y-5">
            {quizResult.details.map((detail, index) => (
              <div
                key={index}
                className={`p-5 rounded-2xl border transition-all hover:shadow-md ${
                  detail.correct
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-rose-200 bg-rose-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                    detail.correct 
                      ? 'bg-emerald-100 border-emerald-200' 
                      : 'bg-rose-100 border-rose-200'
                  }`}>
                    {detail.correct ? (
                      <CheckCircle className="w-6 h-6 text-emerald-700" />
                    ) : (
                      <XCircle className="w-6 h-6 text-rose-700" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                      Question {index + 1}
                    </div>
                    <div className="font-bold text-lg text-slate-800 mb-3">
                      {detail.question}
                    </div>
                    
                    <div className="space-y-2">
                      <div className={`p-3 rounded-xl font-medium ${
                        detail.correct 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        <span className="font-bold">Your answer: </span>
                        {selectedQuiz.questions[index].options[detail.selectedIndex]}
                      </div>
                      {!detail.correct && (
                        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                          <span className="font-bold">Correct answer: </span>
                          {selectedQuiz.questions[index].options[detail.correctIndex]}
                        </div>
                      )}
                    </div>

                    {detail.explanation && (
                      <div className="mt-4 p-4 bg-slate-50 border-l-4 border-slate-300 rounded-xl">
                        <p className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Explanation
                        </p>
                        <p className="text-sm text-slate-700 leading-relaxed">{detail.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={restartQuiz}
            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-5 px-8 rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg"
          >
            <RotateCcw className="w-6 h-6" />
            Try Another Quiz
          </button>
          <button
            onClick={() => {
              setViewState('quiz');
              setCurrentQuestion(0);
              setUserAnswers(new Array(selectedQuiz.questions.length).fill(null));
              setQuizResult(null);
            }}
            className="flex-1 bg-white border-2 border-amber-500 text-amber-600 hover:bg-amber-50 hover:border-amber-600 font-bold py-5 px-8 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 text-lg"
          >
            <Play className="w-6 h-6" />
            Retake This Quiz
          </button>
        </div>
      </div>
    );
  }

  return null;
}
