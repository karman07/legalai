import React, { useState } from 'react';
import { QuizList } from './QuizList';
import { QuizForm } from './QuizForm';
import { QuizView } from './QuizView';
import type { Quiz } from '../../types';

type ViewMode = 'list' | 'create' | 'edit' | 'view';

export const QuizAdmin: React.FC = () => {
  const [mode, setMode] = useState<ViewMode>('list');
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  const handleCreate = () => {
    setSelectedQuiz(null);
    setMode('create');
  };

  const handleEdit = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setMode('edit');
  };

  const handleView = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setMode('view');
  };

  const handleBack = () => {
    setSelectedQuiz(null);
    setMode('list');
  };

  const handleSave = () => {
    setSelectedQuiz(null);
    setMode('list');
  };

  if (mode === 'create' || mode === 'edit') {
    return <QuizForm quiz={selectedQuiz} onBack={handleBack} onSave={handleSave} />;
  }

  if (mode === 'view' && selectedQuiz) {
    return <QuizView quiz={selectedQuiz} onBack={handleBack} onEdit={() => handleEdit(selectedQuiz)} />;
  }

  return <QuizList onCreate={handleCreate} onEdit={handleEdit} onView={handleView} />;
};
