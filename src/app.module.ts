import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { FirebaseModule } from './firebase/firebase.module';
import { EmailModule } from './email/email.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { AiModule } from './ai/ai.module';
import { PdfsModule } from './pdfs/pdfs.module';
import { AudioLessonsModule } from './audio-lessons/audio-lessons.module';

@Module({
  imports: [
    // Configuration Module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // MongoDB Connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        dbName: configService.get<string>('DATABASE_NAME'),
      }),
      inject: [ConfigService],
    }),
    
    // Feature Modules
    AuthModule,
    AdminModule,
    FirebaseModule,
    EmailModule,
    QuizzesModule,
    AiModule,
    PdfsModule,
    AudioLessonsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
