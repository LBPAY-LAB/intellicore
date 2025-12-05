import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { getSecurityConfig } from './security/security.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const securityConfig = getSecurityConfig();
  const isDev = process.env.NODE_ENV !== 'production';

  // Helmet security headers
  app.use(
    helmet({
      contentSecurityPolicy: isDev
        ? false // Disable CSP in dev for GraphQL Playground
        : {
            directives: securityConfig.helmet.contentSecurityPolicy.directives,
          },
      crossOriginEmbedderPolicy: false, // Allow GraphQL Playground
      hsts: securityConfig.helmet.hsts,
    }),
  );

  // Response compression
  app.use(compression());

  // CORS configuration
  app.enableCors({
    origin: securityConfig.cors.origins,
    methods: securityConfig.cors.methods,
    credentials: securityConfig.cors.credentials,
    maxAge: securityConfig.cors.maxAge,
  });

  // Global validation pipe with security options
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error on unknown properties
      transform: true, // Auto-transform payloads
      transformOptions: {
        enableImplicitConversion: false, // Explicit type conversion only
      },
      disableErrorMessages: !isDev, // Hide validation details in production
    }),
  );

  // Trust proxy for rate limiting behind reverse proxy
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('SuperCore API')
    .setDescription('LBPay SuperCore - Enterprise Platform API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('health', 'Health check endpoints')
    .addTag('auth', 'Authentication and authorization')
    .addTag('storage', 'File storage operations')
    .addTag('object-types', 'Object type management')
    .addTag('instances', 'Object instance CRUD')
    .addTag('documents', 'Document management')
    .addTag('search', 'Search and discovery')
    .addTag('analytics', 'Analytics and reporting')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);

  logger.log(`🚀 Server ready at http://localhost:${port}/graphql`);
  logger.log(`📚 API docs at http://localhost:${port}/api`);
  logger.log(`📈 Metrics at http://localhost:${port}/metrics`);
  logger.log(`🏥 Health check at http://localhost:${port}/health`);
  logger.log(`🔒 Security: Helmet enabled, Rate limiting active`);
  logger.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
