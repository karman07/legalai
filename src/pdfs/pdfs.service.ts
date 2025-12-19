import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Pdf, PdfDocument } from '../schemas/pdf.schema';
import { CreatePdfDto } from './dto/create-pdf.dto';
import { UpdatePdfDto } from './dto/update-pdf.dto';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class PdfsService {
  constructor(
    @InjectModel(Pdf.name) private readonly pdfModel: Model<PdfDocument>,
  ) {}

  async create(createDto: CreatePdfDto, uploadedBy?: string) {
    const doc = new this.pdfModel({
      ...createDto,
      uploadedBy: uploadedBy ? new Types.ObjectId(uploadedBy) : undefined,
    });
    return await doc.save();
  }

  async findAll(params: { 
    page?: number; 
    limit?: number; 
    isActive?: boolean; 
    filters?: Record<string, any>;
    sort?: Record<string, 1 | -1>;
  }) {
    const { 
      page = 1, 
      limit = 20, 
      isActive, 
      filters = {}, 
      sort = { createdAt: -1 }
    } = params;
    
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100);
    
    const filter: Record<string, any> = { ...filters };
    if (typeof isActive === 'boolean') filter.isActive = isActive;

    const [items, total] = await Promise.all([
      this.pdfModel
        .find(filter, '-fullText')
        .sort(sort)
        .skip((validatedPage - 1) * validatedLimit)
        .limit(validatedLimit)
        .lean(),
      this.pdfModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page: validatedPage,
      limit: validatedLimit,
      totalPages: Math.ceil(total / validatedLimit) || 1,
      hasNext: validatedPage * validatedLimit < total,
      hasPrev: validatedPage > 1
    };
  }

  async searchPdfs(params: {
    query: string;
    page?: number;
    limit?: number;
    filters?: Record<string, any>;
  }) {
    const { query, page = 1, limit = 20, filters = {} } = params;
    
    if (!query || query.trim().length < 2) {
      return { items: [], total: 0, page, limit, totalPages: 0, hasNext: false, hasPrev: false };
    }

    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100);
    
    const searchFilter = {
      ...filters,
      isActive: true,
      $text: { $search: query }
    };

    const [items, total] = await Promise.all([
      this.pdfModel
        .find(searchFilter, { 
          score: { $meta: 'textScore' },
          fullText: 0
        })
        .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
        .skip((validatedPage - 1) * validatedLimit)
        .limit(validatedLimit)
        .lean(),
      this.pdfModel.countDocuments(searchFilter),
    ]);

    return {
      items,
      total,
      page: validatedPage,
      limit: validatedLimit,
      totalPages: Math.ceil(total / validatedLimit) || 1,
      hasNext: validatedPage * validatedLimit < total,
      hasPrev: validatedPage > 1
    };
  }

  async getStats() {
    const [categoryStats, yearStats, overview] = await Promise.all([
      this.pdfModel.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      this.pdfModel.aggregate([
        { $match: { isActive: true, year: { $exists: true } } },
        { $group: { _id: '$year', count: { $sum: 1 } } },
        { $sort: { _id: -1 } }
      ]),
      this.pdfModel.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalPdfs: { $sum: 1 },
            totalSize: { $sum: '$fileSize' },
            avgSize: { $avg: '$fileSize' }
          }
        }
      ])
    ]);

    return {
      overview: overview[0] || {},
      byCategory: categoryStats,
      byYear: yearStats
    };
  }

  async getCategories() {
    const categories = await this.pdfModel.distinct('category', { isActive: true });
    return categories.filter(Boolean).sort(); // Remove null/undefined and sort
  }

  async findOne(id: string, includeFullText = false) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid PDF id');
    }
    
    const select = includeFullText ? {} : { fullText: 0 };
    const pdf = await this.pdfModel.findById(id, select).lean();
    if (!pdf) throw new NotFoundException('PDF not found');
    
    // Increment view count
    this.pdfModel.findByIdAndUpdate(id, {
      $inc: { viewCount: 1 },
      $set: { lastViewed: new Date() }
    }).exec().catch(() => {});
    
    return pdf;
  }

  async update(id: string, updateDto: UpdatePdfDto) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid PDF id');
    }
    const updated = await this.pdfModel.findByIdAndUpdate(id, updateDto, { new: true });
    if (!updated) throw new NotFoundException('PDF not found');
    return updated;
  }

  async remove(id: string) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid PDF id');
    }
    const res = await this.pdfModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('PDF not found');
    
    // Delete the physical file from server
    try {
      if (res.fileUrl) {
        // Convert URL path to absolute file path
        // Assuming fileUrl is like '/uploads/pdfs/filename.pdf'
        const filePath = path.join(process.cwd(), res.fileUrl.replace(/^\//, ''));
        await fs.unlink(filePath);
        console.log(`Deleted file: ${filePath}`);
      }
    } catch (error) {
      console.error(`Failed to delete file for PDF ${id}:`, error.message);
      // Don't throw error - DB record is already deleted
    }
    
    return { message: 'PDF deleted successfully', id };
  }
}
