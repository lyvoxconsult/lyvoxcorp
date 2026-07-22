import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('authorization OpenAPI 3.1 contract', () => {
  it('documents each protected route and its explicit permission', async () => {
    const source = await readFile(new URL('../openapi/authorization.openapi.json', import.meta.url), 'utf8');
    const document = JSON.parse(source) as { openapi: string; paths: Record<string, Record<string, { 'x-required-permission': string }>> };
    expect(document.openapi).toBe('3.1.0');
    expect(document.paths['/users']?.get?.['x-required-permission']).toBe('users.manage');
    expect(document.paths['/roles']?.get?.['x-required-permission']).toBe('roles.manage');
    expect(document.paths['/roles']?.post?.['x-required-permission']).toBe('roles.manage');
  });
});
