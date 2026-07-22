import { BadRequestException, Body, Controller, Delete, Get, Headers, HttpCode, Param, Post, Req, Res } from '@nestjs/common';
import { createExpiredSessionCookieOptions, createSessionCookieOptions } from '@lyvox/auth';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError, type ZodType } from 'zod';
import type { ApiEnvironment } from '../../config/env.js';
import { AuthService, type AuthenticatedSession } from './auth.service.js';
import {
  changePasswordSchema, enrollmentChallengeSchema, forgotPasswordSchema, loginSchema,
  mfaActivateSchema, mfaChallengeSchema, resetPasswordSchema, sessionIdSchema,
} from './auth.schemas.js';
import { Inject } from '@nestjs/common';
import { AUTH_ENVIRONMENT } from './auth.tokens.js';

function parsed<T>(schema: ZodType<T>, value: unknown): T {
  try { return schema.parse(value); }
  catch (error) {
    if (error instanceof ZodError) throw new BadRequestException('Request validation failed');
    throw error;
  }
}

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(AUTH_ENVIRONMENT) private readonly environment: ApiEnvironment,
  ) {}

  private metadata(request: FastifyRequest) {
    return { ipAddress: request.ip, userAgent: String(request.headers['user-agent'] ?? 'unknown') };
  }

  private token(request: FastifyRequest): string | undefined { return request.cookies.lyvox_session; }
  private async session(request: FastifyRequest): Promise<AuthenticatedSession> { return this.auth.resolveSession(this.token(request)); }
  private setSession(reply: FastifyReply, session: { token: string; expiresAt: Date }): void {
    reply.setCookie('lyvox_session', session.token, {
      ...createSessionCookieOptions(this.environment.NODE_ENV, this.environment.SESSION_TTL_SECONDS),
      expires: session.expiresAt,
    });
  }
  private clearSession(reply: FastifyReply): void {
    reply.clearCookie('lyvox_session', createExpiredSessionCookieOptions(this.environment.NODE_ENV));
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: unknown, @Req() request: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    const input = parsed(loginSchema, body);
    const result = await this.auth.login(input.email, input.password, this.metadata(request), this.token(request));
    if (result.status === 'AUTHENTICATED') {
      this.setSession(reply, result.session);
      return { userId: result.session.userId, csrfToken: result.session.csrfToken, expiresAt: result.session.expiresAt };
    }
    reply.code(202);
    return result;
  }

  @Post('mfa/challenge')
  @HttpCode(200)
  async mfaChallenge(@Body() body: unknown, @Req() request: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    const input = parsed(mfaChallengeSchema, body);
    const session = await this.auth.completeMfa(input.challengeToken, input.code, input.backupCode, this.metadata(request));
    this.setSession(reply, session);
    return { userId: session.userId, csrfToken: session.csrfToken, expiresAt: session.expiresAt };
  }

  @Post('mfa/setup')
  setupMfa(@Body() body: unknown) {
    const input = parsed(enrollmentChallengeSchema, body);
    return this.auth.setupMfa(input.challengeToken);
  }

  @Post('mfa/enrollment')
  async beginMfaEnrollment(@Req() request: FastifyRequest, @Headers('x-csrf-token') csrf: string | undefined) {
    const session = await this.session(request); this.auth.verifyCsrf(session, csrf);
    return this.auth.beginMfaEnrollment(session);
  }

  @Post('mfa/activate')
  async activateMfa(@Body() body: unknown, @Req() request: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    const input = parsed(mfaActivateSchema, body);
    const result = await this.auth.activateMfa(input.challengeToken, input.code, this.metadata(request));
    this.setSession(reply, result.session);
    return { backupCodes: result.backupCodes, userId: result.session.userId, csrfToken: result.session.csrfToken, expiresAt: result.session.expiresAt };
  }

  @Get('me')
  async me(@Req() request: FastifyRequest) {
    const session = await this.session(request);
    return { id: session.userId, email: session.email, fullName: session.fullName, passwordChangeRequired: session.passwordChangeRequired, mfaVerified: session.mfaVerified };
  }

  @Post('csrf')
  @HttpCode(200)
  async csrf(@Req() request: FastifyRequest, @Headers('x-csrf-token') csrf: string | undefined, @Res({ passthrough: true }) reply: FastifyReply) {
    const session = await this.session(request); this.auth.verifyCsrf(session, csrf);
    reply.header('Cache-Control', 'no-store');
    return { csrfToken: await this.auth.rotateCsrf(session) };
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@Req() request: FastifyRequest, @Headers('x-csrf-token') csrf: string | undefined, @Res({ passthrough: true }) reply: FastifyReply) {
    const session = await this.session(request); this.auth.verifyCsrf(session, csrf);
    await this.auth.logoutByToken(this.token(request)!, 'LOGOUT'); this.clearSession(reply);
  }

  @Post('logout-all')
  @HttpCode(204)
  async logoutAll(@Req() request: FastifyRequest, @Headers('x-csrf-token') csrf: string | undefined, @Res({ passthrough: true }) reply: FastifyReply) {
    const session = await this.session(request); this.auth.verifyCsrf(session, csrf);
    await this.auth.logoutAll(session); this.clearSession(reply);
  }

  @Get('sessions')
  async sessions(@Req() request: FastifyRequest) { const session = await this.session(request); return { items: await this.auth.listSessions(session) }; }

  @Delete('sessions/:id')
  @HttpCode(204)
  async revoke(@Param('id') id: string, @Req() request: FastifyRequest, @Headers('x-csrf-token') csrf: string | undefined) {
    const session = await this.session(request); this.auth.verifyCsrf(session, csrf);
    await this.auth.revokeSession(session, parsed(sessionIdSchema, id));
  }

  @Post('password/forgot')
  @HttpCode(202)
  async forgot(@Body() body: unknown, @Req() request: FastifyRequest) { const input = parsed(forgotPasswordSchema, body); await this.auth.forgotPassword(input.email, this.metadata(request)); return { accepted: true }; }

  @Post('password/reset')
  @HttpCode(204)
  async reset(@Body() body: unknown, @Req() request: FastifyRequest) { const input = parsed(resetPasswordSchema, body); await this.auth.resetPassword(input.token, input.newPassword, this.metadata(request)); }

  @Post('password/change')
  @HttpCode(204)
  async change(@Body() body: unknown, @Req() request: FastifyRequest, @Headers('x-csrf-token') csrf: string | undefined, @Res({ passthrough: true }) reply: FastifyReply) {
    const session = await this.session(request); this.auth.verifyCsrf(session, csrf);
    const input = parsed(changePasswordSchema, body); await this.auth.changePassword(session, input.currentPassword, input.newPassword); this.clearSession(reply);
  }
}
