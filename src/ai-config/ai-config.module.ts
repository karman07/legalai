import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AiConfig, AiConfigSchema } from '../schemas/ai-config.schema';
import { AiConfigService } from './ai-config.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AiConfig.name, schema: AiConfigSchema }]),
    ConfigModule,
  ],
  providers: [AiConfigService],
  exports: [AiConfigService],
})
export class AiConfigModule {}
