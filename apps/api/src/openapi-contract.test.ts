import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const implementedRoutes = [
  'POST /auth/login', 'POST /auth/mfa/challenge', 'POST /auth/mfa/enrollment', 'POST /auth/mfa/setup', 'POST /auth/mfa/activate',
  'GET /auth/me', 'POST /auth/csrf', 'POST /auth/logout', 'POST /auth/logout-all',
  'GET /auth/sessions', 'DELETE /auth/sessions/{id}', 'POST /auth/password/forgot',
  'POST /auth/password/reset', 'POST /auth/password/change',
].sort();

describe('auth OpenAPI 3.1 contract', () => {
  it('is valid JSON and covers every implemented auth route exactly', async () => {
    const source = await readFile(new URL('../openapi/auth.openapi.json', import.meta.url), 'utf8');
    const document = JSON.parse(source) as {
      openapi: string;
      paths: Record<string, { $ref: string }>;
      components: { pathItems: Record<string, Record<string, unknown>> };
    };
    const documentedRoutes = Object.entries(document.paths)
      .flatMap(([path, pathItem]) => {
        const name = pathItem.$ref.split('/').at(-1)!;
        return Object.keys(document.components.pathItems[name]!).map((method) => `${method.toUpperCase()} ${path}`);
      })
      .sort();
    expect(document.openapi).toBe('3.1.0');
    expect(documentedRoutes).toEqual(implementedRoutes);
  });
});
