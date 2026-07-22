import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ProblemDetailsFilter } from './problem-details.filter.js';

function createHost(requestId = '0f4fe884-5878-4b1d-b06d-358d152e2ee5', url = '/api/v1/auth/login') {
  const send = vi.fn();
  const status = vi.fn(() => ({ send }));
  const type = vi.fn(() => ({ status }));
  const header = vi.fn();
  const host = {
    switchToHttp: () => ({
      getRequest: () => ({ id: requestId, url }),
      getResponse: () => ({ type, header }),
    }),
  };
  return { host, header, send, status, type };
}

describe('ProblemDetailsFilter', () => {
  it('serializes HTTP errors as RFC 7807', () => {
    const { host, send, status, type } = createHost();
    new ProblemDetailsFilter().catch(new BadRequestException('unsafe input echo'), host as never);
    expect(type).toHaveBeenCalledWith('application/problem+json');
    expect(status).toHaveBeenCalledWith(400);
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ status: 400, title: 'Bad Request', code: 'HTTP_400', correlationId: '0f4fe884-5878-4b1d-b06d-358d152e2ee5', timestamp: expect.any(String) }));
    expect(send.mock.calls[0]?.[0]).not.toContain('unsafe input echo');
  });

  it('does not leak unexpected exception details', () => {
    const { host, send } = createHost();
    new ProblemDetailsFilter().catch(new Error('database password leaked'), host as never);
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ status: 500, detail: 'An unexpected error occurred' }));
    expect(JSON.stringify(send.mock.calls[0]?.[0])).not.toContain('database password leaked');
  });

  it('exposes only allowlisted domain validation details without request values', () => {
    const { host, send } = createHost(undefined, '/api/v1/clientes?search=52998224725');
    new ProblemDetailsFilter().catch(new BadRequestException({
      code: 'REQUEST_VALIDATION_FAILED',
      detail: 'Request validation failed',
      validationErrors: [{ field: 'document', message: 'Invalid CNPJ' }],
      stack: 'sensitive stack', value: '52998224725',
    }), host as never);
    const body = send.mock.calls[0]?.[0];
    expect(body).toEqual(expect.objectContaining({ code: 'REQUEST_VALIDATION_FAILED', detail: 'Request validation failed', validationErrors: [{ field: 'document', message: 'Invalid CNPJ' }] }));
    expect(JSON.stringify(body)).not.toContain('52998224725');
    expect(JSON.stringify(body)).not.toContain('sensitive stack');
  });

  it('uses the generic title for unmapped HTTP statuses', () => {
    const { host, send } = createHost('');
    new ProblemDetailsFilter().catch(new HttpException('hidden', HttpStatus.I_AM_A_TEAPOT), host as never);
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ status: 418, title: 'Request Failed', correlationId: 'unavailable' }));
  });

  it('emits Retry-After only for a positive integer rate-limit hint', () => {
    const { header, host } = createHost();
    const exception = new HttpException('limited', HttpStatus.TOO_MANY_REQUESTS);
    Object.assign(exception, { retryAfter: 45 });
    new ProblemDetailsFilter().catch(exception, host as never);
    expect(header).toHaveBeenCalledWith('Retry-After', '45');
  });

  it('removes query parameters from the problem instance', () => {
    const { host, send } = createHost(undefined, '/api/v1/auth/login?token=synthetic-query-value');
    new ProblemDetailsFilter().catch(new BadRequestException(), host as never);
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ instance: '/api/v1/auth/login' }));
    expect(JSON.stringify(send.mock.calls[0]?.[0])).not.toContain('synthetic-query-value');
  });
});
