import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule, type OpenAPIObject } from '@nestjs/swagger';
import { z, type ZodType } from 'zod';
import {
  clientDetailResponseSchema, clientListResponseSchema, clientMutationResponseSchema, responsibleListResponseSchema,
} from '@lyvox/validation';
import {
  changePasswordSchema, enrollmentChallengeSchema, forgotPasswordSchema, loginSchema,
  mfaActivateSchema, mfaChallengeSchema, resetPasswordSchema,
} from '../modules/auth/auth.schemas.js';
import { createRoleSchema } from '../modules/authorization/authorization.controller.js';
import { createClientSchema, updateClientSchema } from '../modules/clients/clients.schemas.js';

const requestSchemas: Readonly<Record<string, ZodType>> = {
  'post /api/v1/auth/login': loginSchema,
  'post /api/v1/auth/mfa/challenge': mfaChallengeSchema,
  'post /api/v1/auth/mfa/setup': enrollmentChallengeSchema,
  'post /api/v1/auth/mfa/activate': mfaActivateSchema,
  'post /api/v1/auth/password/forgot': forgotPasswordSchema,
  'post /api/v1/auth/password/reset': resetPasswordSchema,
  'post /api/v1/auth/password/change': changePasswordSchema,
  'post /api/v1/roles': createRoleSchema,
  'post /api/v1/clientes': createClientSchema,
  'put /api/v1/clientes/{id}': updateClientSchema,
};

const successResponses: Readonly<Record<string, { status: string; description: string; schema?: ZodType }>> = {
  'get /api/v1/clientes': { status: '200', description: 'Lista paginada de clientes', schema: clientListResponseSchema },
  'post /api/v1/clientes': { status: '201', description: 'Cliente criado', schema: clientMutationResponseSchema },
  'get /api/v1/clientes/responsaveis': { status: '200', description: 'Responsáveis elegíveis', schema: responsibleListResponseSchema },
  'get /api/v1/clientes/{id}': { status: '200', description: 'Cliente e timeline', schema: clientDetailResponseSchema },
  'put /api/v1/clientes/{id}': { status: '200', description: 'Cliente atualizado', schema: clientMutationResponseSchema },
  'delete /api/v1/clientes/{id}': { status: '204', description: 'Cliente arquivado' },
};

type QueryParameter = { name: string; in: 'query'; required: false; schema: Record<string, unknown> };
const queryParameters: Readonly<Record<string, readonly QueryParameter[]>> = {
  'get /api/v1/clientes': [
    { name: 'search', in: 'query', required: false, schema: { type: 'string', maxLength: 255 } },
    { name: 'status', in: 'query', required: false, schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'CHURNED'] } },
    { name: 'tag', in: 'query', required: false, schema: { type: 'string', minLength: 1, maxLength: 50 } },
    { name: 'cursor', in: 'query', required: false, schema: { type: 'string', maxLength: 500 } },
    { name: 'pageSize', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
  ],
  'get /api/v1/clientes/{id}': [
    { name: 'timelineCursor', in: 'query', required: false, schema: { type: 'string', maxLength: 500 } },
    { name: 'timelinePageSize', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
  ],
  'get /api/v1/clientes/responsaveis': [
    { name: 'search', in: 'query', required: false, schema: { type: 'string', maxLength: 120, default: '' } },
  ],
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
  'post /api/v1/auth/logout',
  'post /api/v1/auth/logout-all',
  'delete /api/v1/auth/sessions/{id}',
  'post /api/v1/auth/password/change',
  'post /api/v1/roles',
  'post /api/v1/clientes',
  'put /api/v1/clientes/{id}',
  'delete /api/v1/clientes/{id}',
]);

const idempotentOperations = new Set([
  'post /api/v1/clientes',
  'put /api/v1/clientes/{id}',
  'delete /api/v1/clientes/{id}',
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

function jsonSchema(schema: ZodType, io: 'input' | 'output'): Record<string, unknown> {
  const generated = z.toJSONSchema(schema, { target: 'draft-7', io, unrepresentable: 'any' }) as Record<string, unknown>;
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
      operation.parameters.push(...(queryParameters[operationKey] ?? []));
      if (idempotentOperations.has(operationKey)) {
        operation.parameters.push({ name: 'Idempotency-Key', in: 'header', required: true, schema: { type: 'string', format: 'uuid' } });
      }
      if (operationKey === 'delete /api/v1/clientes/{id}') {
        operation.parameters.push({ name: 'If-Match', in: 'header', required: true, schema: { type: 'string', pattern: '^"?[1-9][0-9]*"?$' } });
      }
      if (!publicOperations.has(operationKey)) {
        operation.security = [{ sessionCookie: [], ...(csrfOperations.has(operationKey) ? { csrfHeader: [] } : {}) }];
      }
      operation.responses.default = {
        description: 'RFC 7807 error',
        content: { 'application/problem+json': { schema: { $ref: '#/components/schemas/ProblemDetails' } } },
      };
      const success = successResponses[operationKey];
      if (success) {
        operation.responses[success.status] = {
          description: success.description,
          ...(success.schema ? { content: { 'application/json': { schema: jsonSchema(success.schema, 'output') } } } : {}),
        };
      }
      const schema = requestSchemas[operationKey];
      if (schema) {
        operation.requestBody = {
          required: true,
          content: { 'application/json': { schema: jsonSchema(schema, 'input') } },
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
