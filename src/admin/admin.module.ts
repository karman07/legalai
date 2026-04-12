import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User, UserSchema } from '../schemas/user.schema';
import { Quiz, QuizSchema } from '../schemas/quiz.schema';
import { Pdf, PdfSchema } from '../schemas/pdf.schema';
import { AudioLesson, AudioLessonSchema } from '../schemas/audio-lesson.schema';
import { Note, NoteSchema } from '../schemas/note.schema';
import { Resource, ResourceSchema } from '../schemas/resource.schema';
import { Blog, BlogSchema } from '../schemas/blog.schema';
import { Chat, ChatSchema } from '../schemas/chat.schema';
import { Conversation, ConversationSchema } from '../schemas/conversation.schema';
import { AnswerCheck, AnswerCheckSchema } from '../schemas/answer-check.schema';
import { FirebaseModule } from '../firebase/firebase.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Quiz.name, schema: QuizSchema },
      { name: Pdf.name, schema: PdfSchema },
      { name: AudioLesson.name, schema: AudioLessonSchema },
      { name: Note.name, schema: NoteSchema },
      { name: Resource.name, schema: ResourceSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Chat.name, schema: ChatSchema },
      { name: Conversation.name, schema: ConversationSchema },
      { name: AnswerCheck.name, schema: AnswerCheckSchema },
    ]),
    FirebaseModule,
    EmailModule,
    ConfigModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
