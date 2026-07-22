import {
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  decryptSecret,
  encryptSecret,
  evaluatePasswordPolicy,
  generateBackupCodes,
  generateCsrfToken,
  generateOpaqueToken,
  generateTotpSecret,
  hashCsrfToken,
  hashOpaqueToken,
  hashPassword,
  verifyArgon2idSecret,
  verifyCsrfToken,
  verifyPassword,
  verifyTotpWithReplayProtection,
} from '@lyvox/auth';
import {
  auditLogs,
  mfaBackupCodes,
  mfaChallenges,
  mfaFactors,
  outboxEvents,
  passwordCredentials,
  passwordResetTokens,
  roles,
  sessions,
  userRoles,
  users,
} from '@lyvox/database/schema';
import { and, desc, eq, gt, isNull, lt, sql } from 'drizzle-orm';
import { createHash } from 'node:crypto';
import type { ApiEnvironment } from '../../config/env.js';
import { AuthCacheService, DatabaseService } from './auth.infrastructure.js';
import { AUTH_ENVIRONMENT } from './auth.tokens.js';

const CHALLENGE_TTL_MS = 5 * 60 * 1_000;
const RESET_TTL_MS = 15 * 60 * 1_000;
const LOCKOUT_MS = 15 * 60 * 1_000;

interface ClientMetadata { ipAddress: string; userAgent: string }
interface SessionResult { token: string; csrfToken: string; expiresAt: Date; userId: string }
export interface AuthenticatedSession {
  sessionId: string;
  userId: string;
  email: string;
  fullName: string;
  passwordChangeRequired: boolean;
  mfaVerified: boolean;
  csrfTokenHash: string;
  tokenHash: string;
}

function normalizeEmail(value: string): string { return value.trim().toLowerCase(); }
function opaqueKey(value: string): string { return createHash('sha256').update(value).digest('hex'); }
function rateLimited(message: string): HttpException { return new HttpException(message, HttpStatus.TOO_MANY_REQUESTS); }

@Injectable()
export class AuthService {
  private dummyPasswordHash?: Promise<string>;
  constructor(
    @Inject(DatabaseService) private readonly database: DatabaseService,
    @Inject(AuthCacheService) private readonly cache: AuthCacheService,
    @Inject(AUTH_ENVIRONMENT) private readonly environment: ApiEnvironment,
  ) {}

  private async audit(action: string, module: string, actorUserId?: string, metadata: Record<string, unknown> = {}): Promise<void> {
    await this.database.db.insert(auditLogs).values({ action, module, actorUserId, metadata });
  }

  private async enforceSensitiveRateLimit(kind: string, keys: readonly string[], limit = 5, windowSeconds = 60): Promise<void> {
    try {
      await this.cache.enforceRateLimit(kind, keys.map(opaqueKey), limit, windowSeconds);
    } catch (error) {
      if ((error as Error).message === 'LOGIN_RATE_LIMITED') {
        const exception = rateLimited('Too many attempts');
        Object.assign(exception, { retryAfter: (error as { retryAfter?: number }).retryAfter ?? windowSeconds });
        throw exception;
      }
      throw new ServiceUnavailableException('Abuse protection is temporarily unavailable');
    }
  }

  private async rolesFor(userId: string): Promise<string[]> {
    const rows = await this.database.db.select({ name: roles.name })
      .from(userRoles).innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId));
    return rows.map((row) => row.name);
  }

  private async createChallenge(userId: string, purpose: 'LOGIN' | 'ENROLLMENT'): Promise<{ challengeToken: string; expiresAt: Date }> {
    const challengeToken = generateOpaqueToken();
    const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MS);
    await this.database.db.insert(mfaChallenges).values({
      userId,
      challengeHash: hashOpaqueToken(challengeToken),
      purpose,
      expiresAt,
      createdById: userId,
      updatedById: userId,
    });
    return { challengeToken, expiresAt };
  }

  private async createSession(userId: string, metadata: ClientMetadata, mfaVerified: boolean): Promise<SessionResult> {
    const token = generateOpaqueToken();
    const csrfToken = generateCsrfToken();
    const tokenHash = hashOpaqueToken(token);
    const expiresAt = new Date(Date.now() + this.environment.SESSION_TTL_SECONDS * 1_000);
    await this.database.db.insert(sessions).values({
      userId,
      tokenHash,
      csrfTokenHash: hashCsrfToken(csrfToken),
      ipAddress: metadata.ipAddress.slice(0, 45),
      userAgent: metadata.userAgent.slice(0, 2_048),
      expiresAt,
      mfaVerifiedAt: mfaVerified ? new Date() : null,
      createdById: userId,
      updatedById: userId,
    });
    await this.cache.cacheSession(tokenHash, userId, this.environment.SESSION_TTL_SECONDS);
    await this.audit('auth.login.succeeded', 'auth', userId);
    return { token, csrfToken, expiresAt, userId };
  }

  async login(emailInput: string, password: string, metadata: ClientMetadata, existingToken?: string) {
    const email = normalizeEmail(emailInput);
    try {
      await this.cache.enforceLoginRateLimit(opaqueKey(email), opaqueKey(metadata.ipAddress));
    } catch (error) {
      if ((error as Error).message === 'LOGIN_RATE_LIMITED') {
        const exception = rateLimited('Too many login attempts');
        Object.assign(exception, { retryAfter: (error as { retryAfter?: number }).retryAfter ?? 60 });
        throw exception;
      }
      throw new ServiceUnavailableException('Login protection is temporarily unavailable');
    }

    const [record] = await this.database.db.select({
      id: users.id, status: users.status, deletedAt: users.deletedAt, lockedUntil: users.lockedUntil,
      passwordHash: passwordCredentials.passwordHash,
    }).from(users).innerJoin(passwordCredentials, eq(passwordCredentials.userId, users.id))
      .where(and(sql`lower(${users.email}) = ${email}`, isNull(passwordCredentials.deletedAt))).limit(1);

    if (record?.lockedUntil && record.lockedUntil > new Date()) {
      throw rateLimited('Account is temporarily locked');
    }
    this.dummyPasswordHash ??= hashPassword('NeverValid1!TimingOnly');
    const passwordValid = await verifyPassword(record?.passwordHash ?? await this.dummyPasswordHash, password);
    if (!record || record.deletedAt || record.status !== 'ACTIVE' || !passwordValid) {
      if (record) {
        const nextCount = await this.database.db.transaction(async (tx) => {
          await tx.execute(sql`select id from users where id = ${record.id} for update`);
          const [current] = await tx.select({ count: users.failedLoginAttempts }).from(users).where(eq(users.id, record.id));
          const count = (current?.count ?? 0) + 1;
          await tx.update(users).set({
            failedLoginAttempts: count,
            lockedUntil: count >= 5 ? new Date(Date.now() + LOCKOUT_MS) : null,
            updatedAt: new Date(),
          }).where(eq(users.id, record.id));
          return count;
        });
        await this.audit(nextCount >= 5 ? 'auth.login.locked' : 'auth.login.failed', 'auth', record.id);
        if (nextCount >= 5) throw rateLimited('Account is temporarily locked');
      } else {
        await this.audit('auth.login.failed', 'auth');
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    if (existingToken) await this.logoutByToken(existingToken, 'SESSION_ROTATED');
    await this.database.db.update(users).set({ failedLoginAttempts: 0, lockedUntil: null, updatedAt: new Date() }).where(eq(users.id, record.id));
    const [factor] = await this.database.db.select().from(mfaFactors)
      .where(and(eq(mfaFactors.userId, record.id), isNull(mfaFactors.deletedAt))).limit(1);
    const administrator = (await this.rolesFor(record.id)).includes('Administrador');
    if (factor?.enabled) {
      return { status: 'MFA_REQUIRED' as const, ...(await this.createChallenge(record.id, 'LOGIN')) };
    }
    if (administrator) {
      return { status: 'MFA_ENROLLMENT_REQUIRED' as const, ...(await this.createChallenge(record.id, 'ENROLLMENT')) };
    }
    return { status: 'AUTHENTICATED' as const, session: await this.createSession(record.id, metadata, false) };
  }

  async resolveSession(token: string | undefined): Promise<AuthenticatedSession> {
    if (!token) throw new UnauthorizedException('Authentication required');
    const tokenHash = hashOpaqueToken(token);
    const [record] = await this.database.db.select({
      sessionId: sessions.id, userId: users.id, email: users.email, fullName: users.fullName,
      passwordChangeRequired: users.passwordChangeRequired, mfaVerifiedAt: sessions.mfaVerifiedAt,
      csrfTokenHash: sessions.csrfTokenHash, tokenHash: sessions.tokenHash, expiresAt: sessions.expiresAt,
      revokedAt: sessions.revokedAt, userStatus: users.status, userDeletedAt: users.deletedAt,
      sessionDeletedAt: sessions.deletedAt,
    }).from(sessions).innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.tokenHash, tokenHash)).limit(1);
    if (!record || record.revokedAt || record.sessionDeletedAt || record.expiresAt <= new Date() || record.userDeletedAt || record.userStatus !== 'ACTIVE') {
      await this.cache.evictSessions([tokenHash]);
      throw new UnauthorizedException('Session is invalid');
    }
    await this.database.db.update(sessions).set({ lastSeenAt: new Date(), updatedAt: new Date() }).where(eq(sessions.id, record.sessionId));
    await this.cache.cacheSession(tokenHash, record.userId, Math.floor((record.expiresAt.getTime() - Date.now()) / 1_000));
    return { ...record, mfaVerified: Boolean(record.mfaVerifiedAt) };
  }

  verifyCsrf(session: AuthenticatedSession, csrfToken: string | undefined): void {
    if (!csrfToken || !verifyCsrfToken(csrfToken, session.csrfTokenHash)) throw new UnauthorizedException('Invalid CSRF token');
  }

  async rotateCsrf(session: AuthenticatedSession): Promise<string> {
    const csrfToken = generateCsrfToken();
    await this.database.db.update(sessions).set({ csrfTokenHash: hashCsrfToken(csrfToken), updatedAt: new Date() })
      .where(eq(sessions.id, session.sessionId));
    return csrfToken;
  }

  async logoutByToken(token: string, reason = 'LOGOUT'): Promise<void> {
    const tokenHash = hashOpaqueToken(token);
    const [record] = await this.database.db.update(sessions)
      .set({ revokedAt: new Date(), revocationReason: reason, updatedAt: new Date() })
      .where(and(eq(sessions.tokenHash, tokenHash), isNull(sessions.revokedAt)))
      .returning({ userId: sessions.userId });
    await this.cache.evictSessions([tokenHash]);
    if (record) await this.audit('auth.logout', 'auth', record.userId, { reason });
  }

  async logoutAll(session: AuthenticatedSession): Promise<void> {
    const active = await this.database.db.select({ tokenHash: sessions.tokenHash }).from(sessions)
      .where(and(eq(sessions.userId, session.userId), isNull(sessions.revokedAt), isNull(sessions.deletedAt), gt(sessions.expiresAt, new Date())));
    await this.database.db.update(sessions).set({ revokedAt: new Date(), revocationReason: 'LOGOUT_ALL', updatedAt: new Date() })
      .where(and(eq(sessions.userId, session.userId), isNull(sessions.revokedAt)));
    await this.cache.evictSessions(active.map((item) => item.tokenHash));
    await this.audit('auth.logout_all', 'auth', session.userId);
  }

  async listSessions(session: AuthenticatedSession) {
    const rows = await this.database.db.select({
      id: sessions.id, ipAddress: sessions.ipAddress, userAgent: sessions.userAgent,
      createdAt: sessions.createdAt, lastSeenAt: sessions.lastSeenAt, expiresAt: sessions.expiresAt,
    }).from(sessions).where(and(eq(sessions.userId, session.userId), isNull(sessions.revokedAt), isNull(sessions.deletedAt), gt(sessions.expiresAt, new Date())))
      .orderBy(desc(sessions.createdAt));
    return rows.map((item) => ({ ...item, current: item.id === session.sessionId }));
  }

  async revokeSession(session: AuthenticatedSession, targetId: string): Promise<void> {
    const [target] = await this.database.db.update(sessions)
      .set({ revokedAt: new Date(), revocationReason: 'USER_REVOKED', updatedAt: new Date() })
      .where(and(eq(sessions.id, targetId), eq(sessions.userId, session.userId), isNull(sessions.revokedAt), isNull(sessions.deletedAt)))
      .returning({ tokenHash: sessions.tokenHash });
    if (!target) throw new UnauthorizedException('Session not found');
    await this.cache.evictSessions([target.tokenHash]);
    await this.audit('auth.session.revoked', 'auth', session.userId, { sessionId: targetId });
  }

  async forgotPassword(emailInput: string, metadata: ClientMetadata): Promise<void> {
    const email = normalizeEmail(emailInput);
    await this.enforceSensitiveRateLimit('password-forgot-rate', [email, metadata.ipAddress]);
    const [user] = await this.database.db.select({ id: users.id }).from(users)
      .where(and(sql`lower(${users.email}) = ${email}`, eq(users.status, 'ACTIVE'), isNull(users.deletedAt))).limit(1);
    if (!user) return;
    const token = generateOpaqueToken();
    const encryptedToken = encryptSecret(token, this.environment.MFA_ENCRYPTION_KEY, `password-reset:${user.id}`);
    const expiresAt = new Date(Date.now() + RESET_TTL_MS);
    await this.database.db.transaction(async (tx) => {
      await tx.update(passwordResetTokens).set({ usedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(passwordResetTokens.userId, user.id), isNull(passwordResetTokens.usedAt), isNull(passwordResetTokens.deletedAt)));
      await tx.insert(passwordResetTokens).values({ userId: user.id, tokenHash: hashOpaqueToken(token), expiresAt, createdById: user.id, updatedById: user.id });
      await tx.insert(outboxEvents).values({
        aggregateType: 'USER', aggregateId: user.id, eventType: 'PasswordResetRequested',
        payload: { userId: user.id, encryptedToken, expiresAt: expiresAt.toISOString() }, createdById: user.id, updatedById: user.id,
      });
    });
    await this.audit('auth.password_reset.requested', 'auth', user.id);
  }

  async resetPassword(token: string, newPassword: string, metadata: ClientMetadata): Promise<void> {
    await this.enforceSensitiveRateLimit('password-reset-rate', [token, metadata.ipAddress]);
    if (!evaluatePasswordPolicy(newPassword).valid) throw new ConflictException('Password policy not satisfied');
    const tokenHash = hashOpaqueToken(token);
    const newHash = await hashPassword(newPassword);
    let userId: string | undefined;
    let revokedHashes: string[] = [];
    await this.database.db.transaction(async (tx) => {
      const [reset] = await tx.update(passwordResetTokens).set({ usedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(passwordResetTokens.tokenHash, tokenHash), isNull(passwordResetTokens.usedAt), isNull(passwordResetTokens.deletedAt), gt(passwordResetTokens.expiresAt, new Date())))
        .returning({ userId: passwordResetTokens.userId });
      if (!reset) throw new UnauthorizedException('Reset token is invalid');
      userId = reset.userId;
      await tx.update(passwordCredentials).set({ passwordHash: newHash, passwordChangedAt: new Date(), updatedAt: new Date() })
        .where(eq(passwordCredentials.userId, userId));
      const active = await tx.select({ tokenHash: sessions.tokenHash }).from(sessions)
        .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt), isNull(sessions.deletedAt)));
      revokedHashes = active.map((item) => item.tokenHash);
      await tx.update(sessions).set({ revokedAt: new Date(), revocationReason: 'PASSWORD_RESET', updatedAt: new Date() })
        .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
    });
    await this.cache.evictSessions(revokedHashes);
    await this.audit('auth.password_reset.completed', 'auth', userId);
  }

  async changePassword(session: AuthenticatedSession, currentPassword: string, newPassword: string): Promise<void> {
    if (!evaluatePasswordPolicy(newPassword).valid) throw new ConflictException('Password policy not satisfied');
    const [credential] = await this.database.db.select({ hash: passwordCredentials.passwordHash }).from(passwordCredentials)
      .where(and(eq(passwordCredentials.userId, session.userId), isNull(passwordCredentials.deletedAt))).limit(1);
    if (!credential || !(await verifyPassword(credential.hash, currentPassword))) throw new UnauthorizedException('Current password is invalid');
    if (await verifyPassword(credential.hash, newPassword)) throw new ConflictException('New password must differ');
    const newHash = await hashPassword(newPassword);
    let revokedHashes: string[] = [];
    await this.database.db.transaction(async (tx) => {
      await tx.update(passwordCredentials).set({ passwordHash: newHash, passwordChangedAt: new Date(), updatedAt: new Date() })
        .where(eq(passwordCredentials.userId, session.userId));
      await tx.update(users).set({ passwordChangeRequired: false, updatedAt: new Date() }).where(eq(users.id, session.userId));
      const active = await tx.select({ tokenHash: sessions.tokenHash }).from(sessions)
        .where(and(eq(sessions.userId, session.userId), isNull(sessions.revokedAt), isNull(sessions.deletedAt)));
      revokedHashes = active.map((item) => item.tokenHash);
      await tx.update(sessions).set({ revokedAt: new Date(), revocationReason: 'PASSWORD_CHANGED', updatedAt: new Date() })
        .where(and(eq(sessions.userId, session.userId), isNull(sessions.revokedAt)));
    });
    await this.cache.evictSessions(revokedHashes);
    await this.audit('auth.password.changed', 'auth', session.userId);
  }

  private async activeChallenge(challengeToken: string, purpose: 'LOGIN' | 'ENROLLMENT', reserveAttempt = false) {
    if (reserveAttempt) {
      const [challenge] = await this.database.db.update(mfaChallenges)
        .set({ attempts: sql`${mfaChallenges.attempts} + 1`, updatedAt: new Date() })
        .where(and(
          eq(mfaChallenges.challengeHash, hashOpaqueToken(challengeToken)), eq(mfaChallenges.purpose, purpose),
          isNull(mfaChallenges.consumedAt), isNull(mfaChallenges.deletedAt), gt(mfaChallenges.expiresAt, new Date()),
          lt(mfaChallenges.attempts, 5),
        )).returning();
      if (!challenge) throw new UnauthorizedException('MFA challenge is invalid');
      return challenge;
    }
    const [challenge] = await this.database.db.select().from(mfaChallenges).where(and(
      eq(mfaChallenges.challengeHash, hashOpaqueToken(challengeToken)), eq(mfaChallenges.purpose, purpose),
      isNull(mfaChallenges.consumedAt), isNull(mfaChallenges.deletedAt), gt(mfaChallenges.expiresAt, new Date()),
    )).limit(1);
    if (!challenge || challenge.attempts >= 5) throw new UnauthorizedException('MFA challenge is invalid');
    return challenge;
  }

  async setupMfa(challengeToken: string) {
    const challenge = await this.activeChallenge(challengeToken, 'ENROLLMENT');
    const secret = generateTotpSecret();
    const encryptedSecret = encryptSecret(secret, this.environment.MFA_ENCRYPTION_KEY, `mfa:${challenge.userId}`);
    const [existing] = await this.database.db.select({ id: mfaFactors.id }).from(mfaFactors)
      .where(and(eq(mfaFactors.userId, challenge.userId), isNull(mfaFactors.deletedAt))).limit(1);
    if (existing) {
      await this.database.db.update(mfaFactors).set({ encryptedSecret, enabled: false, lastUsedStep: null, updatedAt: new Date() })
        .where(eq(mfaFactors.id, existing.id));
    } else {
      await this.database.db.insert(mfaFactors).values({
        userId: challenge.userId, encryptedSecret, enabled: false, createdById: challenge.userId, updatedById: challenge.userId,
      });
    }
    const [user] = await this.database.db.select({ email: users.email }).from(users).where(eq(users.id, challenge.userId));
    return { secret, otpauthUri: `otpauth://totp/Lyvox:${encodeURIComponent(user?.email ?? 'user')}?secret=${secret}&issuer=Lyvox&digits=6&period=30` };
  }

  async beginMfaEnrollment(session: AuthenticatedSession) {
    const [enabledFactor] = await this.database.db.select({ id: mfaFactors.id }).from(mfaFactors)
      .where(and(eq(mfaFactors.userId, session.userId), eq(mfaFactors.enabled, true), isNull(mfaFactors.deletedAt))).limit(1);
    if (enabledFactor) throw new ConflictException('MFA is already active');
    await this.audit('auth.mfa.enrollment_started', 'auth', session.userId);
    return this.createChallenge(session.userId, 'ENROLLMENT');
  }

  async activateMfa(challengeToken: string, code: string, metadata: ClientMetadata) {
    await this.enforceSensitiveRateLimit('mfa-activate-rate', [challengeToken, metadata.ipAddress]);
    const challenge = await this.activeChallenge(challengeToken, 'ENROLLMENT', true);
    const [factor] = await this.database.db.select().from(mfaFactors)
      .where(and(eq(mfaFactors.userId, challenge.userId), isNull(mfaFactors.deletedAt))).limit(1);
    if (!factor) throw new UnauthorizedException('MFA enrollment is incomplete');
    const secret = decryptSecret(factor.encryptedSecret, this.environment.MFA_ENCRYPTION_KEY, `mfa:${challenge.userId}`);
    const verified = verifyTotpWithReplayProtection(secret, code, factor.lastUsedStep);
    if (!verified.valid || verified.counter === undefined) {
      throw new UnauthorizedException('MFA code is invalid');
    }
    const backups = await generateBackupCodes();
    let revokedHashes: string[] = [];
    await this.database.db.transaction(async (tx) => {
      const consumed = await tx.update(mfaChallenges).set({ consumedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(mfaChallenges.id, challenge.id), isNull(mfaChallenges.consumedAt))).returning({ id: mfaChallenges.id });
      if (consumed.length !== 1) throw new UnauthorizedException('MFA challenge was already used');
      await tx.update(mfaFactors).set({ enabled: true, lastUsedStep: verified.counter, updatedAt: new Date() }).where(eq(mfaFactors.id, factor.id));
      await tx.delete(mfaBackupCodes).where(eq(mfaBackupCodes.factorId, factor.id));
      await tx.insert(mfaBackupCodes).values(backups.hashes.map((codeHash) => ({ factorId: factor.id, codeHash, createdById: challenge.userId, updatedById: challenge.userId })));
      const active = await tx.select({ tokenHash: sessions.tokenHash }).from(sessions)
        .where(and(eq(sessions.userId, challenge.userId), isNull(sessions.revokedAt), isNull(sessions.deletedAt)));
      revokedHashes = active.map((item) => item.tokenHash);
      await tx.update(sessions).set({ revokedAt: new Date(), revocationReason: 'MFA_ACTIVATED', updatedAt: new Date() })
        .where(and(eq(sessions.userId, challenge.userId), isNull(sessions.revokedAt), isNull(sessions.deletedAt)));
    });
    await this.cache.evictSessions(revokedHashes);
    await this.audit('auth.mfa.activated', 'auth', challenge.userId);
    return { backupCodes: backups.codes, session: await this.createSession(challenge.userId, metadata, true) };
  }

  async completeMfa(challengeToken: string, code: string | undefined, backupCode: string | undefined, metadata: ClientMetadata) {
    await this.enforceSensitiveRateLimit('mfa-challenge-rate', [challengeToken, metadata.ipAddress]);
    const challenge = await this.activeChallenge(challengeToken, 'LOGIN', true);
    const [factor] = await this.database.db.select().from(mfaFactors)
      .where(and(eq(mfaFactors.userId, challenge.userId), eq(mfaFactors.enabled, true), isNull(mfaFactors.deletedAt))).limit(1);
    if (!factor) throw new UnauthorizedException('MFA factor is unavailable');
    let valid = false;
    if (code) {
      const secret = decryptSecret(factor.encryptedSecret, this.environment.MFA_ENCRYPTION_KEY, `mfa:${challenge.userId}`);
      const verified = verifyTotpWithReplayProtection(secret, code, factor.lastUsedStep);
      if (verified.valid && verified.counter !== undefined) {
        const updated = await this.database.db.update(mfaFactors).set({ lastUsedStep: verified.counter, updatedAt: new Date() })
          .where(and(eq(mfaFactors.id, factor.id), factor.lastUsedStep === null ? isNull(mfaFactors.lastUsedStep) : eq(mfaFactors.lastUsedStep, factor.lastUsedStep)))
          .returning({ id: mfaFactors.id });
        valid = updated.length === 1;
      }
    } else if (backupCode) {
      const candidates = await this.database.db.select().from(mfaBackupCodes)
        .where(and(eq(mfaBackupCodes.factorId, factor.id), isNull(mfaBackupCodes.usedAt), isNull(mfaBackupCodes.deletedAt)));
      for (const candidate of candidates) {
        if (!valid && await verifyArgon2idSecret(candidate.codeHash, backupCode)) {
          const consumed = await this.database.db.update(mfaBackupCodes).set({ usedAt: new Date(), updatedAt: new Date() })
            .where(and(eq(mfaBackupCodes.id, candidate.id), isNull(mfaBackupCodes.usedAt))).returning({ id: mfaBackupCodes.id });
          valid = consumed.length === 1;
        }
      }
    }
    if (!valid) {
      throw new UnauthorizedException('MFA proof is invalid');
    }
    const consumed = await this.database.db.update(mfaChallenges).set({ consumedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(mfaChallenges.id, challenge.id), isNull(mfaChallenges.consumedAt))).returning({ id: mfaChallenges.id });
    if (consumed.length !== 1) throw new UnauthorizedException('MFA challenge was already used');
    await this.audit(backupCode ? 'auth.mfa.backup_used' : 'auth.mfa.verified', 'auth', challenge.userId);
    return this.createSession(challenge.userId, metadata, true);
  }
}
