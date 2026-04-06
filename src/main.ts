import { NestFactory } from '@nestjs/core';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Get config service
  const configService = app.get(ConfigService);

  // Increase payload size limits for large file uploads (10GB to support 6-7GB PDFs)
  app.use(bodyParser.json({ limit: '10gb' }));
  app.use(bodyParser.urlencoded({ limit: '10gb', extended: true }));

  // Enable CORS for specific origins
  app.enableCors({
    origin: [
      "https://legalpadhai.ai",
      "https://admin.legalpadhai.ai",
      "http://localhost:3001",
      "http://localhost:5173",
      "http://localhost:5174"
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,Accept,Origin,X-Requested-With,X-Api-Key',
  });

  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api', {
    exclude: ['chat', 'chat/(.*)'],
  });

  const port = configService.get('PORT') || 3000;

  // Configure server for large file uploads
  const server = await app.listen(port);
  server.setTimeout(1800000); // 30 minutes timeout for large uploads

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`API endpoints available at: http://localhost:${port}/api`);
}
bootstrap();
