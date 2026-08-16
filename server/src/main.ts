import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

/**
 * Application bootstrap — the entry point.
 *
 * This is equivalent to your Express server.js:
 *   const app = express();
 *   app.use(express.json());
 *   app.use(cors());
 *   app.listen(PORT);
 *
 * Key setup:
 *
 * 1. Global prefix 'api' — all routes start with /api
 *    Express equivalent: app.use('/api', router)
 *
 * 2. ValidationPipe — automatically validates @Body() against DTOs
 *    Express equivalent: express-validator or Joi middleware
 *    - whitelist: true → strips properties not in the DTO (security)
 *    - forbidNonWhitelisted: true → rejects requests with unknown fields
 *    - transform: true → auto-transforms types (string "123" → number 123)
 *
 * 3. CORS — configured with FRONTEND_URL from .env
 *    Essential for separate frontend/backend deployments
 *
 * 4. AllExceptionsFilter — consistent JSON error responses
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Global route prefix: /api/auth/..., /api/tasks/..., etc.
  app.setGlobalPrefix('api');

  // Auto-validate all incoming request bodies against DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Consistent error response format
  app.useGlobalFilters(new AllExceptionsFilter());

  // CORS for frontend-backend separation
  const frontendUrl = configService.get<string>('frontend.url');
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  const port = configService.get<number>('port');
  await app.listen(port!);

  logger.log(`🚀 Server running on http://localhost:${port}`);
  logger.log(`📡 API available at http://localhost:${port}/api`);
  logger.log(`🔗 CORS enabled for ${frontendUrl}`);
}

bootstrap();
