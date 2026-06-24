'use client';

/**
 * Obtiene un token reCAPTCHA v3 en el cliente, cargando el script bajo demanda
 * (solo cuando un formulario se envía) para no penalizar el INP global del sitio.
 * Si no hay site key o la API no carga, devuelve undefined — el backend decide
 * si eso bloquea o no (ver lib/security/recaptcha.ts).
 */

interface Grecaptcha {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, opts: { action: string }) => Promise<string>;
}

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

let scriptPromise: Promise<void> | null = null;

// Si reCAPTCHA no responde a tiempo (script bloqueado, `ready`/`execute` que no
// resuelven en algunos móviles), no dejamos colgado el checkout: la promesa
// rechaza y getRecaptchaToken devuelve undefined (el backend decide).
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('recaptcha timeout')), ms)),
  ]);
}

function loadScript(siteKey: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.grecaptcha) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://www.recaptcha.net/recaptcha/api.js?render=${siteKey}`;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('recaptcha script failed'));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export async function getRecaptchaToken(action: string): Promise<string | undefined> {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey) return undefined;
  try {
    await withTimeout(loadScript(siteKey), 6000);
    const grecaptcha = window.grecaptcha;
    if (!grecaptcha) return undefined;
    await withTimeout(new Promise<void>((resolve) => grecaptcha.ready(resolve)), 6000);
    return await withTimeout(grecaptcha.execute(siteKey, { action }), 6000);
  } catch {
    return undefined;
  }
}
