import React from 'react';
import { ArrowLeft, Edit, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import type { Quiz } from '../../types';

interface QuizViewProps {
  quiz: Quiz;
  onBack: () => void;
  onEdit: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ quiz, onBack, onEdit }) => {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quiz Preview</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">View quiz details</p>
          </div>
        </div>
        <Button onClick={onEdit} className="gap-2">
          <Edit className="w-4 h-4" /> Edit Quiz
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl">{quiz.title}</CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Topic: {quiz.topic}</p>
            </div>
            {quiz.isPublished ? (
              <span className="px-3 py-1 text-sm rounded bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">Published</span>
            ) : (
              <span className="px-3 py-1 text-sm rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">Draft</span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {quiz.description && (
            <p className="text-gray-700 dark:text-gray-300">{quiz.description}</p>
          )}
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>{quiz.questions.length} Questions</span>
            {quiz.createdAt && <span>Created: {new Date(quiz.createdAt).toLocaleDateString()}</span>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {quiz.questions.map((q, idx) => (
            <div key={idx} className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold text-sm">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white mb-3">{q.text}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, i) => (
                      <div 
                        key={i} 
                        className={`p-3 rounded-lg border ${
                          i === q.correctOptionIndex 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/10' 
                            : 'border-gray-200 dark:border-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {i === q.correctOptionIndex && <CheckCircle className="w-4 h-4 text-green-600" />}
                          <span className={i === q.correctOptionIndex ? 'text-green-700 dark:text-green-400 font-medium' : ''}>
                            {opt}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                      <p className="text-sm text-blue-900 dark:text-blue-300">
                        <span className="font-semibold">Explanation: </span>
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
