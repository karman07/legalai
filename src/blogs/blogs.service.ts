import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Blog, BlogDocument } from '../schemas/blog.schema';

export interface BlogResponse {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  tags?: string[];
  author?: string;
  isPublished: boolean;
  publishedAt?: Date;
  views: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BlogListResponse {
  items: BlogResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class BlogsService {
  constructor(@InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>) {}

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private normalizeTags(tags: unknown): string[] {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags.map((t) => String(t).trim()).filter(Boolean);
    if (typeof tags === 'string') {
      return tags.split(',').map((t) => t.trim()).filter(Boolean);
    }
    return [];
  }

  private toResponse(item: any): BlogResponse {
    return {
      ...item,
      _id: String(item._id),
    };
  }

  async create(payload: any): Promise<BlogResponse> {
    const title = String(payload.title || '').trim();
    if (!title) {
      throw new BadRequestException('Title is required');
    }

    const slug = this.slugify(payload.slug || title);
    const existing = await this.blogModel.findOne({ slug }).lean().exec();
    if (existing) {
      throw new BadRequestException('Slug already exists. Use a different title/slug.');
    }

    const isPublished = !!payload.isPublished;
    const doc = new this.blogModel({
      ...payload,
      title,
      slug,
      tags: this.normalizeTags(payload.tags),
      isPublished,
      publishedAt: isPublished ? new Date() : undefined,
    });

    const saved = await doc.save();
    return this.toResponse(saved.toObject());
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    includeDrafts?: boolean;
  }): Promise<BlogListResponse> {
    const { page = 1, limit = 10, search, includeDrafts = false } = params;
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 50);

    const filter: Record<string, any> = {};
    if (!includeDrafts) filter.isPublished = true;
    if (search?.trim()) {
      const rx = new RegExp(search.trim(), 'i');
      filter.$or = [{ title: rx }, { excerpt: rx }, { content: rx }, { tags: rx }, { author: rx }];
    }

    const [items, total] = await Promise.all([
      this.blogModel
        .find(filter)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip((validatedPage - 1) * validatedLimit)
        .limit(validatedLimit)
        .lean()
        .exec(),
      this.blogModel.countDocuments(filter),
    ]);

    return {
      items: (items as any[]).map((item) => this.toResponse(item)),
      total,
      page: validatedPage,
      limit: validatedLimit,
      totalPages: Math.ceil(total / validatedLimit) || 1,
    };
  }

  async findOneById(id: string): Promise<BlogResponse> {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid blog id');
    }
    const blog = await this.blogModel.findById(id).lean().exec();
    if (!blog) throw new NotFoundException('Blog not found');
    return this.toResponse(blog);
  }

  async findOneBySlug(slug: string): Promise<BlogResponse> {
    const blog = await this.blogModel.findOne({ slug, isPublished: true }).lean().exec();
    if (!blog) throw new NotFoundException('Blog not found');

    this.blogModel.findByIdAndUpdate(blog._id, { $inc: { views: 1 } }).exec().catch(() => {});
    return this.toResponse(blog);
  }

  async update(id: string, payload: any): Promise<BlogResponse> {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid blog id');
    }

    const existing = await this.blogModel.findById(id).lean().exec();
    if (!existing) throw new NotFoundException('Blog not found');

    const patch: any = { ...payload };
    if (patch.title && !patch.slug) patch.slug = this.slugify(String(patch.title));
    if (patch.slug) {
      patch.slug = this.slugify(String(patch.slug));
      const slugConflict = await this.blogModel.findOne({ slug: patch.slug, _id: { $ne: id } }).lean().exec();
      if (slugConflict) throw new BadRequestException('Slug already exists. Use a different title/slug.');
    }
    if (patch.tags !== undefined) patch.tags = this.normalizeTags(patch.tags);
    if (patch.isPublished === true && !existing.publishedAt) patch.publishedAt = new Date();

    const updated = await this.blogModel.findByIdAndUpdate(id, patch, { new: true }).lean().exec();
    if (!updated) throw new NotFoundException('Blog not found');
    return this.toResponse(updated);
  }

  async remove(id: string): Promise<{ message: string; id: string }> {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid blog id');
    }
    const deleted = await this.blogModel.findByIdAndDelete(id).lean().exec();
    if (!deleted) throw new NotFoundException('Blog not found');
    return { message: 'Blog deleted successfully', id };
  }
}
