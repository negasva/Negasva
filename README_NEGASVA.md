# NEGASVA - Cartoon Portrait Platform

Custom cartoon portrait generator and e-commerce platform. Get yourself drawn as Rick & Morty, Gravity Falls, Simpsons, or Fairly OddParents characters.

## ✅ Implementation Status

### Foundation Complete (Week 1)
- ✅ Next.js 14 + TypeScript + Tailwind setup
- ✅ Supabase integration
- ✅ Database schema (3 migrations: tables, RLS, seed data)
- ✅ Type definitions (Order, WizardState, Profile, etc.)
- ✅ Zod validation schemas for all 6 steps
- ✅ Zustand wizard store (useWizard hook)
- ✅ Pricing logic ($15/torso, $25/full body, $15/background)
- ✅ Landing page with hero + features + pricing
- ✅ GA4 + reCAPTCHA script tags

### Ready to Implement (Week 2-5)
- [ ] **Week 2**: Wizard 6-step components + layout
- [ ] **Week 3**: Backend API routes (orders, upload)
- [ ] **Week 4**: Stripe integration + checkout
- [ ] **Week 5**: Auth pages + dashboard + testing

## Quick Start

### 1. Environment Setup
```bash
cp .env.example .env.local
# Fill in your credentials
```

### 2. Database Setup
In Supabase Dashboard → SQL Editor, run these in order:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_seed_data.sql`

### 3. Run
```bash
npm install
npm run dev
# Visit http://localhost:3000
```

## Project Files Created

### Core Types & Validation
- `lib/types/index.ts` - All TypeScript types
- `lib/validation/schemas.ts` - Zod schemas for all 6 steps

### Database
- `supabase/migrations/001_initial_schema.sql` - Tables (9 total)
- `supabase/migrations/002_rls_policies.sql` - Row Level Security
- `supabase/migrations/003_seed_data.sql` - Portrait styles + backgrounds

### Configuration
- `lib/supabase/client.ts` - Supabase client
- `lib/constants/pricing.ts` - Pricing calculations
- `lib/hooks/useWizard.ts` - Zustand store
- `providers/RootProvider.tsx` - Auth context provider

### Pages
- `app/page.tsx` - Landing page (hero + features)
- `app/layout.tsx` - Root layout with GA4 + reCAPTCHA

### Config Files
- `.env.example` - Template for environment variables
- `package.json` - Dependencies installed

## Next Steps (Implementation Order)

### Priority 1: Wizard Components
Create these in `components/wizard/`:
```tsx
// Step1StyleSelector.tsx - Show 4 styles as cards
// Step2BodyBuilder.tsx - Skin tone, clothing, accessories
// Step3BackgroundPicker.tsx - 6-10 backgrounds grid
// Step4PeopleSelector.tsx - Dynamic form for 1-4 people
// Step5DetailsForm.tsx - Mood, expression, special requests
// Step6ImageUpload.tsx - Drag & drop with validation
```

### Priority 2: Wizard Layout
```tsx
// app/studio/layout.tsx - Progress bar + navigation
// app/studio/[step]/page.tsx - Router to current step
```

### Priority 3: API Routes
```tsx
// app/api/orders/route.ts - POST (create), GET (list)
// app/api/orders/[id]/route.ts - PATCH (update state)
// app/api/orders/[id]/submit/route.ts - PUT (checkout prep)
// app/api/upload/route.ts - Image upload + validation
// app/api/webhooks/stripe/route.ts - Payment webhook
```

### Priority 4: Stripe
```tsx
// components/checkout/CheckoutForm.tsx - Stripe Elements
// lib/stripe/client.ts - Stripe.js init
// lib/stripe/server.ts - PaymentIntent creation
```

## Architecture

### Data Flow
```
Step 1-5: Update Zustand store + PATCH /api/orders/[id]
Step 6: Upload images to POST /api/upload
Checkout: Create PaymentIntent via PUT /api/orders/[id]/submit
Payment: Webhook updates order.status = 'paid' + sends email
```

### Database
- **orders** - Main entity with wizard_state JSONB
- **order_images** - Uploaded reference photos
- **portrait_styles** - 4 cartoon styles (seed data included)
- **backgrounds** - 24+ backgrounds (seed data included)
- **transactions** - Stripe payment sync
- **RLS enabled** - Users see only their own orders

### Pricing
```
$15 × people count (torso) OR
$25 × people count (full body)
+ $15 (if background selected)
+ 10% tax
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `lib/types/index.ts` | All TypeScript types |
| `lib/hooks/useWizard.ts` | Zustand store for wizard state |
| `lib/constants/pricing.ts` | Price calculations |
| `lib/validation/schemas.ts` | Zod validation rules |
| `supabase/migrations/*` | Database schema |
| `app/page.tsx` | Landing page |
| `app/layout.tsx` | Root with analytics |
| `.env.example` | Environment template |

## Important: Credentials Needed

Before implementation, get these from:
- **NEXT_PUBLIC_SUPABASE_URL** - Supabase Settings → API
- **NEXT_PUBLIC_SUPABASE_ANON_KEY** - Supabase Settings → API
- **SUPABASE_SERVICE_ROLE_KEY** - Supabase Settings → API
- **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY** - Stripe Dashboard
- **STRIPE_SECRET_KEY** - Stripe Dashboard
- **NEXT_PUBLIC_RECAPTCHA_SITE_KEY** - Google reCAPTCHA Admin
- **RECAPTCHA_SECRET_KEY** - Google reCAPTCHA Admin
- **RESEND_API_KEY** - Resend Dashboard (for emails)

## Test Card for Stripe
- Number: `4242 4242 4242 4242`
- Exp: Any future date
- CVC: Any 3 digits

## Recommended Development Workflow

1. **Start dev server**: `npm run dev`
2. **Create Step1StyleSelector**: Build card-based style selector
3. **Create Step2-5 components**: Follow same pattern
4. **Create studio/layout.tsx**: Add progress bar + navigation
5. **Test form validation**: Use Zod schemas
6. **Build API routes**: Start with POST /api/orders
7. **Test with Stripe**: Use test card
8. **Add auth pages**: Login/signup
9. **Create dashboard**: Order history

## Performance Notes

- Use `next/image` for all images
- Compress images with Sharp in Edge Functions
- Lazy load components with dynamic imports
- Enable CSS minification
- Test Lighthouse score > 90

## Debugging Tips

- Check browser console for reCAPTCHA errors
- Use Supabase dashboard to view orders table
- Monitor Stripe dashboard for webhook events
- Check .env.local has all required variables
- Verify RLS policies in Supabase SQL Editor

## What's Not Included Yet

- Admin dashboard
- Email templates
- Image processing (Edge Functions)
- Authentication pages
- Testing suite
- Deployment config

These will be added in subsequent weeks based on priority.

---

**Status**: MVP Foundation Complete
**Ready for**: Week 2 (Wizard Components)
