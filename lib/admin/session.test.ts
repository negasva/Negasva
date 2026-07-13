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

  it('invalidates live sessions when ADMIN_PASSWORD is rotated (A1)', () => {
    process.env.ADMIN_PASSWORD = 'old-password';
    const token = createSessionToken();
    expect(verifySessionToken(token)).toBe(true);

    process.env.ADMIN_PASSWORD = 'new-password';
    expect(verifySessionToken(token)).toBe(false);
    delete process.env.ADMIN_PASSWORD;
  });

  it('safeEqual is true only for identical strings', () => {
    expect(safeEqual('abc', 'abc')).toBe(true);
    expect(safeEqual('abc', 'abd')).toBe(false);
    expect(safeEqual('abc', 'abcd')).toBe(false);
  });
});
