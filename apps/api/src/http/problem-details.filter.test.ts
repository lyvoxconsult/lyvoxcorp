import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ProblemDetailsFilter } from './problem-details.filter.js';

function createHost(requestId: string | undefined = 'trace-1') {
  const send = vi.fn();
  const status = vi.fn(() => ({ send }));
  const type = vi.fn(() => ({ status }));
  const header = vi.fn();
  const host = {
    switchToHttp: () => ({
      getRequest: () => ({ id: requestId, url: '/api/v1/auth/login' }),
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
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ status: 400, title: 'Bad Request', traceId: 'trace-1' }));
    expect(send.mock.calls[0]?.[0]).not.toContain('unsafe input echo');
  });

  it('does not leak unexpected exception details', () => {
    const { host, send } = createHost();
    new ProblemDetailsFilter().catch(new Error('database password leaked'), host as never);
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ status: 500, detail: 'An unexpected error occurred' }));
    expect(JSON.stringify(send.mock.calls[0]?.[0])).not.toContain('database password leaked');
  });

  it('uses the generic title for unmapped HTTP statuses and omits an absent trace id', () => {
    const { host, send } = createHost('');
    new ProblemDetailsFilter().catch(new HttpException('hidden', HttpStatus.I_AM_A_TEAPOT), host as never);
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ status: 418, title: 'Request Failed' }));
    expect(send.mock.calls[0]?.[0]).not.toHaveProperty('traceId');
  });

  it('emits Retry-After only for a positive integer rate-limit hint', () => {
    const { header, host } = createHost();
    const exception = new HttpException('limited', HttpStatus.TOO_MANY_REQUESTS);
    Object.assign(exception, { retryAfter: 45 });
    new ProblemDetailsFilter().catch(exception, host as never);
    expect(header).toHaveBeenCalledWith('Retry-After', '45');
  });
});
