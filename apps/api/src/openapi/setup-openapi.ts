import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule, type OpenAPIObject } from '@nestjs/swagger';
import { z, type ZodType } from 'zod';
import {
  changePasswordSchema, enrollmentChallengeSchema, forgotPasswordSchema, loginSchema,
  mfaActivateSchema, mfaChallengeSchema, resetPasswordSchema,
} from '../modules/auth/auth.schemas.js';
import { createRoleSchema } from '../modules/authorization/authorization.controller.js';

const requestSchemas: Readonly<Record<string, ZodType>> = {
  'post /api/v1/auth/login': loginSchema,
  'post /api/v1/auth/mfa/challenge': mfaChallengeSchema,
  'post /api/v1/auth/mfa/setup': enrollmentChallengeSchema,
  'post /api/v1/auth/mfa/activate': mfaActivateSchema,
  'post /api/v1/auth/password/forgot': forgotPasswordSchema,
  'post /api/v1/auth/password/reset': resetPasswordSchema,
  'post /api/v1/auth/password/change': changePasswordSchema,
  'post /api/v1/roles': createRoleSchema,
};

const publicOperations = new Set([
  'post /api/v1/auth/login',
  'post /api/v1/auth/mfa/challenge',
  'post /api/v1/auth/mfa/setup',
  'post /api/v1/auth/mfa/activate',
  'post /api/v1/auth/password/forgot',
  'post /api/v1/auth/password/reset',
  'get /health',
  'get /readiness',
]);

const csrfOperations = new Set([
  'post /api/v1/auth/mfa/enrollment',
  'post /api/v1/auth/csrf',
  'post /api/v1/auth/logout',
  'post /api/v1/auth/logout-all',
  'delete /api/v1/auth/sessions/{id}',
  'post /api/v1/auth/password/change',
  'post /api/v1/roles',
]);

const problemSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['type', 'title', 'status', 'detail', 'instance', 'code', 'correlationId', 'timestamp'],
  properties: {
    type: { type: 'string', format: 'uri' },
    title: { type: 'string' },
    status: { type: 'integer' },
    detail: { type: 'string' },
    instance: { type: 'string' },
    code: { type: 'string' },
    correlationId: { type: 'string', format: 'uuid' },
    timestamp: { type: 'string', format: 'date-time' },
    validationErrors: { type: 'array', items: { type: 'object' } },
  },
};

function jsonSchema(schema: ZodType): Record<string, unknown> {
  const generated = z.toJSONSchema(schema, { target: 'draft-7' }) as Record<string, unknown>;
  delete generated.$schema;
  return generated;
}

function enrich(document: OpenAPIObject): OpenAPIObject {
  document.openapi = '3.1.0';
  document.servers = [{ url: '/' }];
  document.components ??= {};
  document.components.schemas ??= {};
  document.components.schemas.ProblemDetails = problemSchema;

  for (const [path, pathItem] of Object.entries(document.paths)) {
    for (const method of ['get', 'post', 'put', 'patch', 'delete'] as const) {
      const operation = pathItem?.[method];
      if (!operation) continue;
      operation.parameters ??= [];
      operation.parameters.push({
        name: 'X-Correlation-ID', in: 'header', required: false,
        schema: { type: 'string', format: 'uuid' },
      });
      const operationKey = `${method} ${path}`;
      if (!publicOperations.has(operationKey)) {
        operation.security = [{ sessionCookie: [], ...(csrfOperations.has(operationKey) ? { csrfHeader: [] } : {}) }];
      }
      operation.responses.default = {
        description: 'RFC 7807 error',
        content: { 'application/problem+json': { schema: { $ref: '#/components/schemas/ProblemDetails' } } },
      };
      const schema = requestSchemas[operationKey];
      if (schema) {
        operation.requestBody = {
          required: true,
          content: { 'application/json': { schema: jsonSchema(schema) } },
        };
      }
    }
  }
  return document;
}

export function setupOpenApi(app: NestFastifyApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Lyvox Gerenciamento API')
    .setDescription('API REST do Lyvox Gerenciamento')
    .setVersion('0.8.0')
    .addCookieAuth('lyvox_session', { type: 'apiKey', in: 'cookie' }, 'sessionCookie')
    .addApiKey({ type: 'apiKey', in: 'header', name: 'X-CSRF-Token' }, 'csrfHeader')
    .build();
  const document = enrich(SwaggerModule.createDocument(app, config));
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: false,
    jsonDocumentUrl: '/docs/openapi.json',
    yamlDocumentUrl: '/docs/openapi.yaml',
    customSiteTitle: 'Lyvox API Docs',
  });
  return document;
}
