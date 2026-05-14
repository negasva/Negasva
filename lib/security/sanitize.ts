export function sanitizeInput(input: string, maxLength = 500): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '');
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase().slice(0, 255);
}

export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
