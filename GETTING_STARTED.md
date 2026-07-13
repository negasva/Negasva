# Getting Started - NEGASVA

## What's Done ✅

The foundation is complete and ready. Here's what's been built:

### Infrastructure
- ✅ Next.js 14 project with TypeScript + Tailwind CSS
- ✅ Supabase database with 9 tables + RLS security
- ✅ Type definitions for entire app
- ✅ Form validation (Zod) for all 6 wizard steps
- ✅ State management (Zustand) with persistence
- ✅ Landing page with hero, features, pricing
- ✅ Environment configuration template

### Database
- ✅ Tables: orders, profiles, images, styles, backgrounds, transactions, rate limits
- ✅ Security: Row Level Security on all tables
- ✅ Seed data: 4 cartoon styles + 24 backgrounds
- ✅ Triggers: Auto-create profile on signup, auto-update timestamps

### Code Ready to Use
- `lib/types/index.ts` - All TypeScript types
- `lib/hooks/useWizard.ts` - Zustand store (import and use)
- `lib/constants/pricing.ts` - Price calculations
- `lib/validation/schemas.ts` - Zod validation
- `app/page.tsx` - Beautiful landing page

## 3-Step Setup

### 1️⃣ Supabase Database

Go to https://app.supabase.com → Choose your project → SQL Editor

Copy-paste and run these **in order**:

**Migration 1: Tables**
```sql
[Contents of supabase/migrations/001_initial_schema.sql]
```

**Migration 2: Security**
```sql
[Contents of supabase/migrations/002_rls_policies.sql]
```

**Migration 3: Seed Data**
```sql
[Contents of supabase/migrations/003_seed_data.sql]
```

### 2️⃣ Environment Variables

Create `.env.local`:

```bash
# Supabase (from Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# PayPal (from https://developer.paypal.com)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
PAYPAL_SECRET=...
PAYPAL_WEBHOOK_ID=...

# Mercado Pago (from https://www.mercadopago.com/developers)
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=...
MERCADOPAGO_ACCESS_TOKEN=...
MERCADOPAGO_WEBHOOK_SECRET=...

# Printful (from https://www.printful.com)
PRINTFUL_API_KEY=...

# Google reCAPTCHA v3 (from https://www.google.com/recaptcha/admin)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Le...
RECAPTCHA_SECRET_KEY=6Le...

# Resend Email (from https://resend.com)
RESEND_API_KEY=re_...

# Upstash Redis (rate limiting, from https://upstash.com)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Google Analytics (optional, from https://analytics.google.com)
NEXT_PUBLIC_GA_ID=G-...
```

### 3️⃣ Run It

```bash
npm install
npm run dev
```

Visit **http://localhost:3000** ✅

---

## What's Next?

Read **IMPLEMENTATION_GUIDE.md** for exact instructions on:

1. **Week 2**: Build the 6-step wizard components
2. **Week 3**: Create backend API routes
3. **Week 4**: Integrate PayPal + Mercado Pago payments

Each step has code examples and testing instructions.

---

## Quick Commands

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run test      # Run tests (when added)
npm run lint      # Check code
```

---

## Key Files

| File | Contains |
|------|----------|
| `lib/types/index.ts` | All TypeScript types |
| `lib/hooks/useWizard.ts` | State management store |
| `lib/constants/pricing.ts` | Price calculations |
| `lib/validation/schemas.ts` | Form validation rules |
| `supabase/migrations/` | Database schema |
| `app/page.tsx` | Landing page |

---

## Troubleshooting

**"Missing environment variables"**
→ Make sure `.env.local` has all values from credentials

**"Database error"**
→ Run migrations in SQL Editor in order (001, 002, 003)

**reCAPTCHA not loading**
→ Verify NEXT_PUBLIC_RECAPTCHA_SITE_KEY in .env.local

**Can't import Supabase**
→ Run `npm install` - all packages are already in package.json

---

## Test Card for PayPal (sandbox)
- **Number**: 4032 0324 5074 5013
- **Expiry**: Any future date
- **CVC**: Any 3 digits

---

## Next: Implementation

1. Follow **IMPLEMENTATION_GUIDE.md**
2. Start with Week 2 (Wizard components)
3. Test as you build
4. Reach out if issues!

Happy coding! 🚀
