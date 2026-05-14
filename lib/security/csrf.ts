import crypto from 'crypto';

const tokens = new Map<string, number>();
const TOKEN_EXPIRY = 30 * 60 * 1000; // 30 minutes

export function generateCSRFToken(): string {
  const token = crypto.randomBytes(32).toString('hex');
  tokens.set(token, Date.now());
  return token;
}

export function validateCSRFToken(token: string): boolean {
  const timestamp = tokens.get(token);

  if (!timestamp) {
    return false;
  }

  if (Date.now() - timestamp > TOKEN_EXPIRY) {
    tokens.delete(token);
    return false;
  }

  tokens.delete(token);
  return true;
}

export function cleanExpiredTokens(): void {
  const now = Date.now();
  for (const [token, timestamp] of tokens.entries()) {
    if (now - timestamp > TOKEN_EXPIRY) {
      tokens.delete(token);
    }
  }
}
