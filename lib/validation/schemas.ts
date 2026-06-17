import { z } from 'zod';

// ─── Public API schemas ────────────────────────────────────────────────
// El esquema de orden/checkout vive en lib/validation/order.ts (fuente única).

export const NewsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email').max(255),
  source: z.string().trim().max(50).optional(),
});

// ─── Admin API schemas ─────────────────────────────────────────────────

// Reject javascript:, data:, file:, etc. — only http(s) URLs to known hosts,
// or root-relative paths starting with / (for local public assets).
const SafeUrlSchema = z.string().trim().max(2048).refine((s) => {
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}, 'URL must be http(s)');

// Like SafeUrlSchema but also accepts root-relative paths (/backgrounds/rm-1.jpg)
const SafeImageSchema = z.string().trim().max(2048).refine((s) => {
  if (s.startsWith('/') && !s.includes('..') && !s.includes('\0')) return true;
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}, 'Must be an https URL or a root-relative path starting with /');

const IdSchema = z.string().trim().min(1).max(64);
const MoneySchema = z.number().finite().min(0).max(100_000);

// Any portrait_styles slug — existence is checked in the admin API so
// backgrounds can be assigned to styles created from the admin panel.
const DrawingStyleSchema = z.string().trim().min(1).max(100)
  .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers and hyphens')
  .nullable().optional();

export const AdminBackgroundCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  image_url: SafeImageSchema,
  style: DrawingStyleSchema,
  active: z.boolean().optional(),
});

export const AdminBackgroundUpdateSchema = z.object({
  id: IdSchema,
  name: z.string().trim().min(1).max(120).optional(),
  image_url: SafeImageSchema.optional(),
  style: DrawingStyleSchema,
  active: z.boolean().optional(),
});

export const AdminPackageCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional().nullable(),
  final_price: MoneySchema,
  active: z.boolean().optional(),
});

export const AdminPackageUpdateSchema = z.object({
  id: IdSchema,
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  final_price: MoneySchema.optional(),
  active: z.boolean().optional(),
});

export const AdminDiscountCodeCreateSchema = z.object({
  code: z.string().trim().min(2).max(40).regex(
    /^[A-Z0-9_-]+$/i,
    'Code must contain only letters, numbers, _ or -',
  ),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().finite().positive().max(100_000),
  expires_at: z.string().datetime().optional().nullable(),
  max_uses: z.number().int().positive().max(1_000_000).optional().nullable(),
  active: z.boolean().optional(),
}).refine(
  (d) => d.type !== 'percentage' || d.value <= 100,
  { message: 'Percentage discount cannot exceed 100', path: ['value'] },
);

export const AdminDiscountCodeUpdateSchema = z.object({
  id: IdSchema,
  code: z.string().trim().min(2).max(40).regex(/^[A-Z0-9_-]+$/i).optional(),
  type: z.enum(['percentage', 'fixed']).optional(),
  value: z.number().finite().positive().max(100_000).optional(),
  expires_at: z.string().datetime().optional().nullable(),
  max_uses: z.number().int().positive().max(1_000_000).optional().nullable(),
  active: z.boolean().optional(),
});

export const AdminPriceUpdateSchema = z.object({
  id: IdSchema,
  amount: MoneySchema,
});

export const AdminFaqCreateSchema = z.object({
  question: z.string().trim().min(1).max(300),
  answer: z.string().trim().min(1).max(3000),
  sort_order: z.number().int().min(0).max(10_000).optional(),
  is_active: z.boolean().optional(),
});

export const AdminFaqUpdateSchema = z.object({
  id: IdSchema,
  question: z.string().trim().min(1).max(300).optional(),
  answer: z.string().trim().min(1).max(3000).optional(),
  sort_order: z.number().int().min(0).max(10_000).optional(),
  is_active: z.boolean().optional(),
});

export const DeleteByIdSchema = z.object({ id: IdSchema });

export const AdminOrderCreateSchema = z.object({
  client_name: z.string().trim().min(1).max(200),
  client_email: z.string().trim().email().max(255).optional().nullable(),
  client_instagram: z.string().trim().max(100).optional().nullable(),
  style: z.string().trim().max(100).optional().nullable(),
  body_type: z.enum(['torso_only', 'full_body']).optional().nullable(),
  background_name: z.string().trim().max(200).optional().nullable(),
  people_count: z.number().int().min(1).max(20).default(1),
  status: z.enum(['pending', 'in_progress', 'delivered', 'cancelled']).default('pending'),
  price: MoneySchema.optional().nullable(),
  currency: z.string().trim().max(3).default('USD'),
  notes: z.string().trim().max(2000).optional().nullable(),
  reference: z.string().trim().max(100).optional().nullable(),
});

export const AdminOrderUpdateSchema = z.object({
  id: IdSchema,
  client_name: z.string().trim().min(1).max(200).optional(),
  client_email: z.string().trim().email().max(255).optional().nullable(),
  client_instagram: z.string().trim().max(100).optional().nullable(),
  style: z.string().trim().max(100).optional().nullable(),
  body_type: z.enum(['torso_only', 'full_body']).optional().nullable(),
  background_name: z.string().trim().max(200).optional().nullable(),
  people_count: z.number().int().min(1).max(20).optional(),
  status: z.enum(['pending', 'in_progress', 'delivered', 'cancelled']).optional(),
  price: MoneySchema.optional().nullable(),
  currency: z.string().trim().max(3).optional(),
  notes: z.string().trim().max(2000).optional().nullable(),
  reference: z.string().trim().max(100).optional().nullable(),
  delivered_at: z.string().datetime({ offset: true }).optional().nullable(),
});

export const AdminStyleCreateSchema = z.object({
  slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers and hyphens'),
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(2000).optional().nullable(),
  example_image_url: SafeImageSchema.optional().nullable(),
  is_active: z.boolean().default(true),
});

export const AdminStyleUpdateSchema = z.object({
  id: IdSchema,
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  example_image_url: SafeImageSchema.optional().nullable(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

export const AdminGalleryCreateSchema = z.object({
  title: z.string().trim().min(1).max(120),
  style: z.string().trim().max(100).optional().nullable(),
  image_url: SafeImageSchema,
  sort_order: z.number().int().min(0).max(10_000).optional(),
  is_active: z.boolean().optional(),
});

export const AdminGalleryUpdateSchema = z.object({
  id: IdSchema,
  title: z.string().trim().min(1).max(120).optional(),
  style: z.string().trim().max(100).optional().nullable(),
  image_url: SafeImageSchema.optional(),
  sort_order: z.number().int().min(0).max(10_000).optional(),
  is_active: z.boolean().optional(),
});
