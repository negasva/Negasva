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
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});
