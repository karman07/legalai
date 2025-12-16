import { useState } from 'react';
import { Loader2, Wand2, Info } from 'lucide-react';
import quizService, { Quiz } from '../services/quizService';

interface GenerateAIQuizProps {
  onGenerated: (quiz: Quiz) => void;
}

export default function GenerateAIQuiz({ onGenerated }: GenerateAIQuizProps) {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(10);
  const [advanced, setAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setError('');
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }
    if (count < 1 || count > 20) {
      setError('Count must be between 1 and 20');
      return;
    }

    try {
      setLoading(true);
      const generated = await quizService.generateAIQuiz(topic.trim(), count);
      onGenerated(generated);
    } catch (err: any) {
      setError(err.message || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-amber-600" />
          AI Custom Quiz
        </h3>
        <button
          type="button"
          onClick={() => setAdvanced(a => !a)}
          className="text-xs px-3 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          {advanced ? 'Basic' : 'Advanced'}
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Indian Penal Code (IPC)"
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-slate-500 inline-flex items-center gap-1"><Info className="w-3 h-3" /> Use specific chapters or acts for best results.</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Questions (max 20)</label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            min={1}
            max={20}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
      </div>

      {advanced && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Difficulty (optional)</label>
            <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent">
              <option>Mixed</option>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Include explanations</label>
            <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent">
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Generating...</span>
          ) : (
            <span className="inline-flex items-center gap-2"><Wand2 className="w-4 h-4" /> Generate</span>
          )}
        </button>
        <span className="text-xs text-slate-500">Max 20 questions</span>
      </div>
    </div>
  );
}
