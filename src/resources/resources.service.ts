import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Resource, ResourceDocument } from '../schemas/resource.schema';
import { ResourceCategory, ResourceCategoryDocument } from '../schemas/resource-category.schema';

export type ResourceKind = 'resource' | 'study-material';

export interface ResourceResponse {
  _id: string;
  kind: ResourceKind;
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

export interface ResourceCategoryResponse {
  _id: string;
  kind: ResourceKind;
  name: string;
  isActive: boolean;
  resourceCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class ResourcesService {
  constructor(
    @InjectModel(Resource.name) private readonly resourceModel: Model<ResourceDocument>,
    @InjectModel(ResourceCategory.name) private readonly resourceCategoryModel: Model<ResourceCategoryDocument>,
  ) {}

  private normalizeKind(kind?: string): ResourceKind {
    return kind === 'study-material' ? 'study-material' : 'resource';
  }

  private getKindFilter(kind?: string): any {
    const normalizedKind = this.normalizeKind(kind);
    if (normalizedKind === 'resource') {
      // Backward compatibility for old rows created before `kind` was introduced.
      return { $in: ['resource', null] };
    }
    return normalizedKind;
  }

  private normalizeCategoryName(name: string): string {
    return name.trim().replace(/\s+/g, ' ');
  }

  private async ensureCategoryExists(category?: string, kind?: string): Promise<string> {
    const normalizedCategory = this.normalizeCategoryName(category || '');
    const normalizedKind = this.normalizeKind(kind);
    if (!normalizedCategory) {
      throw new BadRequestException('Category is required');
    }

    const existingCategory = await this.resourceCategoryModel.findOne({
      kind: normalizedKind,
      name: normalizedCategory,
      isActive: true,
    }).lean();

    if (!existingCategory) {
      throw new BadRequestException('Please create a category first, then upload study material');
    }

    return normalizedCategory;
  }

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
    const kind = this.normalizeKind(payload.kind);
    const category = await this.ensureCategoryExists(payload.category, kind);
    const data = {
      ...payload,
      kind,
      category,
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
    kind?: ResourceKind;
  }): Promise<ResourceListResponse> {
    const {
      page = 1,
      limit = 20,
      search,
      fileType,
      category,
      isActive,
      kind,
    } = params;

    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100);

    const filter: Record<string, any> = {};
    if (fileType) filter.fileType = fileType;
    filter.kind = this.getKindFilter(kind);
    if (category?.trim()) filter.category = this.normalizeCategoryName(category);
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

  async getCategories(kind?: ResourceKind): Promise<string[]> {
    const normalizedKind = this.normalizeKind(kind);
    const [configuredCategories, usedCategories] = await Promise.all([
      this.resourceCategoryModel.find({ kind: normalizedKind, isActive: true }).select('name').sort({ name: 1 }).lean(),
      this.resourceModel.distinct('category', { kind: this.getKindFilter(normalizedKind), isActive: true }),
    ]);

    const nameSet = new Set<string>();
    configuredCategories.forEach((item: any) => {
      if (item?.name) {
        nameSet.add(item.name);
      }
    });

    usedCategories.filter(Boolean).forEach((name: string) => {
      nameSet.add(this.normalizeCategoryName(name));
    });

    return Array.from(nameSet).sort((a, b) => a.localeCompare(b));
  }

  async getCategoryDetails(isActive?: boolean, kind?: ResourceKind): Promise<ResourceCategoryResponse[]> {
    const normalizedKind = this.normalizeKind(kind);
    const filter = typeof isActive === 'boolean' ? { kind: normalizedKind, isActive } : { kind: normalizedKind };
    const categories = await this.resourceCategoryModel.find(filter).sort({ name: 1 }).lean();

    const categoryNames = categories.map((item: any) => item.name).filter(Boolean);
    const usageCounts = await this.resourceModel.aggregate([
      { $match: { kind: this.getKindFilter(normalizedKind), category: { $in: categoryNames } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const usageMap = new Map<string, number>();
    usageCounts.forEach((entry: any) => usageMap.set(entry._id, entry.count));

    return categories.map((item: any) => ({
      _id: String(item._id),
      kind: item.kind,
      name: item.name,
      isActive: Boolean(item.isActive),
      resourceCount: usageMap.get(item.name) || 0,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  }

  async createCategory(name: string, kind?: ResourceKind): Promise<ResourceCategoryResponse> {
    const normalizedKind = this.normalizeKind(kind);
    const normalizedName = this.normalizeCategoryName(name || '');
    if (!normalizedName) {
      throw new BadRequestException('Category name is required');
    }

    const existing = await this.resourceCategoryModel.findOne({ kind: normalizedKind, name: normalizedName }).lean();
    if (existing) {
      throw new ConflictException('Category already exists');
    }

    const created = await this.resourceCategoryModel.create({ kind: normalizedKind, name: normalizedName, isActive: true });

    return {
      _id: String(created._id),
      kind: created.kind,
      name: created.name,
      isActive: created.isActive,
      resourceCount: 0,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  async updateCategory(id: string, name: string, kind?: ResourceKind): Promise<ResourceCategoryResponse> {
    const normalizedKind = this.normalizeKind(kind);
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid category id');
    }

    const normalizedName = this.normalizeCategoryName(name || '');
    if (!normalizedName) {
      throw new BadRequestException('Category name is required');
    }

    const existingCategory = await this.resourceCategoryModel.findOne({ _id: new Types.ObjectId(id), kind: normalizedKind });
    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    const previousName = existingCategory.name;

    const duplicate = await this.resourceCategoryModel.findOne({
      _id: { $ne: new Types.ObjectId(id) },
      kind: normalizedKind,
      name: normalizedName,
    }).lean();
    if (duplicate) {
      throw new ConflictException('Category already exists');
    }

    existingCategory.name = normalizedName;
    await existingCategory.save();

    if (previousName !== normalizedName) {
      await this.resourceModel.updateMany({ kind: this.getKindFilter(normalizedKind), category: previousName }, { $set: { category: normalizedName } });
    }

    const resourceCount = await this.resourceModel.countDocuments({ kind: this.getKindFilter(normalizedKind), category: normalizedName });
    return {
      _id: String(existingCategory._id),
      kind: existingCategory.kind,
      name: existingCategory.name,
      isActive: existingCategory.isActive,
      resourceCount,
      createdAt: existingCategory.createdAt,
      updatedAt: existingCategory.updatedAt,
    };
  }

  async removeCategory(id: string, kind?: ResourceKind): Promise<{ message: string; id: string }> {
    const normalizedKind = this.normalizeKind(kind);
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid category id');
    }

    const existingCategory = await this.resourceCategoryModel.findOne({ _id: new Types.ObjectId(id), kind: normalizedKind });
    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    const fallback = await this.resourceCategoryModel.findOne({ kind: normalizedKind, name: 'General' });
    if (!fallback) {
      await this.resourceCategoryModel.create({ kind: normalizedKind, name: 'General', isActive: true });
    }

    await this.resourceModel.updateMany(
      { kind: this.getKindFilter(normalizedKind), category: existingCategory.name },
      { $set: { category: 'General' } },
    );

    await this.resourceCategoryModel.findByIdAndDelete(id);
    return { message: 'Category deleted successfully', id };
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

    if (dto.category !== undefined) {
      dto.category = await this.ensureCategoryExists(dto.category, existing.kind);
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
