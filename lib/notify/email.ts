// Emisor de email genérico vía la API REST de Resend (sin SDK — un solo fetch).
// No-op y sin lanzar cuando faltan las env vars, para que un fallo de correo
// nunca rompa el flujo que lo llama.
//
// Env: RESEND_API_KEY, RESEND_FROM (remitente verificado en Resend).

import { fetchWithTimeout } from '@/lib/net';

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

/** Devuelve true si el correo se envió; false si no está configurado o falló. */
export async function sendEmail({ to, subject, html, replyTo }: SendEmailInput): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!key || !from || !to) return false;

  try {
    const res = await fetchWithTimeout('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    return res.ok;
  } catch (err) {
    console.error('[email] send failed:', err);
    return false;
  }
}
