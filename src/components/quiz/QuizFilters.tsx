import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Button } from '../ui/button';

interface QuizFiltersProps {
  filters: { topic: string; isPublished: string };
  onFilterChange: (filters: { topic: string; isPublished: string }) => void;
  onApply: () => void;
}

export const QuizFilters: React.FC<QuizFiltersProps> = ({ filters, onFilterChange, onApply }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
      <div className="md:col-span-2">
        <Input
          placeholder="Filter by topic (e.g., IPC, CrPC, Constitution)"
          value={filters.topic}
          onChange={(e) => onFilterChange({ ...filters, topic: e.target.value })}
        />
      </div>
      <div>
        <Select value={filters.isPublished} onChange={(e) => onFilterChange({ ...filters, isPublished: e.target.value })}>
          <option value="">All Status</option>
          <option value="true">Published</option>
          <option value="false">Draft</option>
        </Select>
      </div>
      <div>
        <Button variant="outline" onClick={onApply} className="w-full">
          <Search className="w-4 h-4 mr-2" /> Apply Filters
        </Button>
      </div>
    </div>
  );
};
