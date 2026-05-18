import { z } from 'zod';

// Step 1: Style Selection
export const Step1StyleSchema = z.object({
  styleId: z.string().uuid('Invalid style'),
});

// Step 2: Body Type & Appearance
export const Step2BodySchema = z.object({
  bodyType: z.enum(['full_body', 'torso_only']),
  skinTone: z.string().min(1, 'Select a skin tone'),
  clothingColor: z.string().min(1, 'Select a clothing color'),
  bodyAccessories: z.array(z.string()).default([]),
});

// Step 3: Background
export const Step3BackgroundSchema = z.object({
  backgroundId: z.string().uuid('Invalid background'),
});

// Step 4: People
export const PersonSchema = z.object({
  id: z.string().uuid().default(() => crypto.randomUUID?.() || ''),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['self', 'spouse', 'child', 'parent', 'friend', 'other']),
  description: z.string().max(200, 'Max 200 characters'),
});

export const Step4PeopleSchema = z.object({
  people: z.array(PersonSchema).min(1, 'Add at least one person').max(4, 'Max 4 people'),
});

// Step 5: Details
export const Step5DetailsSchema = z.object({
  mood: z.enum(['happy', 'serious', 'playful', 'romantic', 'peaceful', 'adventurous']),
  expression: z.enum(['smiling', 'neutral', 'laughing']),
  detailAccessories: z.array(z.string()).default([]),
  specialRequests: z.string().max(500, 'Max 500 characters').optional(),
});

// Step 6: Images (simple validation - complex validation happens in API)
export const Step6ImagesSchema = z.object({
  imageUrls: z.array(z.string().url()).min(1, 'Upload at least one image'),
});

// Complete Wizard State
export const WizardStateSchema = z.object({
  styleId: z.string().uuid(),
  styleName: z.string(),
  bodyType: z.enum(['full_body', 'torso_only']),
  skinTone: z.string(),
  clothingColor: z.string(),
  bodyAccessories: z.array(z.string()),
  backgroundId: z.string().uuid(),
  backgroundName: z.string(),
  people: z.array(PersonSchema),
  mood: z.enum(['happy', 'serious', 'playful', 'romantic', 'peaceful', 'adventurous']),
  expression: z.enum(['smiling', 'neutral', 'laughing']),
  detailAccessories: z.array(z.string()),
  specialRequests: z.string().max(500).optional(),
  imageUrls: z.array(z.string().url()).min(2, 'At least 2 images required'),
});

// Checkout
export const CheckoutSchema = z.object({
  email: z.string().email('Invalid email'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  instagram: z.string().optional(),
});

// Auth
export const SignupSchema = z.object({
  email: z.string()
    .email('Invalid email')
    .max(255, 'Email too long'),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^a-zA-Z0-9]/, 'Must contain special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const LoginSchema = z.object({
  email: z.string()
    .email('Invalid email')
    .max(255, 'Email too long'),
  password: z.string().min(1, 'Password required').max(255),
});

// ─── Public API schemas ────────────────────────────────────────────────

// Accepts UUIDs or short alphanumeric/dashed ids; the DB query enforces actual existence.
const OrderIdSchema = z.string().trim().min(6).max(64).regex(
  /^[A-Za-z0-9-]+$/,
  'Invalid order id',
);

export const TrackOrderSchema = z.object({
  orderId: OrderIdSchema,
  email: z.string().trim().toLowerCase().email('Invalid email').max(255),
});

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

const DrawingStyleSchema = z.enum([
  'rick-morty',
  'gravity-falls',
  'simpsons',
  'fairly-odd',
  'negasva',
]).nullable().optional();

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
});
