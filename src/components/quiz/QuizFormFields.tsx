import React from 'react';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { CreateQuizPayload } from '../../types';

interface QuizFormFieldsProps {
  formData: Omit<CreateQuizPayload, 'questions'> & { questions: any[] };
  onChange: (field: string, value: any) => void;
}

export const QuizFormFields: React.FC<QuizFormFieldsProps> = ({ formData, onChange }) => {
  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
      <h3 className="font-semibold text-lg">Quiz Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Title *</label>
          <Input
            placeholder="Quiz title"
            value={formData.title}
            onChange={(e) => onChange('title', e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Topic *</label>
          <Input
            placeholder="e.g., IPC, Constitution, CrPC"
            value={formData.topic}
            onChange={(e) => onChange('topic', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Branch</label>
          <Select value={formData.branch || ''} onChange={(e) => onChange('branch', e.target.value)}>
            <option value="">Select Branch</option>
            <option value="CSE-A">CSE-A</option>
            <option value="CSE-B">CSE-B</option>
            <option value="Electrical">Electrical</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Civil">Civil</option>
            <option value="Architectural">Architecture</option>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Course</label>
          <Select value={formData.course || ''} onChange={(e) => onChange('course', e.target.value)}>
            <option value="">Select Course</option>
            <option value="CSE-A">CSE-A</option>
            <option value="CSE-B">CSE-B</option>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Input
          placeholder="Brief description of the quiz"
          value={formData.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Status *</label>
        <Select value={(formData.isPublished ?? false).toString()} onChange={(e) => onChange('isPublished', e.target.value === 'true')}>
          <option value="false">Draft</option>
          <option value="true">Published</option>
        </Select>
      </div>
    </div>
  );
};
