import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  async create(@Body() createDto: CreateNoteDto, @Req() req: Request) {
    const userId = (req as any).user.userId;
    console.log('Controller create - user object:', (req as any).user);
    console.log('Controller create - extracted userId:', userId);
    return this.notesService.create(createDto, userId);
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('referenceType') referenceType?: string,
    @Query('referenceId') referenceId?: string,
    @Query('isBookmarked') isBookmarked?: string,
    @Query('isFavourite') isFavourite?: string,
    @Query('tags') tags?: string,
  ) {
    const userId = (req as any).user.userId;
    console.log('Controller findAll - user object:', (req as any).user);
    console.log('Controller findAll - extracted userId:', userId);
    
    const tagsArray = tags ? tags.split(',') : undefined;
    const bookmarked = isBookmarked === 'true' ? true : isBookmarked === 'false' ? false : undefined;
    const favourite = isFavourite === 'true' ? true : isFavourite === 'false' ? false : undefined;

    return this.notesService.findAll(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      referenceType,
      referenceId,
      isBookmarked: bookmarked,
      isFavourite: favourite,
      tags: tagsArray,
    });
  }

  @Get('bookmarked')
  async getBookmarked(@Req() req: Request) {
    const userId = (req as any).user.userId;
    return this.notesService.getBookmarked(userId);
  }

  @Get('favourites')
  async getFavourites(@Req() req: Request) {
    const userId = (req as any).user.userId;
    return this.notesService.getFavourites(userId);
  }

  @Get('tags')
  async getTags(@Req() req: Request) {
    const userId = (req as any).user.userId;
    return this.notesService.getTags(userId);
  }

  @Get('reference/:type/:id')
  async getByReference(
    @Param('type') type: string,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const userId = (req as any).user.userId;
    return this.notesService.getByReference(type, id, userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user.userId;
    return this.notesService.findOne(id, userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateNoteDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user.userId;
    return this.notesService.update(id, updateDto, userId);
  }

  @Put(':id/bookmark')
  async toggleBookmark(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user.userId;
    return this.notesService.toggleBookmark(id, userId);
  }

  @Put(':id/favourite')
  async toggleFavourite(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user.userId;
    return this.notesService.toggleFavourite(id, userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user.userId;
    return this.notesService.remove(id, userId);
  }
}