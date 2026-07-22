import cookie from '@fastify/cookie';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module.js';
import { parseApiEnvironment } from './config/env.js';
import { ProblemDetailsFilter } from './http/problem-details.filter.js';
import { buildLoggerOptions } from './observability/redaction.js';
import { StrictOriginGuard } from './security/strict-origin.guard.js';

export interface CreateAppOptions {
  env?: NodeJS.ProcessEnv;
  logger?: boolean;
}

export async function createApp(options: CreateAppOptions = {}): Promise<NestFastifyApplication> {
  const environment = parseApiEnvironment(options.env ?? process.env);
  const adapter = new FastifyAdapter({
    bodyLimit: 1_048_576,
    logger: options.logger === false ? false : buildLoggerOptions(environment.NODE_ENV),
    trustProxy: [...environment.TRUSTED_PROXY_CIDRS],
  });
  const app = await NestFactory.create<NestFastifyApplication>(AppModule.register(environment), adapter, {
    bufferLogs: false,
  });

  await app.register(cookie, {
    hook: 'onRequest',
    secret: environment.SESSION_SECRET,
  });
  app.enableCors({
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    origin: [...environment.TRUSTED_ORIGINS],
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new ProblemDetailsFilter());
  app.useGlobalGuards(new StrictOriginGuard(environment.TRUSTED_ORIGINS));

  return app;
}
