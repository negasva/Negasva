'use client';

import Script from 'next/script';

/**
 * Carga el script de Google reCAPTCHA SOLO en las páginas que lo necesitan
 * (formularios: /order y /contacto). Antes vivía en el layout raíz y se
 * descargaba en cada ruta, penalizando el INP global del sitio.
 *
 * Si NEXT_PUBLIC_RECAPTCHA_SITE_KEY no está configurada, no renderiza nada.
 */
export default function RecaptchaScript() {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey) return null;

  return (
    <Script
      src={`https://www.recaptcha.net/recaptcha/api.js?render=${siteKey}`}
      strategy="afterInteractive"
    />
  );
}
