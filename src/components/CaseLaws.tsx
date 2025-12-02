import { useState, useEffect } from 'react';

type Court = {
  id: string;
  name: string;
  level: 'supreme' | 'high' | 'district';
  state: string | null;
  created_at: string;
};

type CaseLaw = {
  id: string;
  case_title: string;
  case_number: string;
  court_id: string | null;
  judgment_date: string;
  year: number;
  citation: string | null;
  judges: string[] | null;
  summary: string;
  full_text: string | null;
  keywords: string[] | null;
  category: string | null;
  created_at: string;
};
import { Scale, Search, Filter, Calendar, Building2, BookText, X } from 'lucide-react';

export default function CaseLaws() {
  const [caseLaws, setCaseLaws] = useState<(CaseLaw & { court?: Court })[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedCourt, setSelectedCourt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCase, setSelectedCase] = useState<(CaseLaw & { court?: Court }) | null>(null);

  useEffect(() => {
    loadCourts();
    loadCaseLaws();
  }, []);

  useEffect(() => {
    loadCaseLaws();
  }, [selectedYear, selectedCourt, selectedCategory, searchTerm]);

  const loadCourts = async () => {
    try {
      // TODO: Implement courts loading logic
      setCourts([]);
    } catch (error) {
      console.error('Error loading courts:', error);
    }
  };

  const loadCaseLaws = async () => {
    setLoading(true);
    try {
      // TODO: Implement case laws loading logic
      setCaseLaws([]);
    } catch (error) {
      console.error('Error loading case laws:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedYear('');
    setSelectedCourt('');
    setSelectedCategory('');
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const categories = [
    'Constitutional Law',
    'Criminal Law',
    'Civil Law',
    'Corporate Law',
    'Tax Law',
    'Family Law',
    'Property Law',
    'Labour Law',
    'Environmental Law',
    'Intellectual Property'
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center">
            <Scale className="w-7 h-7 mr-2 text-amber-600" />
            Case Laws Database
          </h2>
          <p className="text-slate-600 mt-1">Browse Indian case laws by year and court</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by case title, number, or keywords..."
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={selectedCourt}
                onChange={(e) => setSelectedCourt(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">All Courts</option>
                {courts.map((court) => (
                  <option key={court.id} value={court.id}>
                    {court.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(selectedYear || selectedCourt || selectedCategory || searchTerm) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : caseLaws.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <BookText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">No case laws found matching your criteria.</p>
          <p className="text-sm text-slate-500 mt-2">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {caseLaws.map((caseLaw) => (
            <div
              key={caseLaw.id}
              onClick={() => setSelectedCase(caseLaw)}
              className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-900 flex-1">{caseLaw.case_title}</h3>
                <span className="ml-3 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                  {caseLaw.year}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-slate-600 mb-2">
                <span className="flex items-center">
                  <Building2 className="w-4 h-4 mr-1" />
                  {caseLaw.court?.name || 'Unknown Court'}
                </span>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(caseLaw.judgment_date).toLocaleDateString('en-IN')}
                </span>
                {caseLaw.category && (
                  <span className="px-2 py-1 bg-slate-100 rounded text-xs">{caseLaw.category}</span>
                )}
              </div>

              <p className="text-sm text-slate-700 line-clamp-2">{caseLaw.summary}</p>

              {caseLaw.citation && (
                <p className="text-xs text-slate-500 mt-2 font-mono">{caseLaw.citation}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedCase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-start justify-between p-6 border-b border-slate-200">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedCase.case_title}</h2>
                <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                  <span className="font-mono">{selectedCase.case_number}</span>
                  <span>•</span>
                  <span>{selectedCase.court?.name}</span>
                  <span>•</span>
                  <span>{new Date(selectedCase.judgment_date).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="ml-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedCase.citation && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Citation</h3>
                  <p className="text-slate-700 font-mono text-sm">{selectedCase.citation}</p>
                </div>
              )}

              {selectedCase.judges && selectedCase.judges.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Judges</h3>
                  <p className="text-slate-700">{selectedCase.judges.join(', ')}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Summary</h3>
                <p className="text-slate-700 whitespace-pre-wrap">{selectedCase.summary}</p>
              </div>

              {selectedCase.full_text && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Full Judgment</h3>
                  <div className="text-slate-700 whitespace-pre-wrap bg-slate-50 p-4 rounded-lg">
                    {selectedCase.full_text}
                  </div>
                </div>
              )}

              {selectedCase.keywords && selectedCase.keywords.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCase.keywords.map((keyword, idx) => (
                      <span key={idx} className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
