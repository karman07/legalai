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
  ) { }

  async create(createDto: CreatePdfDto, uploadedBy?: string) {
    const cleanedDto = this.cleanPdfData(createDto);
    const doc = new this.pdfModel({
      ...cleanedDto,
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
  }): Promise<any> {
    const {
      page = 1,
      limit = 20,
      isActive,
      filters = {},
      sort = { createdAt: -1 }
    } = params;

    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100);

    const filter: Record<string, any> = this.buildFilter(filters);
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

    // Transform items to include full file URL
    const transformedItems = items.map(item => ({
      ...item,
      fileUrl: item.file ? `/uploads/documents/${item.file}` : null
    }));

    return {
      items: transformedItems,
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
  }): Promise<any> {
    const { query, page = 1, limit = 20, filters = {} } = params;

    if (!query || query.trim().length < 2) {
      return { items: [], total: 0, page, limit, totalPages: 0, hasNext: false, hasPrev: false };
    }

    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100);

    const searchRegex = new RegExp(query, 'i');
    const searchFilter = {
      ...this.buildFilter(filters),
      $or: [
        { title: searchRegex },
        { pet: searchRegex },
        { pet_adv: searchRegex },
        { res_adv: searchRegex },
        { case_no: searchRegex },
        { diary_no: searchRegex },
        { bench: searchRegex },
        { judgement_by: searchRegex },
        { category: searchRegex },
      ],
    };

    const [items, total] = await Promise.all([
      this.pdfModel
        .find(searchFilter)
        .select('-fullText')
        .sort({ createdAt: -1 })
        .skip((validatedPage - 1) * validatedLimit)
        .limit(validatedLimit)
        .lean(),
      this.pdfModel.countDocuments(searchFilter),
    ]);

    // Transform items to include full file URL
    const transformedItems = items.map(item => ({
      ...item,
      fileUrl: item.file ? `/uploads/documents/${item.file}` : null
    }));

    return {
      items: transformedItems,
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
        { $match: { isActive: true } },
        {
          $addFields: {
            derivedYear: this.getDerivedYearExpression(),
          },
        },
        { $match: { derivedYear: { $gte: 1800, $lte: 2200 } } },
        { $group: { _id: '$derivedYear', count: { $sum: 1 } } },
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
    const categories = await this.pdfModel.distinct('category');
    return categories.filter(Boolean).sort(); // Remove null/undefined and sort
  }

  async getAvailableYears() {
    const results = await this.pdfModel.aggregate([
      { $match: { isActive: true } },
      {
        $addFields: {
          derivedYear: this.getDerivedYearExpression(),
        },
      },
      { $match: { derivedYear: { $gte: 1800, $lte: 2200 } } },
      {
        $group: {
          _id: '$derivedYear',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    return {
      items: results.map((item) => ({ year: item._id, count: item.count })),
      total: results.length,
    };
  }

  async findOne(id: string, includeFullText = false): Promise<any> {
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
    }).exec().catch(() => { });

    // Transform to include full file URL
    return {
      ...pdf,
      fileUrl: pdf.file ? `/uploads/documents/${pdf.file}` : null
    };
  }

  async update(id: string, updateDto: UpdatePdfDto) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid PDF id');
    }

    // Get existing PDF to check for old file
    const existingPdf = await this.pdfModel.findById(id);
    if (!existingPdf) throw new NotFoundException('PDF not found');

    // If updating with new file, delete old file
    if (updateDto.file && existingPdf.file && updateDto.file !== existingPdf.file) {
      await this.deleteFile(existingPdf.file);
    }

    const cleanedDto = this.cleanPdfData(updateDto);
    const updated = await this.pdfModel.findByIdAndUpdate(id, cleanedDto, { new: true });
    return updated;
  }

  private cleanValue(value: any): string {
    if (value === null || value === undefined) return 'Information Not Available';
    const str = String(value).trim();
    const invalidValues = ['nan', 'null', 'undefined', '- 0', 'n/a', 'none', '-0', '0'];
    if (str === '' || invalidValues.includes(str.toLowerCase())) {
      return 'Information Not Available';
    }
    return str;
  }

  private cleanPdfData(data: any): any {
    const fieldsToClean = [
      'diary_no', 'case_no', 'pet', 'pet_adv', 'res_adv', 'bench', 'judgement_by', 'category'
    ];

    const cleanedData = { ...data };
    fieldsToClean.forEach(field => {
      // Only clean if the field exists or if we want to ensure it has a dummy value
      cleanedData[field] = this.cleanValue(cleanedData[field]);
    });

    if (!cleanedData.year && cleanedData.judgment_dates) {
      const parsedDate = new Date(cleanedData.judgment_dates);
      if (!Number.isNaN(parsedDate.getTime())) {
        cleanedData.year = parsedDate.getUTCFullYear();
      }
    }

    return cleanedData;
  }

  private buildFilter(filters: Record<string, any>): Record<string, any> {
    const normalized = { ...filters };
    const year = normalized.year;
    delete normalized.year;

    if (typeof year !== 'number' || Number.isNaN(year)) {
      return normalized;
    }

    const yearStart = new Date(Date.UTC(year, 0, 1));
    const yearEnd = new Date(Date.UTC(year + 1, 0, 1));

    return {
      ...normalized,
      $or: [
        { year },
        { judgment_dates: { $gte: yearStart, $lt: yearEnd } },
        { case_no: new RegExp(`\\b${year}\\b`) },
        { title: new RegExp(`\\b${year}\\b`) },
      ],
    };
  }

  private getDerivedYearExpression() {
    return {
      $ifNull: [
        '$year',
        {
          $ifNull: [
            { $year: '$judgment_dates' },
            {
              $toInt: {
                $ifNull: [
                  {
                    $let: {
                      vars: {
                        fromCaseNo: {
                          $regexFind: {
                            input: { $ifNull: ['$case_no', ''] },
                            regex: '(19|20)\\\\d{2}',
                          },
                        },
                        fromTitle: {
                          $regexFind: {
                            input: { $ifNull: ['$title', ''] },
                            regex: '(19|20)\\\\d{2}',
                          },
                        },
                      },
                      in: {
                        $ifNull: ['$$fromCaseNo.match', '$$fromTitle.match'],
                      },
                    },
                  },
                  0,
                ],
              },
            },
          ],
        },
      ],
    };
  }

  async runCleanup() {
    const pdfs = await this.pdfModel.find();
    let updatedCount = 0;

    for (const pdf of pdfs) {
      const pdfObj = pdf.toObject();
      const cleanedData = this.cleanPdfData(pdfObj);

      let hasChanged = false;
      const fieldsToCheck = [
        'diary_no', 'case_no', 'pet', 'pet_adv', 'res_adv', 'bench', 'judgement_by', 'category'
      ];

      for (const field of fieldsToCheck) {
        if (pdf[field] !== cleanedData[field]) {
          hasChanged = true;
          break;
        }
      }

      if (hasChanged) {
        await this.pdfModel.findByIdAndUpdate(pdf._id, { $set: cleanedData });
        updatedCount++;
      }
    }

    return {
      message: `Cleanup completed. Processed ${pdfs.length} documents.`,
      updatedCount
    };
  }

  private async deleteFile(filePath: string): Promise<void> {
    try {
      if (filePath) {
        const fullPath = path.join(process.cwd(), filePath.replace(/^\//, ''));
        await fs.unlink(fullPath);
        console.log(`Deleted file: ${fullPath}`);
      }
    } catch (error) {
      console.error(`Failed to delete file ${filePath}:`, error.message);
    }
  }

  async remove(id: string) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid PDF id');
    }
    const res = await this.pdfModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('PDF not found');

    // Delete the physical file from server
    await this.deleteFile(res.file);

    return { message: 'PDF deleted successfully', id };
  }
}
