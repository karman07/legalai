import apiClient from './api';

export interface BlogItem {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  tags?: string[];
  author?: string;
  isPublished: boolean;
  publishedAt?: string;
  views: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogListResponse {
  items: BlogItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const fallbackBlogs: BlogItem[] = [
  {
    _id: 'fallback-1',
    title: 'How To Read A Supreme Court Judgment Faster',
    slug: 'how-to-read-supreme-court-judgment-faster',
    excerpt: 'A practical framework to quickly identify ratio, issues, and final holdings without losing legal depth.',
    content: 'Reading judgments efficiently requires structure. Start with case metadata, identify the legal issue, then track submissions, reasoning, and final holding. Maintain one-page note templates for recurring subjects and convert each judgment into revision bullets.',
    tags: ['Judiciary Prep', 'Case Law'],
    author: 'LegalPadhai Editorial',
    isPublished: true,
    publishedAt: new Date().toISOString(),
    views: 0,
  },
  {
    _id: 'fallback-2',
    title: 'IPC Revision Plan In 30 Minutes A Day',
    slug: 'ipc-revision-plan-30-minutes',
    excerpt: 'Daily micro-revision method for IPC sections, illustrations, and common question patterns.',
    content: 'Use a 30-minute cycle: 10 minutes section recap, 10 minutes illustrations, 10 minutes MCQs. Every 7th day, do cumulative revision and error log review. This keeps memory active without burnout.',
    tags: ['IPC', 'Revision'],
    author: 'LegalPadhai Editorial',
    isPublished: true,
    publishedAt: new Date().toISOString(),
    views: 0,
  },
  {
    _id: 'fallback-3',
    title: 'Bare Act To Answer Writing: A Conversion Workflow',
    slug: 'bare-act-to-answer-writing-workflow',
    excerpt: 'Turn raw sections into examiner-friendly mains answers with issue-rule-application flow.',
    content: 'Pick one provision, write 2-line principle, attach one case reference, then apply it to a hypothetical. Repeat with timed practice. This creates direct transfer from statute reading to answer writing quality.',
    tags: ['Mains', 'Answer Writing'],
    author: 'LegalPadhai Editorial',
    isPublished: true,
    publishedAt: new Date().toISOString(),
    views: 0,
  },
];

class BlogsService {
  async getBlogs(page = 1, limit = 9, search?: string): Promise<BlogListResponse> {
    try {
      const query = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search?.trim()) query.append('search', search.trim());
      const response = await apiClient<BlogListResponse>(`/blogs?${query.toString()}`, { method: 'GET' });
      if (!response.items || response.items.length === 0) {
        return {
          items: fallbackBlogs,
          total: fallbackBlogs.length,
          page: 1,
          limit: fallbackBlogs.length,
          totalPages: 1,
        };
      }
      return response;
    } catch {
      return {
        items: fallbackBlogs,
        total: fallbackBlogs.length,
        page: 1,
        limit: fallbackBlogs.length,
        totalPages: 1,
      };
    }
  }

  async getBlogBySlug(slug: string): Promise<BlogItem> {
    try {
      return await apiClient<BlogItem>(`/blogs/slug/${slug}`, { method: 'GET' });
    } catch {
      const match = fallbackBlogs.find((b) => b.slug === slug);
      if (match) return match;
      throw new Error('Blog not found');
    }
  }
}

export default new BlogsService();
