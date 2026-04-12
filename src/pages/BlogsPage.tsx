import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Search, ArrowRight, BookOpen } from 'lucide-react';
import blogsService, { BlogItem } from '../services/blogsService';
import PublicNavbar from '../components/PublicNavbar';

export default function BlogsPage() {
  const [items, setItems] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const data = await blogsService.getBlogs(1, 9, activeSearch || undefined);
      setItems(data.items || []);
      setLoading(false);
    };
    void run();
  }, [activeSearch]);

  return (
    <div className="min-h-screen bg-brand-50">
      <PublicNavbar />

      <section className="relative overflow-hidden border-b border-brand-200 bg-gradient-to-b from-white to-brand-50/60">
        <div className="absolute -top-24 right-10 w-72 h-72 rounded-full bg-gold-200/30 blur-3xl" />
        <div className="absolute -bottom-24 left-10 w-72 h-72 rounded-full bg-brand-200/40 blur-3xl" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.18em] text-brand-700 bg-white border border-brand-200 rounded-full px-4 py-2 mb-4">
            Insights and Strategy
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-brand-900 mb-4">
            LegalPadhai <span className="text-gold-600">Blog</span>
          </h1>
          <p className="text-brand-600 text-lg sm:text-xl max-w-3xl mx-auto">
            Exam strategy, case-law reading methods, and practical legal learning playbooks.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="max-w-xl mx-auto mb-8 relative">
          <Search className="w-4 h-4 text-brand-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setActiveSearch(searchTerm)}
            placeholder="Search blogs..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-brand-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border border-brand-200 rounded-2xl p-6 animate-pulse">
                <div className="h-5 bg-brand-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-brand-100 rounded w-full mb-2" />
                <div className="h-3 bg-brand-100 rounded w-5/6" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((blog) => (
              <article
                key={blog._id}
                className="bg-white border border-brand-200 rounded-3xl p-6 hover:border-gold-300 hover:shadow-elevated transition-all duration-300"
              >
                <div className="flex items-center gap-2 text-xs text-brand-500 mb-3">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(blog.publishedAt || blog.createdAt || Date.now()).toLocaleDateString('en-IN')}</span>
                </div>
                <h2 className="text-2xl font-extrabold text-brand-900 mb-2 leading-tight line-clamp-2">{blog.title}</h2>
                <p className="text-sm text-brand-600 mb-5 leading-relaxed line-clamp-3">{blog.excerpt || 'Read this practical legal learning insight.'}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-brand-500">{blog.author || 'LegalPadhai Editorial'}</span>
                  <Link to={`/blogs/${blog.slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-700 hover:text-gold-800">
                    Read Article
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="text-center py-16 bg-white border border-brand-200 rounded-2xl">
            <BookOpen className="w-10 h-10 text-brand-300 mx-auto mb-3" />
            <p className="text-brand-600">No blogs found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
