import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DomainExceptionFilter } from './presentation/filters/domain-exception.filter';
import { HateoasInterceptor } from './presentation/interceptors/hateoas.interceptor';
import { SanitizationPipe } from './presentation/pipes/sanitization.pipe';

const SWAGGER_PATH = 'swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new SanitizationPipe(), // Sanitize first to clean inputs
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new DomainExceptionFilter());

  app.useGlobalInterceptors(new HateoasInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Twitter API')
    .setDescription(
      `
      Twitter-like simplified microblogging API to create a simple platform for users to publish, follow and view their timeline of tweets.

      
      ## Authentication
      For endpoints requiring authentication, click the "Authorize" button at the top and enter your user ID.
      
      When using the Swagger UI:
      - Click the Authorize button at the top
      - Enter ONLY your user ID in the input field (e.g., 123e4567-e89b-12d3-a456-426614174000)
      - The system will automatically format it as a Bearer token
      
      When using other clients (like Postman):
      - Add an Authorization header with your user ID
      - Example: Authorization: 123e4567-e89b-12d3-a456-426614174000
      - Or use Bearer format: Authorization: Bearer 123e4567-e89b-12d3-a456-426614174000
    `,
    )
    .setVersion('1.0')
    .addTag('users')
    .addTag('tweets')
    .addTag('follows')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(
    `Swagger documentation is available at: ${await app.getUrl()}/${SWAGGER_PATH}`,
  );
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
