import React, { useEffect, useState } from 'react';
import { Plus, Edit, Eye, Trash2, Search } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { quizService } from '../../services/quizService';
import type { Quiz, PaginationState } from '../../types';
import { PAGINATION } from '../../constants/app';
import { toast } from 'sonner';

interface QuizListProps {
  onEdit: (quiz: Quiz) => void;
  onCreate: () => void;
  onView: (quiz: Quiz) => void;
}

export const QuizList: React.FC<QuizListProps> = ({ onEdit, onCreate, onView }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');

  const fetchQuizzes = async (page = pagination.page, limit = pagination.limit) => {
    setLoading(true);
    try {
      const data = await quizService.listQuizzes({ 
        topic: topicFilter || undefined, 
        isPublished: statusFilter || undefined, 
        page, 
        limit 
      });
      setQuizzes(data.quizzes);
      setPagination({
        page: data.pagination.page,
        limit: data.pagination.limit,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages || data.pagination.pages || 0,
      });
    } catch (e) {
      // handled by service
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (quiz: Quiz) => {
    if (!confirm(`Delete "${quiz.title}"?`)) return;
    try {
      await quizService.deleteQuiz(quiz._id);
      toast.success('Quiz deleted');
      fetchQuizzes();
    } catch (e) {}
  };

  const handleBranchChange = (value: string) => {
    setBranchFilter(value);
    // Reset section filter if branch is not CSE-A or CSE-B
    if (value !== 'CSE-A' && value !== 'CSE-B') {
      setSectionFilter('');
    }
  };

  const filteredQuizzes = quizzes.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = !branchFilter || q.branch === branchFilter;
    const matchesSection = !sectionFilter || q.course === sectionFilter;
    return matchesSearch && matchesBranch && matchesSection;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quiz Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Create and manage your quizzes</p>
        </div>
        <Button onClick={onCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Create Quiz
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search quizzes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>
            <Input placeholder="Filter by topic" value={topicFilter} onChange={(e) => setTopicFilter(e.target.value)} />
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="true">Published</option>
              <option value="false">Draft</option>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <Select value={branchFilter} onChange={(e) => handleBranchChange(e.target.value)}>
              <option value="">All Branches</option>
              <option value="CSE-A">CSE-A</option>
              <option value="CSE-B">CSE-B</option>
              <option value="Electrical">Electrical</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
              <option value="Architectural">Architecture</option>
            </Select>
            
            {(branchFilter === 'CSE-A' || branchFilter === 'CSE-B') && (
              <Select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
                <option value="">All Sections</option>
                <option value="CSE-A">CSE-A</option>
                <option value="CSE-B">CSE-B</option>
              </Select>
            )}
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => fetchQuizzes(1, pagination.limit)}>Apply Filters</Button>
            <Button variant="ghost" onClick={() => { setSearchTerm(''); setTopicFilter(''); setStatusFilter(''); setBranchFilter(''); setSectionFilter(''); }}>Clear</Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">No quizzes found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <Card key={quiz._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1">{quiz.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{quiz.topic}</p>
                  </div>
                  {quiz.isPublished ? (
                    <span className="px-2 py-1 text-xs rounded bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">Published</span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">Draft</span>
                  )}
                </div>
                
                {quiz.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">{quiz.description}</p>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{quiz.questions?.length || 0} questions</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onView(quiz)}><Eye className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(quiz)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(quiz)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredQuizzes.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled={pagination.page <= 1} onClick={() => fetchQuizzes(pagination.page - 1, pagination.limit)}>Previous</Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">{pagination.page}</span>
            <Button variant="outline" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchQuizzes(pagination.page + 1, pagination.limit)}>Next</Button>
            <Select value={String(pagination.limit)} onChange={(e) => fetchQuizzes(1, Number(e.target.value))}>
              {PAGINATION.LIMIT_OPTIONS.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
            </Select>
          </div>
        </div>
      )}
    </div>
  );
};
