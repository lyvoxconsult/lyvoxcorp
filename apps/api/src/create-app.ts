import cookie from '@fastify/cookie';
import { randomUUID } from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import { RequestMethod } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module.js';
import { parseApiEnvironment } from './config/env.js';
import { ProblemDetailsFilter } from './http/problem-details.filter.js';
import { buildLoggerOptions } from './observability/redaction.js';
import { StrictOriginGuard } from './security/strict-origin.guard.js';
import { setupOpenApi } from './openapi/setup-openapi.js';

export interface CreateAppOptions {
  env?: NodeJS.ProcessEnv;
  logger?: boolean;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

export async function createApp(options: CreateAppOptions = {}): Promise<NestFastifyApplication> {
  const environment = parseApiEnvironment(options.env ?? process.env);
  const adapter = new FastifyAdapter({
    bodyLimit: 1_048_576,
    logger: options.logger === false ? false : buildLoggerOptions(environment.NODE_ENV),
    trustProxy: [...environment.TRUSTED_PROXY_CIDRS],
    genReqId: (request: IncomingMessage) => {
      const supplied = request.headers['x-correlation-id'];
      return typeof supplied === 'string' && supplied.length <= 36 && UUID_PATTERN.test(supplied) ? supplied.toLowerCase() : randomUUID();
    },
  });
  const app = await NestFactory.create<NestFastifyApplication>(AppModule.register(environment), adapter, {
    bufferLogs: false,
  });
  app.enableShutdownHooks();

  await app.register(cookie, {
    hook: 'onRequest',
    secret: environment.SESSION_SECRET,
  });
  app.getHttpAdapter().getInstance().addHook('onRequest', (request, reply, done) => {
    void reply.header('X-Correlation-ID', request.id);
    done();
  });
  app.enableCors({
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    origin: [...environment.TRUSTED_ORIGINS],
  });
  app.setGlobalPrefix('api/v1', {
    exclude: [
      { path: 'health', method: RequestMethod.GET },
      { path: 'readiness', method: RequestMethod.GET },
    ],
  });
  app.useGlobalFilters(new ProblemDetailsFilter());
  app.useGlobalGuards(new StrictOriginGuard(environment.TRUSTED_ORIGINS));
  setupOpenApi(app);

  return app;
}
