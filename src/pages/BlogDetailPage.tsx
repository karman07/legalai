import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import blogsService, { BlogItem } from '../services/blogsService';
import PublicNavbar from '../components/PublicNavbar';

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<BlogItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!slug) return;
      try {
        const data = await blogsService.getBlogBySlug(slug);
        setBlog(data);
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen bg-brand-50 flex items-center justify-center text-brand-600">Loading...</div>;
  }

  if (!blog) {
    return <div className="min-h-screen bg-brand-50 flex items-center justify-center text-brand-600">Blog not found.</div>;
  }

  return (
    <div className="min-h-screen bg-brand-50">
      <PublicNavbar />

      <section className="relative overflow-hidden border-b border-brand-200 bg-gradient-to-b from-white to-brand-50/60">
        <div className="absolute -top-20 right-10 w-72 h-72 rounded-full bg-gold-200/30 blur-3xl" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
          <Link to="/blogs" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-900 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Blogs
          </Link>

          <h1 className="text-4xl sm:text-5xl font-black text-brand-900 tracking-tight mb-4">{blog.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-brand-500">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(blog.publishedAt || blog.createdAt || Date.now()).toLocaleDateString('en-IN')}
            </span>
            <span>By {blog.author || 'LegalPadhai Editorial'}</span>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <article className="bg-white border border-brand-200 rounded-3xl p-7 sm:p-10 shadow-card">
          <div className="prose prose-slate max-w-none prose-headings:text-brand-900 prose-p:text-brand-700 prose-p:leading-relaxed prose-li:text-brand-700">
            {blog.content}
          </div>
        </article>
      </div>
    </div>
  );
}
