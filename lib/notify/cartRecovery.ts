// Cuatro versiones de email para recuperar carritos abandonados. El cron elige
// una al azar (A/B testing) y guarda cuál se envió en carts.recovery_variant.
//
// Todas usan HTML email-safe (tablas + estilos inline) para verse bien en
// Gmail/Outlook/Apple Mail. Idioma: español (mercado principal). Se pueden
// añadir versiones EN/FR si más adelante se guarda el idioma en el carrito.

export interface RecoveryEmailData {
  name: string | null;
  code: string;
  discountLabel: string; // "10%" o "$10"
  expiresLabel: string;  // "72 horas" / "3 días"
  url: string;           // link de vuelta al pedido (con ?code=)
  summary: string | null; // "Estilo · Cuerpo completo · 3 pers."
}

const BRAND = '#E8A400';
const DARK = '#1A1A1A';
const MUTED = '#6B7280';

function button(url: string, label: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px 0;">
    <tr><td style="border-radius:12px;background:${BRAND};">
      <a href="${url}" target="_blank"
         style="display:inline-block;padding:14px 32px;font-family:Arial,Helvetica,sans-serif;
                font-size:16px;font-weight:800;color:#ffffff;text-decoration:none;border-radius:12px;">
        ${label}
      </a>
    </td></tr>
  </table>`;
}

function codeBox(code: string, discountLabel: string, expiresLabel: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" width="100%"
      style="margin:8px 0 4px;border:2px dashed ${BRAND};border-radius:12px;background:#FFFBEB;">
      <tr><td style="padding:16px;text-align:center;font-family:Arial,Helvetica,sans-serif;">
        <div style="font-size:13px;color:${MUTED};text-transform:uppercase;letter-spacing:1px;font-weight:700;">
          Tu descuento de ${discountLabel}
        </div>
        <div style="font-size:26px;font-weight:800;color:${DARK};letter-spacing:2px;margin:6px 0;">${code}</div>
        <div style="font-size:12px;color:${MUTED};">Válido ${expiresLabel} · un solo uso</div>
      </td></tr>
    </table>`;
}

function layout(inner: string, footerNote: string): string {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F3F4F6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F3F4F6;padding:24px 0;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
          style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;">
          <tr><td style="padding:28px 32px 8px;font-family:Arial,Helvetica,sans-serif;">
            <div style="font-size:22px;font-weight:800;color:${DARK};letter-spacing:-0.5px;">
              NEGAS<span style="font-weight:400;">VA</span>
            </div>
          </td></tr>
          <tr><td style="padding:8px 32px 32px;font-family:Arial,Helvetica,sans-serif;color:${DARK};">
            ${inner}
            <p style="font-size:12px;color:${MUTED};line-height:1.6;margin-top:28px;border-top:1px solid #eee;padding-top:16px;">
              ${footerNote}
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;
}

// Escapa datos que provienen del cliente (nombre) o de la BD (resumen) antes
// de inyectarlos en el HTML del email.
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const hi = (name: string | null) =>
  name && name.trim() ? `Hola ${esc(name.trim().split(' ')[0])}` : 'Hola';
const summaryLine = (s: string | null) =>
  s ? `<p style="font-size:14px;color:${MUTED};margin:0 0 8px;">Tu retrato: <strong style="color:${DARK};">${esc(s)}</strong></p>` : '';

// ── Versión 1 · Recordatorio cálido ───────────────────────────────────────
function v1(d: RecoveryEmailData) {
  const inner = `
    <h1 style="font-size:22px;margin:12px 0 8px;">${hi(d.name)}, tu retrato te está esperando</h1>
    <p style="font-size:15px;line-height:1.6;">Vimos que empezaste a crear tu retrato personalizado y no llegaste a terminar. ¡Lo tenemos guardado tal cual lo dejaste!</p>
    ${summaryLine(d.summary)}
    <p style="font-size:15px;line-height:1.6;">Para animarte a terminarlo, aquí tienes un descuento:</p>
    ${codeBox(d.code, d.discountLabel, d.expiresLabel)}
    ${button(d.url, 'Terminar mi retrato')}
    <p style="font-size:14px;color:${MUTED};line-height:1.6;">Dibujado a mano por artistas reales. Si tienes dudas, responde a este correo y te ayudamos.</p>`;
  return { subject: `${hi(d.name)}, tu retrato NEGASVA te espera`, html: layout(inner, footer()) };
}

// ── Versión 2 · Urgencia (el descuento caduca) ────────────────────────────
function v2(d: RecoveryEmailData) {
  const inner = `
    <h1 style="font-size:22px;margin:12px 0 8px;">Tu descuento de ${d.discountLabel} caduca pronto</h1>
    <p style="font-size:15px;line-height:1.6;">${hi(d.name)}, guardamos tu retrato a medias y te reservamos un descuento — pero solo por ${d.expiresLabel}.</p>
    ${codeBox(d.code, d.discountLabel, d.expiresLabel)}
    ${summaryLine(d.summary)}
    ${button(d.url, `Usar mi ${d.discountLabel} de descuento`)}
    <p style="font-size:14px;color:${MUTED};line-height:1.6;">Cuando caduque no podremos reactivarlo. ¡No lo dejes escapar!</p>`;
  return { subject: `Tu ${d.discountLabel} de descuento caduca en ${d.expiresLabel}`, html: layout(inner, footer()) };
}

// ── Versión 3 · Prueba social ─────────────────────────────────────────────
function v3(d: RecoveryEmailData) {
  const inner = `
    <h1 style="font-size:22px;margin:12px 0 8px;">Únete a +530.000 retratos entregados</h1>
    <p style="font-size:15px;line-height:1.6;">${hi(d.name)}, miles de personas ya regalaron su retrato personalizado NEGASVA. El tuyo está a un paso de estar listo.</p>
    ${summaryLine(d.summary)}
    <p style="font-size:15px;line-height:1.6;">Termínalo hoy con este descuento:</p>
    ${codeBox(d.code, d.discountLabel, d.expiresLabel)}
    ${button(d.url, 'Completar mi pedido')}
    <p style="font-size:14px;color:${MUTED};line-height:1.6;">Dibujo 100% a mano, sin IA. Valoración media 4,9/5.</p>`;
  return { subject: `${hi(d.name)}, únete a +530.000 retratos NEGASVA`, html: layout(inner, footer()) };
}

// ── Versión 4 · Personal / atención al cliente ────────────────────────────
function v4(d: RecoveryEmailData) {
  const inner = `
    <h1 style="font-size:22px;margin:12px 0 8px;">¿Te ayudamos a terminar tu retrato?</h1>
    <p style="font-size:15px;line-height:1.6;">${hi(d.name)}, soy del equipo de NEGASVA. Vi que tu pedido quedó a medias — ¿alguna duda con el estilo, las fotos o el pago?</p>
    ${summaryLine(d.summary)}
    <p style="font-size:15px;line-height:1.6;">Para ponértelo fácil, te dejo un descuento y el enlace para retomarlo justo donde lo dejaste:</p>
    ${codeBox(d.code, d.discountLabel, d.expiresLabel)}
    ${button(d.url, 'Retomar mi pedido')}
    <p style="font-size:14px;color:${MUTED};line-height:1.6;">Responde a este correo con cualquier pregunta — te contesto personalmente.</p>`;
  return { subject: `${hi(d.name)}, ¿te ayudo a terminar tu retrato?`, html: layout(inner, footer()) };
}

function footer() {
  return 'Recibes este correo porque empezaste un pedido en negasva.shop. Si no fuiste tú, ignóralo sin problema.';
}

const VARIANTS = [v1, v2, v3, v4];

/** Elige una versión al azar (1..4) y devuelve el email + el número de versión. */
export function buildRecoveryEmail(
  d: RecoveryEmailData,
  variant?: number,
): { subject: string; html: string; variant: number } {
  const idx = variant && variant >= 1 && variant <= 4
    ? variant - 1
    : Math.floor(Math.random() * VARIANTS.length);
  const built = VARIANTS[idx](d);
  return { ...built, variant: idx + 1 };
}
