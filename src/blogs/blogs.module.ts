import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from '../schemas/blog.schema';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { BlogsAdminController } from './blogs.admin.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }])],
  providers: [BlogsService],
  controllers: [BlogsController, BlogsAdminController],
  exports: [BlogsService],
})
export class BlogsModule {}
