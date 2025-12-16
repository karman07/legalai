import React, { useState } from 'react';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { QuestionEditor } from '../../components/quiz/QuestionEditor';
import type { Quiz, QuizQuestion, CreateQuizPayload } from '../../types';
import { quizService } from '../../services/quizService';
import { toast } from 'sonner';

interface QuizFormProps {
  quiz?: Quiz | null;
  onBack: () => void;
  onSave: () => void;
}

export const QuizForm: React.FC<QuizFormProps> = ({ quiz, onBack, onSave }) => {
  const [formData, setFormData] = useState<CreateQuizPayload>({
    title: quiz?.title || '',
    topic: quiz?.topic || '',
    description: quiz?.description || '',
    branch: quiz?.branch || '',
    course: quiz?.course || '',
    isPublished: quiz?.isPublished || false,
    questions: quiz?.questions || []
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.topic.trim()) {
      toast.error('Title and topic are required');
      return;
    }
    if (formData.questions.length === 0) {
      toast.error('Add at least one question');
      return;
    }
    
    setSaving(true);
    try {
      if (quiz) {
        await quizService.updateQuiz(quiz._id, formData);
        toast.success('Quiz updated successfully');
      } else {
        await quizService.createQuiz(formData);
        toast.success('Quiz created successfully');
      }
      onSave();
    } catch (e) {
      // handled by service
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = () => {
    const newQ: QuizQuestion = { text: '', options: ['', '', '', ''], correctOptionIndex: 0, explanation: '' };
    setFormData({ ...formData, questions: [...formData.questions, newQ] });
  };

  const updateQuestion = (idx: number, updated: Partial<QuizQuestion>) => {
    const next = [...formData.questions];
    next[idx] = { ...next[idx], ...updated };
    setFormData({ ...formData, questions: next });
  };

  const removeQuestion = (idx: number) => {
    setFormData({ ...formData, questions: formData.questions.filter((_, i) => i !== idx) });
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{quiz ? 'Edit Quiz' : 'Create New Quiz'}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Fill in the details below</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Quiz'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Enter quiz title" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Topic *</label>
            <Input value={formData.topic} onChange={(e) => setFormData({ ...formData, topic: e.target.value })} placeholder="e.g., Constitutional Law" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the quiz"
            />
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="published" 
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="published" className="text-sm font-medium">Publish immediately</label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Questions ({formData.questions.length})</CardTitle>
            <Button onClick={addQuestion} size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Add Question
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No questions yet. Click "Add Question" to get started.
            </div>
          ) : (
            formData.questions.map((q, idx) => (
              <QuestionEditor
                key={idx}
                question={q}
                index={idx}
                onChange={(field, value) => updateQuestion(idx, { [field]: value })}
                onRemove={() => removeQuestion(idx)}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
