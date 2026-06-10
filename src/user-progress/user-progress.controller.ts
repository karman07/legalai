import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UserProgressService, ProgressEventType } from './user-progress.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class UserProgressController {
  constructor(private readonly progressService: UserProgressService) {}

  @Post('track')
  async track(
    @Req() req: Request,
    @Body() body: { type: ProgressEventType; count?: number },
  ) {
    const userId = (req as any).user.userId;
    await this.progressService.track(userId, body.type, body.count ?? 1);
    return { ok: true };
  }

  @Get('stats')
  async getStats(
    @Req() req: Request,
    @Query('days') days = '30',
  ) {
    const userId = (req as any).user.userId;
    const [daily, streak] = await Promise.all([
      this.progressService.getDailyStats(userId, parseInt(days)),
      this.progressService.getStreak(userId),
    ]);
    return { daily, streak };
  }
}
