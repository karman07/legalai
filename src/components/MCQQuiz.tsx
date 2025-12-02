import { useState, useEffect } from 'react';

type MCQCategory = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

type MCQQuestion = {
  id: string;
  category_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string | null;
  difficulty_level: 'easy' | 'medium' | 'hard';
  created_at: string;
};
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle2, XCircle, RefreshCw, Trophy, BookOpen, FileText, Target, Sparkles } from 'lucide-react';

type QuizMode = 'pyq' | 'mock' | 'custom';

export default function MCQQuiz() {
  const { user } = useAuth();
  const [mode, setMode] = useState<QuizMode | null>(null);
  const [categories, setCategories] = useState<MCQCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<MCQQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
    loadStats();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadQuestions();
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      // TODO: Implement categories loading logic
      setCategories([]);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    try {
      // TODO: Implement questions loading logic
      setQuestions([]);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const loadStats = async () => {
    if (!user) return;

    try {
      // TODO: Implement stats loading logic
      setStats({ correct: 0, total: 0 });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer || !currentQuestion || !user) return;

    const correct = selectedAnswer === currentQuestion.correct_answer;
    setIsCorrect(correct);
    setShowResult(true);

    try {
      // TODO: Implement MCQ attempt logging
      console.log('Logging attempt:', { questionId: currentQuestion.id, correct });

      setStats((prev) => ({
        correct: prev.correct + (correct ? 1 : 0),
        total: prev.total + 1,
      }));
    } catch (error) {
      console.error('Error saving attempt:', error);
    }
  };

  const handleNextQuestion = () => {
    if (questions.length > 0) {
      setCurrentQuestion(questions[Math.floor(Math.random() * questions.length)]);
    }
    setSelectedAnswer(null);
    setShowResult(false);
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!mode) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center">
            <BookOpen className="w-7 h-7 mr-2 text-amber-600" />
            MCQ Practice
          </h2>
          <p className="text-slate-600 mt-1">Choose your practice mode</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <button
            onClick={() => setMode('pyq')}
            className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl p-8 text-left transition-all border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg"
          >
            <div className="bg-blue-500 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Previous Year Questions</h3>
            <p className="text-slate-600 text-sm">Practice with actual exam questions from previous years</p>
          </button>

          <button
            onClick={() => setMode('mock')}
            className="group bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl p-8 text-left transition-all border-2 border-green-200 hover:border-green-400 hover:shadow-lg"
          >
            <div className="bg-green-500 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Target className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Mock Tests</h3>
            <p className="text-slate-600 text-sm">Take timed mock tests to simulate exam conditions</p>
          </button>

          <button
            onClick={() => setMode('custom')}
            className="group bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 rounded-xl p-8 text-left transition-all border-2 border-amber-200 hover:border-amber-400 hover:shadow-lg"
          >
            <div className="bg-amber-500 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">AI Custom Quiz</h3>
            <p className="text-slate-600 text-sm">Generate personalized quizzes using AI based on your topics</p>
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'custom') {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={() => setMode(null)}
            className="text-amber-600 hover:text-amber-700 text-sm font-medium mb-4 flex items-center"
          >
            ← Back to Modes
          </button>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center">
            <Sparkles className="w-7 h-7 mr-2 text-amber-600" />
            AI Custom Quiz Generator
          </h2>
          <p className="text-slate-600 mt-1">Generate personalized quizzes using AI</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-8 border-2 border-amber-200">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">AI Custom Quiz Coming Soon</h3>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              This feature will allow you to generate personalized quizzes based on specific topics,
              difficulty levels, and your learning progress. Our AI will create custom questions
              tailored to your needs.
            </p>
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-amber-300 rounded-lg">
              <span className="text-sm text-slate-700">Feature in development</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => setMode(null)}
          className="text-amber-600 hover:text-amber-700 text-sm font-medium mb-4 flex items-center"
        >
          ← Back to Modes
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
              {mode === 'pyq' ? (
                <><FileText className="w-7 h-7 mr-2 text-blue-600" />Previous Year Questions</>
              ) : (
                <><Target className="w-7 h-7 mr-2 text-green-600" />Mock Test</>
              )}
            </h2>
            <p className="text-slate-600 mt-1">
              {mode === 'pyq' ? 'Practice with previous exam questions' : 'Timed test simulation'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-amber-50 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-amber-600" />
                <div className="text-sm">
                  <span className="font-bold text-amber-900">{stats.correct}</span>
                  <span className="text-slate-600">/{stats.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <p className="text-slate-600">No categories available yet.</p>
          <p className="text-sm text-slate-500 mt-2">Check back later for new content.</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">Choose a category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {currentQuestion && (
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-medium text-slate-900 flex-1">
                    {currentQuestion.question_text}
                  </h3>
                  <span className="ml-4 px-3 py-1 bg-slate-200 text-slate-700 text-xs font-medium rounded-full capitalize">
                    {currentQuestion.difficulty_level}
                  </span>
                </div>

                <div className="space-y-3">
                  {['A', 'B', 'C', 'D'].map((option) => {
                    const optionKey = `option_${option.toLowerCase()}` as keyof MCQQuestion;
                    const isSelected = selectedAnswer === option;
                    const isCorrectAnswer = currentQuestion.correct_answer === option;
                    const showCorrect = showResult && isCorrectAnswer;
                    const showIncorrect = showResult && isSelected && !isCorrect;

                    return (
                      <button
                        key={option}
                        onClick={() => !showResult && setSelectedAnswer(option)}
                        disabled={showResult}
                        className={`w-full text-left px-4 py-4 rounded-lg border-2 transition-all ${
                          showCorrect
                            ? 'border-green-500 bg-green-50'
                            : showIncorrect
                            ? 'border-red-500 bg-red-50'
                            : isSelected
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        } ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-start space-x-3">
                            <span
                              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                                showCorrect
                                  ? 'bg-green-500 text-white'
                                  : showIncorrect
                                  ? 'bg-red-500 text-white'
                                  : isSelected
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {option}
                            </span>
                            <span className="text-slate-900 flex-1">
                              {currentQuestion[optionKey] as string}
                            </span>
                          </div>
                          {showCorrect && <CheckCircle2 className="w-6 h-6 text-green-600" />}
                          {showIncorrect && <XCircle className="w-6 h-6 text-red-600" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {showResult && currentQuestion.explanation && (
                <div
                  className={`p-4 rounded-lg ${
                    isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <h4 className={`font-semibold mb-2 ${isCorrect ? 'text-green-900' : 'text-red-900'}`}>
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </h4>
                  <p className="text-slate-700">{currentQuestion.explanation}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                {!showResult ? (
                  <button
                    onClick={handleAnswerSubmit}
                    disabled={!selectedAnswer}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Next Question</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
