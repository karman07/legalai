import { useState, useEffect } from 'react';

type ScannedAnswer = {
  id: string;
  user_id: string;
  question_text: string;
  image_url: string;
  evaluation_status: 'pending' | 'evaluated' | 'in_review';
  marks_obtained: number | null;
  total_marks: number;
  feedback: string | null;
  evaluated_by: string | null;
  evaluated_at: string | null;
  submitted_at: string;
};
import { useAuth } from '../contexts/AuthContext';
import { FileText, Upload, Clock, CheckCircle, AlertCircle, Eye, X } from 'lucide-react';

export default function ScannedAnswers() {
  const { user, profile } = useAuth();
  const [answers, setAnswers] = useState<ScannedAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [questionText, setQuestionText] = useState('');
  const [totalMarks, setTotalMarks] = useState<number>(10);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<ScannedAnswer | null>(null);
  const [evaluationMarks, setEvaluationMarks] = useState<number>(0);
  const [evaluationFeedback, setEvaluationFeedback] = useState('');

  const isEvaluator = profile?.role === 'educator' || profile?.role === 'admin';

  useEffect(() => {
    loadAnswers();
  }, [user, isEvaluator]);

  const loadAnswers = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // TODO: Implement scanned answers loading logic
      setAnswers([]);
    } catch (error) {
      console.error('Error loading answers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSize = 10 * 1024 * 1024;

      if (file.size > maxSize) {
        alert('File size must be less than 10MB');
        return;
      }

      const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp', 'image/heic', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a valid file (PDF, PNG, JPG, JPEG, WEBP, HEIC)');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !user) return;

    setUploading(true);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const imageUrl = URL.createObjectURL(selectedFile);

      // TODO: Implement scanned answer submission logic
      console.log('Submitting answer:', { questionText, imageUrl, totalMarks });

      setQuestionText('');
      setTotalMarks(10);
      setSelectedFile(null);
      loadAnswers();
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleEvaluate = async () => {
    if (!selectedAnswer || !user) return;

    try {
      // TODO: Implement answer evaluation logic
      console.log('Evaluating answer:', selectedAnswer.id);

      setSelectedAnswer(null);
      setEvaluationMarks(0);
      setEvaluationFeedback('');
      loadAnswers();
    } catch (error) {
      console.error('Error evaluating answer:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case 'evaluated':
        return (
          <span className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            <CheckCircle className="w-3 h-3" />
            <span>Evaluated</span>
          </span>
        );
      case 'in_review':
        return (
          <span className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            <AlertCircle className="w-3 h-3" />
            <span>In Review</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center">
            <FileText className="w-7 h-7 mr-2 text-amber-600" />
            Answer Evaluation
          </h2>
          <p className="text-slate-600 mt-1">
            {isEvaluator ? 'Review and evaluate student answers' : 'Submit your answers for evaluation'}
          </p>
        </div>
      </div>

      {!isEvaluator && (
        <div className="mb-8 bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Submit New Answer</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Question</label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                required
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter the question you're answering..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Total Marks</label>
              <input
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(parseInt(e.target.value))}
                required
                min="1"
                max="100"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Upload Answer</label>
              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  accept="image/*,.pdf,.png,.jpg,.jpeg,.webp,.heic"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  required
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center space-x-2 px-4 py-3 bg-white border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <Upload className="w-5 h-5 text-slate-600" />
                  <span className="text-slate-700">Choose File</span>
                </label>
                {selectedFile && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600">{selectedFile.name}</span>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Supported formats: PDF, PNG, JPG, JPEG, WEBP, HEIC (Max 10MB)
              </p>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Submit Answer'}
            </button>
          </form>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          {isEvaluator ? 'Submissions' : 'Your Submissions'}
        </h3>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : answers.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600">No submissions yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {answers.map((answer) => (
              <div key={answer.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900 mb-2">{answer.question_text}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                      {getStatusBadge(answer.evaluation_status)}
                      <span>Total: {answer.total_marks} marks</span>
                      {answer.marks_obtained !== null && (
                        <span className="font-semibold text-amber-600">
                          Scored: {answer.marks_obtained}/{answer.total_marks}
                        </span>
                      )}
                      <span className="text-xs text-slate-500">
                        {new Date(answer.submitted_at).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedAnswer(answer)}
                    className="ml-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Eye className="w-5 h-5 text-slate-600" />
                  </button>
                </div>

                {answer.feedback && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm font-medium text-amber-900 mb-1">Feedback:</p>
                    <p className="text-sm text-slate-700">{answer.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedAnswer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-start justify-between p-6 border-b border-slate-200">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900 mb-2">{selectedAnswer.question_text}</h2>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(selectedAnswer.evaluation_status)}
                  <span className="text-sm text-slate-600">Total: {selectedAnswer.total_marks} marks</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedAnswer(null);
                  setEvaluationMarks(0);
                  setEvaluationFeedback('');
                }}
                className="ml-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Submitted Answer</h3>
                {selectedAnswer.image_url.toLowerCase().endsWith('.pdf') ? (
                  <div className="bg-slate-100 border border-slate-300 rounded-lg p-8 text-center">
                    <FileText className="w-16 h-16 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-700 font-medium mb-2">PDF Document</p>
                    <a
                      href={selectedAnswer.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View PDF</span>
                    </a>
                  </div>
                ) : (
                  <img
                    src={selectedAnswer.image_url}
                    alt="Answer"
                    className="w-full rounded-lg border border-slate-200"
                  />
                )}
              </div>

              {isEvaluator && selectedAnswer.evaluation_status === 'pending' && (
                <div className="bg-slate-50 rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold text-slate-900">Evaluate Answer</h3>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Marks Obtained (out of {selectedAnswer.total_marks})
                    </label>
                    <input
                      type="number"
                      value={evaluationMarks}
                      onChange={(e) => setEvaluationMarks(parseFloat(e.target.value))}
                      min="0"
                      max={selectedAnswer.total_marks}
                      step="0.5"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Feedback</label>
                    <textarea
                      value={evaluationFeedback}
                      onChange={(e) => setEvaluationFeedback(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Provide constructive feedback..."
                    />
                  </div>

                  <button
                    onClick={handleEvaluate}
                    className="w-full px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    Submit Evaluation
                  </button>
                </div>
              )}

              {selectedAnswer.evaluation_status === 'evaluated' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Evaluation Results</h3>
                  <p className="text-lg font-bold text-green-800 mb-2">
                    Marks: {selectedAnswer.marks_obtained}/{selectedAnswer.total_marks}
                  </p>
                  {selectedAnswer.feedback && (
                    <div>
                      <p className="text-sm font-medium text-green-900 mb-1">Feedback:</p>
                      <p className="text-sm text-slate-700">{selectedAnswer.feedback}</p>
                    </div>
                  )}
                  {selectedAnswer.evaluated_at && (
                    <p className="text-xs text-slate-500 mt-2">
                      Evaluated on {new Date(selectedAnswer.evaluated_at).toLocaleDateString('en-IN')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
