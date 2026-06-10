import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserProgress, UserProgressDocument } from '../schemas/user-progress.schema';

export type ProgressEventType = 'law_read' | 'audio_listened' | 'quiz_taken' | 'case_viewed' | 'minutes_studied';

@Injectable()
export class UserProgressService {
  constructor(
    @InjectModel(UserProgress.name) private progressModel: Model<UserProgressDocument>,
  ) {}

  private getTodayString(): string {
    return new Date().toISOString().slice(0, 10);
  }

  async track(userId: string, type: ProgressEventType, count = 1): Promise<void> {
    const date = this.getTodayString();
    const fieldMap: Record<ProgressEventType, string> = {
      law_read: 'lawsRead',
      audio_listened: 'audioListened',
      quiz_taken: 'quizzesTaken',
      case_viewed: 'casesViewed',
      minutes_studied: 'minutesStudied',
    };
    const field = fieldMap[type];
    await this.progressModel.updateOne(
      { userId, date },
      { $inc: { [field]: count }, $setOnInsert: { userId, date } },
      { upsert: true },
    );
  }

  async getDailyStats(userId: string, days = 30): Promise<UserProgress[]> {
    const dates: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }

    const records = await this.progressModel
      .find({ userId, date: { $in: dates } })
      .lean();

    const map = new Map<string, UserProgress>();
    for (const r of records) {
      map.set(r.date, r as unknown as UserProgress);
    }

    return dates.map(date => map.get(date) ?? {
      userId,
      date,
      lawsRead: 0,
      audioListened: 0,
      quizzesTaken: 0,
      casesViewed: 0,
      minutesStudied: 0,
    } as UserProgress);
  }

  async getStreak(userId: string): Promise<number> {
    const records = await this.progressModel
      .find({ userId })
      .sort({ date: -1 })
      .select('date lawsRead audioListened quizzesTaken casesViewed')
      .lean();

    const activeDates = new Set(
      records
        .filter(r => (r.lawsRead + r.audioListened + r.quizzesTaken + r.casesViewed) > 0)
        .map(r => r.date)
    );

    const today = new Date().toISOString().slice(0, 10);
    let streak = 0;
    let cursor = today;

    while (activeDates.has(cursor)) {
      streak++;
      const d = new Date(`${cursor}T00:00:00.000Z`);
      d.setUTCDate(d.getUTCDate() - 1);
      cursor = d.toISOString().slice(0, 10);
    }

    return streak;
  }
}
