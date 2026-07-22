import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  traceId?: string;
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
};

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<FastifyRequest>();
    const reply = http.getResponse<FastifyReply>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const title = TITLES[status] ?? 'Request Failed';
    const problem: ProblemDetails = {
      type: `https://httpstatuses.com/${status}`,
      title,
      status,
      detail: status >= 500 ? 'An unexpected error occurred' : title,
      instance: request.url,
      ...(request.id ? { traceId: request.id } : {}),
    };

    const retryAfter = (exception as { retryAfter?: unknown })?.retryAfter;
    if (status === HttpStatus.TOO_MANY_REQUESTS && Number.isInteger(retryAfter) && Number(retryAfter) > 0) {
      reply.header('Retry-After', String(retryAfter));
    }

    void reply.type('application/problem+json').status(status).send(problem);
  }
}
