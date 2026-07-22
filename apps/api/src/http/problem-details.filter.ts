import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code: string;
  correlationId: string;
  timestamp: string;
  validationErrors?: readonly { field: string; message: string }[];
}

const TITLES: Partial<Record<number, string>> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  503: 'Service Unavailable',
};

function statusCode(status: number): string {
  return `HTTP_${status}`;
}

function explicitCode(exception: unknown, status: number): string {
  if (!(exception instanceof HttpException)) return statusCode(status);
  const response = exception.getResponse();
  if (typeof response !== 'object' || response === null) return statusCode(status);
  const code = (response as { code?: unknown }).code;
  return typeof code === 'string' && /^[A-Z][A-Z0-9_]{2,63}$/u.test(code) ? code : statusCode(status);
}

function explicitSafePayload(exception: unknown): { detail?: string; validationErrors?: Array<{ field: string; message: string }> } {
  if (!(exception instanceof HttpException)) return {};
  const response = exception.getResponse();
  if (typeof response !== 'object' || response === null) return {};
  const payload = response as { code?: unknown; detail?: unknown; validationErrors?: unknown };
  if (typeof payload.code !== 'string' || !/^[A-Z][A-Z0-9_]{2,63}$/u.test(payload.code)) return {};
  const detail = typeof payload.detail === 'string' && payload.detail.length <= 300 && !/[\r\n\t]/u.test(payload.detail)
    ? payload.detail : undefined;
  const validationErrors = Array.isArray(payload.validationErrors)
    ? payload.validationErrors.slice(0, 20).flatMap((item) => {
      if (typeof item !== 'object' || item === null) return [];
      const value = item as { field?: unknown; message?: unknown };
      if (typeof value.field !== 'string' || typeof value.message !== 'string') return [];
      if (!/^[a-zA-Z0-9_.-]{1,120}$/u.test(value.field) || value.message.length > 160 || /[\r\n\t]/u.test(value.message)) return [];
      return [{ field: value.field, message: value.message }];
    }) : undefined;
  return { ...(detail ? { detail } : {}), ...(validationErrors?.length ? { validationErrors } : {}) };
}

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<FastifyRequest>();
    const reply = http.getResponse<FastifyReply>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const title = TITLES[status] ?? 'Request Failed';
    const code = explicitCode(exception, status);
    const correlationId = request.id || 'unavailable';
    const safePayload = status < 500 ? explicitSafePayload(exception) : {};
    const problem: ProblemDetails = {
      type: `https://api.lyvox.com/errors/${code}`,
      title,
      status,
      detail: status >= 500 ? 'An unexpected error occurred' : safePayload.detail ?? title,
      instance: request.url.split('?', 1)[0] || '/',
      code,
      correlationId,
      timestamp: new Date().toISOString(),
      ...(safePayload.validationErrors ? { validationErrors: safePayload.validationErrors } : {}),
    };

    const retryAfter = (exception as { retryAfter?: unknown })?.retryAfter;
    if (status === HttpStatus.TOO_MANY_REQUESTS && Number.isInteger(retryAfter) && Number(retryAfter) > 0) {
      reply.header('Retry-After', String(retryAfter));
    }

    void reply.type('application/problem+json').status(status).send(problem);
  }
}
