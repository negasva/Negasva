import { z } from 'zod';
import { MAX_PEOPLE } from '@/lib/pricing/calc';

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
  peopleCount: z.number().int().min(1).max(MAX_PEOPLE),
  background: z.string().max(60).default('none'),
  express: z.boolean().default(false),
  // Add-on: video del proceso de dibujo (precio plano, prices.recording_addon).
  recording: z.boolean().default(false),
  // Print-on-demand physical add-ons as a per-unit map:
  //   { productKey: [ { optionGroup: valueKey }, … ] }
  // The array length is the quantity of that product, and each entry holds the
  // chosen variant (size, model…) of that individual unit — so the customer can
  // add several of the same product each with its own size. Invalid keys/units
  // are dropped by the pricing math, so this stays permissive on the wire.
  productUnits: z
    .record(
      z.string().max(30),
      z.array(z.record(z.string().max(30), z.string().max(60))).max(20),
    )
    .default({}),
});

export const QuoteSchema = PricingSelectionSchema.extend({
  discountCode: z.string().max(40).optional(),
});

export const OrderSelectionSchema = PricingSelectionSchema.extend({
  style: z.string().min(1).max(60),
  specialRequests: z.string().max(500).default(''),
});

// Envío elegido en el calculador del carrito. Solo viaja el ID de la tarifa y
// la dirección cotizada — el precio SIEMPRE se re-cotiza en el servidor con
// Printful antes de cobrar (nunca se confía en un monto del cliente).
export const ShippingSelectionSchema = z.object({
  rateId: z.string().trim().min(1).max(60),
  country: z.string().trim().toUpperCase().length(2),
  state: z.string().trim().max(40).optional(),
  city: z.string().trim().max(80).optional(),
  zip: z.string().trim().max(16).optional(),
});

export const CheckoutSchema = OrderSelectionSchema.extend({
  currency: CURRENCY,
  // Método de envío elegido para los productos físicos (opcional: sin él se
  // mantiene el comportamiento anterior — envío cotizado al preparar el pedido).
  shipping: ShippingSelectionSchema.optional(),
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
