import { describe, expect, it } from 'vitest';
import { isTrustedOrigin } from './strict-origin.guard.js';

describe('isTrustedOrigin', () => {
  const trusted = ['https://app.lyvox.com'];

  it('accepts only an exact trusted origin', () => {
    expect(isTrustedOrigin('https://app.lyvox.com', trusted)).toBe(true);
    expect(isTrustedOrigin('https://evil.app.lyvox.com', trusted)).toBe(false);
  });

  it('rejects missing, malformed, path-bearing, and credential-bearing origins', () => {
    expect(isTrustedOrigin(undefined, trusted)).toBe(false);
    expect(isTrustedOrigin('not-a-url', trusted)).toBe(false);
    expect(isTrustedOrigin('https://app.lyvox.com/path', trusted)).toBe(false);
    expect(isTrustedOrigin('https://user@app.lyvox.com', trusted)).toBe(false);
  });
});
