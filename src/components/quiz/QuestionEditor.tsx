import React from 'react';
import { Trash2 } from 'lucide-react';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Button } from '../ui/button';
import { QuizQuestion } from '../../types';

interface QuestionEditorProps {
  question: QuizQuestion;
  index: number;
  onUpdate: (index: number, field: keyof QuizQuestion, value: any) => void;
  onRemove: () => void;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({ question, index, onUpdate, onRemove }) => {
  const onChange = (field: keyof QuizQuestion, value: any) => {
    onUpdate(index, field, value);
  };

  const updateOption = (optionIndex: number, value: string) => {
    const newOptions = [...question.options];
    newOptions[optionIndex] = value;
    onChange('options', newOptions);
  };

  return (
    <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-white">Question {index + 1} *</label>
          <Input
            placeholder="Enter your question"
            value={question.text}
            onChange={(e) => onChange('text', e.target.value)}
            required
            className="text-base"
          />
        </div>
        <Button variant="ghost" size="sm" onClick={onRemove} className="text-red-500 hover:text-red-600 mt-7">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-900 dark:text-white">Answer Options *</label>
        <div className="grid gap-3">
          {question.options.map((option, optIndex) => (
            <div key={optIndex} className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium flex-shrink-0">
                {String.fromCharCode(65 + optIndex)}
              </div>
              <Input
                placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                value={option}
                onChange={(e) => updateOption(optIndex, e.target.value)}
                required
                className="flex-1"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-white">Correct Answer *</label>
          <Select 
            value={question.correctOptionIndex.toString()} 
            onChange={(e) => onChange('correctOptionIndex', parseInt(e.target.value))}
          >
            {question.options.map((_, optIndex) => (
              <option key={optIndex} value={optIndex}>
                Option {String.fromCharCode(65 + optIndex)}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-white">Explanation (Optional)</label>
          <Input
            placeholder="Explain the correct answer"
            value={question.explanation || ''}
            onChange={(e) => onChange('explanation', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
