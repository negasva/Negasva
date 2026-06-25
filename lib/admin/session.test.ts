import { describe, it, expect, beforeAll } from 'vitest';
import { createSessionToken, verifySessionToken, safeEqual } from './session';

beforeAll(() => {
  process.env.ADMIN_SESSION_SECRET = 'test-secret-key';
});

describe('admin session token', () => {
  it('verifies a freshly created token', () => {
    expect(verifySessionToken(createSessionToken())).toBe(true);
  });

  it('rejects empty, null and malformed tokens', () => {
    expect(verifySessionToken('')).toBe(false);
    expect(verifySessionToken(null)).toBe(false);
    expect(verifySessionToken('no-dot')).toBe(false);
    expect(verifySessionToken('123.deadbeef')).toBe(false);
  });

  it('rejects a tampered signature', () => {
    const t = createSessionToken();
    const bad = t.slice(0, -1) + (t.endsWith('a') ? 'b' : 'a');
    expect(verifySessionToken(bad)).toBe(false);
  });

  it('safeEqual is true only for identical strings', () => {
    expect(safeEqual('abc', 'abc')).toBe(true);
    expect(safeEqual('abc', 'abd')).toBe(false);
    expect(safeEqual('abc', 'abcd')).toBe(false);
  });
});
