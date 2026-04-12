import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Resource, ResourceDocument } from '../schemas/resource.schema';

export interface ResourceResponse {
  _id: string;
  title: string;
  description?: string;
  fileType: 'pdf' | 'md';
  fileName: string;
  fileUrl: string;
  originalName?: string;
  category?: string;
  tags?: string[];
  isActive: boolean;
  uploadedBy?: any;
  fileSize?: number;
  mimeType?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ResourceListResponse {
  items: ResourceResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

@Injectable()
export class ResourcesService {
  constructor(
    @InjectModel(Resource.name) private readonly resourceModel: Model<ResourceDocument>,
  ) {}

  private getTypeFromFilename(filename: string): 'pdf' | 'md' {
    const lower = filename.toLowerCase();
    if (lower.endsWith('.pdf')) return 'pdf';
    return 'md';
  }

  private normalizeTags(tags: unknown): string[] {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags.map((t) => String(t).trim()).filter(Boolean);
    if (typeof tags === 'string') {
      return tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }
    return [];
  }

  async create(payload: any, uploadedBy?: string): Promise<ResourceResponse> {
    const data = {
      ...payload,
      tags: this.normalizeTags(payload.tags),
      fileType: this.getTypeFromFilename(payload.fileName),
      uploadedBy: uploadedBy ? new Types.ObjectId(uploadedBy) : undefined,
    };

    const doc = new this.resourceModel(data);
    const saved = await doc.save();
    const item = saved.toObject();
    return {
      ...(item as any),
      _id: String((item as any)._id),
      fileUrl: `/uploads/resources/${item.fileName}`,
    };
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    fileType?: 'pdf' | 'md';
    category?: string;
    isActive?: boolean;
  }): Promise<ResourceListResponse> {
    const {
      page = 1,
      limit = 20,
      search,
      fileType,
      category,
      isActive,
    } = params;

    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100);

    const filter: Record<string, any> = {};
    if (fileType) filter.fileType = fileType;
    if (category) filter.category = category;
    if (typeof isActive === 'boolean') filter.isActive = isActive;

    if (search && search.trim()) {
      const rx = new RegExp(search.trim(), 'i');
      filter.$or = [{ title: rx }, { description: rx }, { category: rx }, { tags: rx }, { originalName: rx }];
    }

    const [items, total] = await Promise.all([
      this.resourceModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((validatedPage - 1) * validatedLimit)
        .limit(validatedLimit)
        .lean()
        .exec(),
      this.resourceModel.countDocuments(filter),
    ]);

    const mappedItems: ResourceResponse[] = (items as any[]).map((item) => ({
      ...item,
      _id: String(item._id),
      fileUrl: `/uploads/resources/${item.fileName}`,
    }));

    return {
      items: mappedItems,
      total,
      page: validatedPage,
      limit: validatedLimit,
      totalPages: Math.ceil(total / validatedLimit) || 1,
      hasNext: validatedPage * validatedLimit < total,
      hasPrev: validatedPage > 1,
    };
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.resourceModel.distinct('category', { isActive: true });
    return categories.filter(Boolean).sort();
  }

  async findOne(id: string): Promise<ResourceResponse> {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid resource id');
    }

    const item = await this.resourceModel.findById(id).lean().exec();
    if (!item) {
      throw new NotFoundException('Resource not found');
    }

    return {
      ...(item as any),
      _id: String((item as any)._id),
      fileUrl: `/uploads/resources/${item.fileName}`,
    };
  }

  async update(id: string, dto: any): Promise<ResourceResponse> {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid resource id');
    }

    const existing = await this.resourceModel.findById(id);
    if (!existing) {
      throw new NotFoundException('Resource not found');
    }

    if (dto.fileName && dto.fileName !== existing.fileName) {
      await this.deleteFile(existing.fileName);
      dto.fileType = this.getTypeFromFilename(dto.fileName);
    }

    if (dto.tags !== undefined) {
      dto.tags = this.normalizeTags(dto.tags);
    }

    const updated = await this.resourceModel.findByIdAndUpdate(id, dto, { new: true }).lean().exec();
    if (!updated) {
      throw new NotFoundException('Resource not found');
    }

    return {
      ...(updated as any),
      _id: String((updated as any)._id),
      fileUrl: `/uploads/resources/${updated.fileName}`,
    };
  }

  async remove(id: string): Promise<{ message: string; id: string }> {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid resource id');
    }

    const removed = await this.resourceModel.findByIdAndDelete(id);
    if (!removed) {
      throw new NotFoundException('Resource not found');
    }

    await this.deleteFile(removed.fileName);
    return { message: 'Resource deleted successfully', id };
  }

  private async deleteFile(fileName: string): Promise<void> {
    if (!fileName) return;
    try {
      const fullPath = path.join(process.cwd(), 'uploads', 'resources', fileName);
      await fs.unlink(fullPath);
    } catch {
      // Ignore missing files
    }
  }
}
