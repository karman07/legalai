import { useState, useEffect } from 'react';
import { FileText, Upload, CheckCircle, Eye, X, TrendingUp, Award, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import answerCheckService, { AnswerCheckResult } from '../services/answerCheckService';

const FormattedText = ({ text, maxLength = 200 }: { text: string; maxLength?: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const needsTruncation = text.length > maxLength;
  const displayText = isExpanded || !needsTruncation ? text : text.slice(0, maxLength) + '...';

  const formatText = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const boldMatch = line.match(/\*\*(.*?)\*\*/g);
      if (boldMatch) {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={idx} className="mb-2">
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
              }
              return <span key={i}>{part}</span>;
            })}
          </p>
        );
      }
      
      if (line.match(/^\d+\./)) {
        return <p key={idx} className="mb-2 pl-4">{line}</p>;
      }
      
      return line.trim() ? <p key={idx} className="mb-2">{line}</p> : <br key={idx} />;
    });
  };

  return (
    <div>
      <div className="text-slate-700 leading-relaxed">{formatText(displayText)}</div>
      {needsTruncation && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1"
        >
          {isExpanded ? (
            <>
              Read Less <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Read More <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default function ScannedAnswers() {
  const [answers, setAnswers] = useState<AnswerCheckResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [questionText, setQuestionText] = useState('');
  const [totalMarks, setTotalMarks] = useState<number>(10);
  const [gradingCriteria, setGradingCriteria] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerCheckResult | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnswers();
  }, [page]);

  const loadAnswers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await answerCheckService.getHistory(page, 10);
      setAnswers(data.results);
      setTotalPages(data.pagination.pages);
    } catch (err: any) {
      setError(err.message || 'Failed to load answers');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSize = 10 * 1024 * 1024;

      if (file.size > maxSize) {
        setError('File size must be less than 10MB');
        return;
      }

      const allowedTypes = [
        'image/png', 'image/jpg', 'image/jpeg', 'image/webp',
        'application/pdf', 'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a valid file (PDF, Image, TXT, DOC, DOCX)');
        return;
      }

      setSelectedFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setError('');

    try {
      await answerCheckService.checkAnswer(
        selectedFile,
        questionText,
        totalMarks,
        gradingCriteria || undefined
      );

      setQuestionText('');
      setTotalMarks(10);
      setGradingCriteria('');
      setSelectedFile(null);
      setPage(1);
      loadAnswers();
    } catch (err: any) {
      setError(err.message || 'Failed to submit answer');
    } finally {
      setUploading(false);
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-emerald-600';
    if (percentage >= 60) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getScoreBg = (percentage: number) => {
    if (percentage >= 80) return 'bg-emerald-50 border-emerald-200';
    if (percentage >= 60) return 'bg-amber-50 border-amber-200';
    return 'bg-rose-50 border-rose-200';
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Answer Evaluation</h1>
            <p className="text-slate-600">Submit your answers and get AI-powered feedback</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="mb-8 bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Upload className="w-5 h-5 text-amber-600" />
          Submit Answer
        </h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Question</label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              placeholder="Enter the question you're answering..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Total Marks</label>
              <input
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(parseInt(e.target.value))}
                required
                min="1"
                max="100"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Grading Criteria (Optional)</label>
              <input
                type="text"
                value={gradingCriteria}
                onChange={(e) => setGradingCriteria(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                placeholder="e.g., Focus on clarity and examples"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Upload Answer File</label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="file"
                accept="image/*,.pdf,.txt,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer hover:bg-slate-200 hover:border-amber-400 transition-all"
              >
                <Upload className="w-5 h-5 text-slate-600" />
                <span className="text-slate-700 font-medium">Choose File</span>
              </label>
              {selectedFile && (
                <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <FileText className="w-5 h-5 text-amber-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="p-1 hover:bg-amber-100 rounded transition-all"
                  >
                    <X className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Supported formats: PDF, Images, Text, Word Documents. Maximum file size: 10MB
            </p>
          </div>

          <button
            type="submit"
            disabled={uploading || !selectedFile}
            className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Evaluating Answer...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Submit Answer
              </>
            )}
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-600" />
          Evaluation History
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : answers.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No submissions yet</h3>
            <p className="text-slate-500">Submit your first answer to get AI-powered feedback</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {answers.map((answer) => (
                <div key={answer._id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                  <div className="flex flex-col lg:flex-row items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-slate-800 mb-2">{answer.question}</h4>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {answer.fileName}
                        </span>
                        <span>•</span>
                        <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 ${getScoreBg(answer.percentage)}`}>
                      <Award className={`w-6 h-6 ${getScoreColor(answer.percentage)}`} />
                      <div>
                        <div className={`text-2xl font-bold ${getScoreColor(answer.percentage)}`}>
                          {answer.scoredMarks}/{answer.totalMarks}
                        </div>
                        <div className="text-xs font-semibold text-slate-600">{answer.percentage.toFixed(0)}%</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className="text-sm font-bold text-slate-900 mb-2">Feedback</p>
                      <FormattedText text={answer.feedback} />
                    </div>

                    {answer.suggestions && (
                      <div className="border-l-4 border-amber-500 pl-4">
                        <p className="text-sm font-bold text-slate-900 mb-2">Suggestions for Improvement</p>
                        <FormattedText text={answer.suggestions} />
                      </div>
                    )}

                    {answer.gradingCriteria && (
                      <div className="border-l-4 border-slate-400 pl-4">
                        <p className="text-sm font-bold text-slate-900 mb-2">Grading Criteria</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{answer.gradingCriteria}</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedAnswer(answer)}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
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
          </>
        )}
      </div>

      {selectedAnswer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-500 p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Answer Details</h3>
              <button
                onClick={() => setSelectedAnswer(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-500 mb-2">Question</h4>
                <p className="text-lg font-bold text-slate-800">{selectedAnswer.question}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-slate-600 mb-1">Total Marks</p>
                  <p className="text-2xl font-bold text-slate-900">{selectedAnswer.totalMarks}</p>
                </div>
                <div className={`rounded-xl p-4 ${getScoreBg(selectedAnswer.percentage)}`}>
                  <p className="text-sm font-semibold text-slate-600 mb-1">Scored</p>
                  <p className={`text-2xl font-bold ${getScoreColor(selectedAnswer.percentage)}`}>
                    {selectedAnswer.scoredMarks} ({selectedAnswer.percentage.toFixed(0)}%)
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-500 mb-3">Feedback</h4>
                <div className="border-l-4 border-blue-500 pl-4">
                  <FormattedText text={selectedAnswer.feedback} maxLength={500} />
                </div>
              </div>

              {selectedAnswer.suggestions && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-500 mb-3">Suggestions for Improvement</h4>
                  <div className="border-l-4 border-amber-500 pl-4">
                    <FormattedText text={selectedAnswer.suggestions} maxLength={500} />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-slate-500 pt-4 border-t border-slate-200">
                <span>File: {selectedAnswer.fileName}</span>
                <span>Submitted: {new Date(selectedAnswer.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
