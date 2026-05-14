const attempts = new Map<string, { count: number; timestamp: number }>();

const WINDOW = 60 * 1000; // 1 minuto
const MAX_ATTEMPTS = 5;

export function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const record = attempts.get(key);

  if (!record) {
    attempts.set(key, { count: 1, timestamp: now });
    return true;
  }

  if (now - record.timestamp > WINDOW) {
    attempts.set(key, { count: 1, timestamp: now });
    return true;
  }

  record.count++;
  if (record.count > MAX_ATTEMPTS) {
    return false;
  }

  return true;
}

export function clearRateLimitFor(key: string): void {
  attempts.delete(key);
}
