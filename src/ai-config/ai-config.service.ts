import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { AiConfig, AiConfigDocument } from '../schemas/ai-config.schema';

@Injectable()
export class AiConfigService {
  private cache: { geminiApiKey: string; geminiModel: string; expiresAt: number } | null = null;
  private readonly CACHE_TTL_MS = 30_000;

  constructor(
    @InjectModel(AiConfig.name) private readonly aiConfigModel: Model<AiConfigDocument>,
    private readonly config: ConfigService,
  ) {}

  async getGeminiApiKey(): Promise<string> {
    await this.refreshCacheIfNeeded();
    return this.cache?.geminiApiKey || this.config.get<string>('GEMINI_API_KEY') || '';
  }

  async getGeminiModel(): Promise<string> {
    await this.refreshCacheIfNeeded();
    return this.cache?.geminiModel || this.config.get<string>('GEMINI_MODEL') || 'gemini-2.0-flash';
  }

  invalidateCache(): void {
    this.cache = null;
  }

  private async refreshCacheIfNeeded(): Promise<void> {
    if (this.cache && Date.now() < this.cache.expiresAt) return;
    try {
      const doc = await this.aiConfigModel.findOne({ configKey: 'default' }).lean();
      this.cache = {
        geminiApiKey: (doc as any)?.geminiApiKey || '',
        geminiModel: (doc as any)?.geminiModel || '',
        expiresAt: Date.now() + this.CACHE_TTL_MS,
      };
    } catch {
      // DB unavailable — keep serving from env vars
      this.cache = { geminiApiKey: '', geminiModel: '', expiresAt: Date.now() + 5_000 };
    }
  }
}
