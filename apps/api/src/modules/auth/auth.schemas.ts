import { z } from 'zod';
import { PASSWORD_MAX_LENGTH } from '@lyvox/auth';

const token = z.string().min(40).max(256);
const password = z.string().min(1).max(PASSWORD_MAX_LENGTH);

export const loginSchema = z.object({ email: z.string().email().max(255), password }).strict();
export const mfaChallengeSchema = z.object({
  challengeToken: token,
  code: z.string().regex(/^\d{6}$/u).optional(),
  backupCode: z.string().min(10).max(40).optional(),
}).strict().refine((value) => Boolean(value.code) !== Boolean(value.backupCode), 'Provide one MFA proof');
export const enrollmentChallengeSchema = z.object({ challengeToken: token }).strict();
export const mfaActivateSchema = z.object({ challengeToken: token, code: z.string().regex(/^\d{6}$/u) }).strict();
export const forgotPasswordSchema = z.object({ email: z.string().email().max(255) }).strict();
export const resetPasswordSchema = z.object({ token, newPassword: password }).strict();
export const changePasswordSchema = z.object({ currentPassword: password, newPassword: password }).strict();
export const sessionIdSchema = z.string().uuid();

export function parseBody<T>(schema: z.ZodType<T>, body: unknown): T {
  return schema.parse(body);
}
