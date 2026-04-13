import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Resource, ResourceSchema } from '../schemas/resource.schema';
import { ResourceCategory, ResourceCategorySchema } from '../schemas/resource-category.schema';
import { ResourcesService } from './resources.service';
import { ResourcesController } from './resources.controller';
import { ResourcesAdminController } from './resources.admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Resource.name, schema: ResourceSchema },
      { name: ResourceCategory.name, schema: ResourceCategorySchema },
    ]),
  ],
  providers: [ResourcesService],
  controllers: [ResourcesController, ResourcesAdminController],
  exports: [ResourcesService],
})
export class ResourcesModule {}
