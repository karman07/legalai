import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Pdf, PdfSchema } from '../schemas/pdf.schema';
import { PdfsService } from './pdfs.service';
import { PdfsAdminController } from './pdfs.admin.controller';
import { PdfsController } from './pdfs.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Pdf.name, schema: PdfSchema }])],
  controllers: [PdfsAdminController, PdfsController],
  providers: [PdfsService],
  exports: [PdfsService],
})
export class PdfsModule {}
