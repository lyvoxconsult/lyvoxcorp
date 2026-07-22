import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function isTrustedOrigin(origin: string | undefined, trustedOrigins: readonly string[]): boolean {
  if (!origin) return false;

  try {
    const parsed = new URL(origin);
    return parsed.origin === origin && trustedOrigins.includes(parsed.origin);
  } catch {
    return false;
  }
}

@Injectable()
export class StrictOriginGuard implements CanActivate {
  constructor(private readonly trustedOrigins: readonly string[]) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    if (SAFE_METHODS.has(request.method)) return true;

    const origin = Array.isArray(request.headers.origin) ? request.headers.origin[0] : request.headers.origin;
    if (!isTrustedOrigin(origin, this.trustedOrigins)) {
      throw new ForbiddenException('Request origin is not allowed');
    }

    return true;
  }
}
