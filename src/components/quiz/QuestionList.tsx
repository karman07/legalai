import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { QuizQuestion } from '../../types';
import { QuestionEditor } from './QuestionEditor';

interface QuestionListProps {
  questions: QuizQuestion[];
  onAdd: () => void;
  onUpdate: (index: number, field: keyof QuizQuestion, value: any) => void;
  onRemove: (index: number) => void;
}

export const QuestionList: React.FC<QuestionListProps> = ({ questions, onAdd, onUpdate, onRemove }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Questions ({questions.length})</h3>
        <Button onClick={onAdd} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" /> Add Question
        </Button>
      </div>

      {questions.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed rounded-lg bg-muted/30">
          <p className="text-muted-foreground mb-3">No questions added yet</p>
          <Button onClick={onAdd} size="sm">
            <Plus className="w-4 h-4 mr-2" /> Add Your First Question
          </Button>
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {questions.map((question, index) => (
            <QuestionEditor
              key={index}
              question={question}
              index={index}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
};
