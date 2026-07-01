import { z } from 'zod';

/**
 * Fuente ÚNICA de verdad sobre lo que compone una orden. Antes había esquemas
 * duplicados/inconsistentes (un CheckoutSchema con email/nombre sin usar, un
 * wizard de 6 pasos que no existía, y el CheckoutSchema real inline en la API).
 * Todo el flujo de pedido valida desde aquí.
 *
 * Capas:
 *   PricingSelectionSchema  → campos que afectan el precio (quote + checkout)
 *   OrderSelectionSchema    → + estilo y notas (lo que define la obra)
 *   CheckoutSchema          → + pago (moneda, tasa, cupón, fotos)
 */

export const CURRENCY = z.enum(['usd', 'eur', 'gbp', 'mxn', 'cad', 'cop']);

// bodyType como string (no enum) para soportar tipos de cuerpo creados desde el
// admin; el precio cae a fallback si el slug no existe.
const bodyType = z.string().trim().min(1).max(40);

export const PricingSelectionSchema = z.object({
  bodyType,
  peopleCount: z.number().int().min(1).max(8),
  background: z.string().max(60).default('none'),
  express: z.boolean().default(false),
  // Print-on-demand physical add-ons (product keys); invalid keys are dropped
  // by the pricing math, so this stays permissive on the wire.
  products: z.array(z.string().max(30)).max(10).default([]),
  // Chosen variant per product: { productKey: { optionGroup: valueKey } }.
  productOptions: z.record(z.string().max(30), z.record(z.string().max(30), z.string().max(60))).default({}),
});

export const QuoteSchema = PricingSelectionSchema.extend({
  discountCode: z.string().max(40).optional(),
});

export const OrderSelectionSchema = PricingSelectionSchema.extend({
  style: z.string().min(1).max(60),
  specialRequests: z.string().max(500).default(''),
});

export const CheckoutSchema = OrderSelectionSchema.extend({
  currency: CURRENCY,
  discountCode: z.string().max(40).optional(),
  // Rutas de las fotos del cliente, ya subidas al bucket order-photos.
  photoPaths: z.array(z.string().max(200)).max(8).optional(),
  uploadId: z.string().max(80).optional(),
  // Tasa de cambio del cliente — solo para display; el cobro es en la moneda dada.
  rate: z.number().positive().finite().max(10_000),
});

// Consulta de seguimiento de pedido (/seguimiento).
const OrderIdSchema = z.string().trim().min(6).max(64).regex(
  /^[A-Za-z0-9-]+$/,
  'Invalid order id',
);
export const TrackOrderSchema = z.object({
  orderId: OrderIdSchema,
  email: z.string().trim().toLowerCase().email('Invalid email').max(255),
});

export type PricingSelection = z.infer<typeof PricingSelectionSchema>;
export type OrderSelection = z.infer<typeof OrderSelectionSchema>;
export type CheckoutInput = z.infer<typeof CheckoutSchema>;
