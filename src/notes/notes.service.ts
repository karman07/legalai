import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Note, NoteDocument } from '../schemas/note.schema';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectModel(Note.name) private readonly noteModel: Model<NoteDocument>,
  ) {}

  async create(createDto: CreateNoteDto, userId: string) {
    console.log('Creating note with userId:', userId);
    console.log('Note data:', createDto);
    
    const noteData = {
      ...createDto,
      userId: new Types.ObjectId(userId),
    };

    console.log('Final note data:', noteData);
    
    const note = new this.noteModel(noteData);
    const savedNote = await note.save();
    
    console.log('Saved note:', savedNote);
    return savedNote;
  }

  async findAll(userId: string, params: {
    page?: number;
    limit?: number;
    referenceType?: string;
    referenceId?: string;
    isBookmarked?: boolean;
    isFavourite?: boolean;
    tags?: string[];
  }) {
    const { page = 1, limit = 10, referenceType, referenceId, isBookmarked, isFavourite, tags } = params;

    const filters: any = { userId: new Types.ObjectId(userId), isActive: true };

    if (referenceType) filters['reference.type'] = referenceType;
    if (referenceId) filters['reference.id'] = referenceId;
    if (typeof isBookmarked === 'boolean') filters.isBookmarked = isBookmarked;
    if (typeof isFavourite === 'boolean') filters.isFavourite = isFavourite;
    if (tags && tags.length > 0) filters.tags = { $in: tags };

    const [items, total] = await Promise.all([
      this.noteModel
        .find(filters)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.noteModel.countDocuments(filters),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string, userId: string) {
    console.log('Finding note with id:', id, 'userId:', userId);
    
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid note id');
    }

    const query = {
      _id: id,
      userId: new Types.ObjectId(userId),
      isActive: true,
    };
    
    console.log('Query:', query);
    
    const note = await this.noteModel.findOne(query).lean();
    
    console.log('Found note:', note);

    if (!note) {
      // Let's also check without isActive to see if the note exists but is inactive
      const inactiveNote = await this.noteModel.findOne({
        _id: id,
        userId: new Types.ObjectId(userId),
      }).lean();
      
      console.log('Inactive note check:', inactiveNote);
      throw new NotFoundException('Note not found');
    }

    return note;
  }

  async update(id: string, updateDto: UpdateNoteDto, userId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid note id');
    }

    const updated = await this.noteModel.findOneAndUpdate(
      { _id: id, userId: new Types.ObjectId(userId), isActive: true },
      updateDto,
      { new: true }
    );

    if (!updated) {
      throw new NotFoundException('Note not found');
    }

    return updated;
  }

  async remove(id: string, userId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid note id');
    }

    const result = await this.noteModel.findOneAndUpdate(
      { _id: id, userId: new Types.ObjectId(userId), isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!result) {
      throw new NotFoundException('Note not found');
    }

    return { message: 'Note deleted successfully', id };
  }

  async getByReference(referenceType: string, referenceId: string, userId: string) {
    const notes = await this.noteModel.find({
      userId: new Types.ObjectId(userId),
      'reference.type': referenceType,
      'reference.id': referenceId,
      isActive: true,
    }).sort({ createdAt: -1 }).lean();

    return notes;
  }

  async getBookmarked(userId: string) {
    const notes = await this.noteModel.find({
      userId: new Types.ObjectId(userId),
      isBookmarked: true,
      isActive: true,
    }).sort({ createdAt: -1 }).lean();

    return notes;
  }

  async getFavourites(userId: string) {
    const notes = await this.noteModel.find({
      userId: new Types.ObjectId(userId),
      isFavourite: true,
      isActive: true,
    }).sort({ createdAt: -1 }).lean();

    return notes;
  }

  async toggleBookmark(id: string, userId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid note id');
    }

    const note = await this.noteModel.findOne({
      _id: id,
      userId: new Types.ObjectId(userId),
      isActive: true,
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    note.isBookmarked = !note.isBookmarked;
    await note.save();

    return { message: `Note ${note.isBookmarked ? 'bookmarked' : 'unbookmarked'}`, isBookmarked: note.isBookmarked };
  }

  async toggleFavourite(id: string, userId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid note id');
    }

    const note = await this.noteModel.findOne({
      _id: id,
      userId: new Types.ObjectId(userId),
      isActive: true,
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    note.isFavourite = !note.isFavourite;
    await note.save();

    return { message: `Note ${note.isFavourite ? 'added to favourites' : 'removed from favourites'}`, isFavourite: note.isFavourite };
  }

  async getTags(userId: string) {
    const tags = await this.noteModel.distinct('tags', {
      userId: new Types.ObjectId(userId),
      isActive: true,
    });

    return tags.filter(tag => tag); // Remove null/undefined tags
  }
}