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

  async findAll(params: { page?: number; limit?: number; isActive?: boolean; filters?: Record<string, any> }) {
    const { page = 1, limit = 10, isActive, filters = {} } = params;
    const filter: Record<string, any> = { ...filters };
    if (typeof isActive === 'boolean') filter.isActive = isActive;

    const [items, total] = await Promise.all([
      this.pdfModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.pdfModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getCategories() {
    const categories = await this.pdfModel.distinct('category', { isActive: true });
    return categories.filter(Boolean).sort(); // Remove null/undefined and sort
  }

  async findOne(id: string) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid PDF id');
    }
    const pdf = await this.pdfModel.findById(id).lean();
    if (!pdf) throw new NotFoundException('PDF not found');
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
