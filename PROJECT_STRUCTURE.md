# Project Structure - NEGASVA

## 📁 File Tree (What's Been Created)

```
negasva/
├── 📄 Configuration Files
│   ├── .env.example                    ✅ Template for secrets
│   ├── package.json                    ✅ 30+ dependencies installed
│   ├── tsconfig.json                   ✅ TypeScript config
│   ├── tailwind.config.js              ✅ Tailwind CSS config
│   ├── next.config.js                  ✅ Next.js config
│   └── .gitignore                      ✅ Git ignore patterns
│
├── 📚 Documentation
│   ├── README_NEGASVA.md               ✅ Project overview
│   ├── GETTING_STARTED.md              ✅ 3-step setup guide
│   ├── IMPLEMENTATION_GUIDE.md         ✅ Week-by-week detailed plan
│   ├── PROJECT_STATUS.md               ✅ Progress & completion status
│   ├── PROJECT_STRUCTURE.md            ✅ This file
│   └── QUICK_REFERENCE.md              ✅ Code snippets & commands
│
├── 📂 app/ (Next.js App Router)
│   ├── layout.tsx                      ✅ Root layout (GA4 + reCAPTCHA)
│   ├── page.tsx                        ✅ Landing page
│   ├── globals.css                     ⏳ (auto-generated)
│   ├── (auth)/ (NOT CREATED YET)
│   │   ├── login/page.tsx              ⏳ Week 4
│   │   ├── signup/page.tsx             ⏳ Week 4
│   │   ├── verify-email/page.tsx       ⏳ Week 4
│   │   └── forgot-password/page.tsx    ⏳ Week 4
│   │
│   ├── (dashboard)/ (NOT CREATED YET)
│   │   ├── layout.tsx                  ⏳ Protected layout
│   │   ├── orders/page.tsx             ⏳ Order history
│   │   ├── orders/[id]/page.tsx        ⏳ Order detail
│   │   └── profile/page.tsx            ⏳ Settings
│   │
│   ├── studio/ (⏳ WEEK 2 - START HERE)
│   │   ├── layout.tsx                  ⏳ Wizard layout + progress bar
│   │   ├── page.tsx                    ⏳ Step router
│   │   ├── step-1-style/
│   │   │   └── page.tsx                ⏳ Step 1 component
│   │   ├── step-2-body/
│   │   │   └── page.tsx                ⏳ Step 2 component
│   │   ├── step-3-background/
│   │   │   └── page.tsx                ⏳ Step 3 component
│   │   ├── step-4-people/
│   │   │   └── page.tsx                ⏳ Step 4 component
│   │   ├── step-5-details/
│   │   │   └── page.tsx                ⏳ Step 5 component
│   │   ├── step-6-review/
│   │   │   └── page.tsx                ⏳ Step 6 component
│   │   ├── checkout/
│   │   │   ├── page.tsx                ⏳ Checkout page
│   │   │   └── success/page.tsx        ⏳ Success page
│   │   └── error/page.tsx              ⏳ Error page
│   │
│   └── api/ (⏳ WEEK 3)
│       ├── auth/
│       │   └── callback/route.ts       ⏳ OAuth callback
│       ├── orders/
│       │   ├── route.ts                ⏳ POST/GET orders
│       │   ├── [id]/
│       │   │   ├── route.ts            ⏳ PATCH order
│       │   │   └── submit/route.ts     ⏳ PUT submit to checkout
│       ├── upload/
│       │   └── route.ts                ⏳ POST image upload
│       ├── webhooks/
│       │   └── stripe/route.ts         ⏳ Stripe webhook handler
│       ├── verify-recaptcha/
│       │   └── route.ts                ⏳ reCAPTCHA verification
│       └── health/
│           └── route.ts                ⏳ Health check
│
├── 📂 lib/ (Utilities & Helpers)
│   ├── supabase/
│   │   ├── client.ts                   ✅ Supabase initialization
│   │   ├── queries.ts                  ⏳ SELECT helpers
│   │   ├── mutations.ts                ⏳ INSERT/UPDATE helpers
│   │   └── admin.ts                    ⏳ Admin-level access
│   │
│   ├── stripe/
│   │   ├── client.ts                   ⏳ Stripe.js init
│   │   ├── server.ts                   ⏳ PaymentIntent creation
│   │   └── webhooks.ts                 ⏳ Event handlers
│   │
│   ├── validation/
│   │   ├── schemas.ts                  ✅ Zod schemas (all 6 steps)
│   │   └── rules.ts                    ⏳ Custom validators
│   │
│   ├── security/
│   │   ├── rate-limit.ts               ⏳ Rate limiting logic
│   │   ├── recaptcha.ts                ⏳ reCAPTCHA validation
│   │   └── csrf.ts                     ⏳ CSRF tokens
│   │
│   ├── hooks/
│   │   ├── useWizard.ts                ✅ Zustand store
│   │   ├── useAuth.ts                  ⏳ Auth context
│   │   ├── useCart.ts                  ⏳ (not needed for MVP)
│   │   └── useOrder.ts                 ⏳ Order queries
│   │
│   ├── types/
│   │   ├── index.ts                    ✅ All TypeScript types
│   │   ├── database.ts                 ⏳ Auto-generated from schema
│   │   ├── wizard.ts                   ⏳ Form shapes
│   │   └── stripe.ts                   ⏳ Stripe event types
│   │
│   ├── utils/
│   │   ├── cn.ts                       ⏳ Tailwind classNames
│   │   ├── currency.ts                 ⏳ Price formatting
│   │   ├── dates.ts                    ⏳ Date utilities
│   │   ├── image.ts                    ⏳ Image processing
│   │   └── storage.ts                  ⏳ Supabase Storage helpers
│   │
│   └── constants/
│       ├── pricing.ts                  ✅ Price calculations
│       ├── styles.ts                   ⏳ Portrait styles config
│       └── errors.ts                   ⏳ Error messages
│
├── 📂 components/ (React Components)
│   ├── wizard/
│   │   ├── WizardProgress.tsx          ⏳ Progress stepper
│   │   ├── WizardNavigation.tsx        ⏳ Prev/Next buttons
│   │   ├── PortraitPreview.tsx         ⏳ Live preview (sidebar)
│   │   ├── Step1StyleSelector.tsx      ⏳ Style cards
│   │   ├── Step2BodyBuilder.tsx        ⏳ Body customization
│   │   ├── Step3BackgroundPicker.tsx   ⏳ Background grid
│   │   ├── Step4PeopleSelector.tsx     ⏳ Dynamic people form
│   │   ├── Step5DetailsForm.tsx        ⏳ Details & mood
│   │   └── Step6ImageUpload.tsx        ⏳ Drag & drop upload
│   │
│   ├── checkout/
│   │   ├── CheckoutForm.tsx            ⏳ Stripe Elements form
│   │   ├── OrderSummary.tsx            ⏳ Order preview
│   │   └── PaymentStatus.tsx           ⏳ Success/error display
│   │
│   ├── layouts/
│   │   ├── RootLayout.tsx              ⏳ Root wrapper
│   │   ├── AuthLayout.tsx              ⏳ Auth pages wrapper
│   │   ├── DashboardLayout.tsx         ⏳ Dashboard wrapper
│   │   └── WizardLayout.tsx            ⏳ Wizard pages wrapper
│   │
│   ├── auth/
│   │   ├── LoginForm.tsx               ⏳ Login form
│   │   ├── SignupForm.tsx              ⏳ Signup form
│   │   ├── VerifyEmailForm.tsx         ⏳ Email verification
│   │   └── AuthGuard.tsx               ⏳ Protected route wrapper
│   │
│   ├── dashboard/
│   │   ├── OrderCard.tsx               ⏳ Order card component
│   │   ├── OrderList.tsx               ⏳ Orders list
│   │   └── ProfileForm.tsx             ⏳ Profile settings
│   │
│   └── common/
│       ├── Button.tsx                  ⏳ Reusable button
│       ├── Input.tsx                   ⏳ Reusable input
│       ├── Modal.tsx                   ⏳ Modal component
│       ├── Toast.tsx                   ⏳ Notifications
│       └── ErrorBoundary.tsx           ⏳ Error handler
│
├── 📂 providers/ (Context Providers)
│   ├── RootProvider.tsx                ✅ Supabase Auth context
│   ├── AuthProvider.tsx                ⏳ Auth state
│   ├── WizardProvider.tsx              ⏳ Wizard store provider
│   └── QueryProvider.tsx               ⏳ TanStack Query
│
├── 📂 supabase/ (Database)
│   ├── migrations/
│   │   ├── 001_initial_schema.sql      ✅ Tables (9 total)
│   │   ├── 002_rls_policies.sql        ✅ Row Level Security
│   │   └── 003_seed_data.sql           ✅ Portrait styles + backgrounds
│   │
│   └── functions/ (Deno Edge Functions)
│       ├── process-portrait-image/
│       │   ├── index.ts                ⏳ Image processing
│       │   └── deno.json
│       ├── send-order-email/
│       │   ├── index.ts                ⏳ Email sending
│       │   └── deno.json
│       └── process-refund/
│           ├── index.ts                ⏳ Refund handling
│           └── deno.json
│
├── 📂 tests/ (Testing)
│   ├── unit/
│   │   ├── validation.test.ts          ⏳ Schema validation tests
│   │   ├── security.test.ts            ⏳ Security tests
│   │   └── utils.test.ts               ⏳ Utility tests
│   │
│   ├── integration/
│   │   ├── wizard-flow.test.ts         ⏳ Wizard flow E2E
│   │   ├── checkout.test.ts            ⏳ Checkout E2E
│   │   └── auth.test.ts                ⏳ Auth flow E2E
│   │
│   └── e2e/
│       └── complete-purchase.spec.ts   ⏳ Full user journey
│
└── 📂 public/ (Static Assets)
    ├── images/
    │   ├── styles/
    │   │   ├── rick-and-morty.jpg      ⏳ (need to add)
    │   │   ├── gravity-falls.jpg       ⏳ (need to add)
    │   │   ├── simpsons.jpg            ⏳ (need to add)
    │   │   └── fairly-odd-parents.jpg  ⏳ (need to add)
    │   └── bg/
    │       └── (24 background images)  ⏳ (need to add)
    └── svg/                            ⏳ Icons & logos
```

---

## 📊 Progress Summary

### ✅ Completed Files
```
Configuration:         5 files
Type Definitions:      1 file (180 lines)
Validation:            1 file (105 lines)
Database:              3 SQL migrations
State Management:      1 file (270 lines)
Providers:             1 file
Pages:                 2 files
Documentation:         6 files

TOTAL COMPLETE:        ~20 files / ~1,550 lines
```

### 🚧 To Build (in order)

| Week | Item | Files | Est. Lines |
|------|------|-------|-----------|
| 2 | Wizard UI (6 steps) | 8 | 800 |
| 2 | Studio layout | 2 | 200 |
| 3 | API routes | 5 | 600 |
| 3 | DB helpers | 2 | 300 |
| 4 | Stripe integration | 3 | 400 |
| 4 | Auth pages | 4 | 500 |
| 5 | Dashboard | 4 | 400 |
| 5 | Tests | 8 | 800 |

**Estimated Total**: 4,000-4,500 lines of code

---

## 🎯 Starting Points

### Week 2: Start Here
```
1. Create app/studio/layout.tsx
   ├── Show progress bar
   ├── Render children
   └── Add navigation buttons

2. Create app/studio/page.tsx
   ├── Redirect to current step
   └── Create order if needed

3. Create 6 components in components/wizard/
   ├── Step1StyleSelector
   ├── Step2BodyBuilder
   ├── Step3BackgroundPicker
   ├── Step4PeopleSelector
   ├── Step5DetailsForm
   └── Step6ImageUpload
```

### Week 3: Backend
```
1. Create lib/supabase/queries.ts
   └── Database SELECT helpers

2. Create lib/supabase/mutations.ts
   └── Database INSERT/UPDATE helpers

3. Create 4 API routes
   ├── POST /api/orders
   ├── PATCH /api/orders/[id]
   ├── POST /api/upload
   └── PUT /api/orders/[id]/submit
```

### Week 4: Payments
```
1. Create lib/stripe/client.ts & server.ts
2. Create components/checkout/CheckoutForm.tsx
3. Create POST /api/webhooks/stripe
4. Create success/error pages
```

---

## 🔍 Quick Navigation

| Question | File to Read |
|----------|--------------|
| "How do I start?" | GETTING_STARTED.md |
| "What's been done?" | PROJECT_STATUS.md |
| "What do I build next?" | IMPLEMENTATION_GUIDE.md |
| "Show me code snippets" | QUICK_REFERENCE.md |
| "How is this organized?" | PROJECT_STRUCTURE.md (this file) |
| "TypeScript types?" | lib/types/index.ts |
| "Form validation?" | lib/validation/schemas.ts |
| "Price calculations?" | lib/constants/pricing.ts |
| "Database schema?" | supabase/migrations/001_*.sql |

---

## Dependencies by Area

### Authentication & Database
```
@supabase/supabase-js
@supabase/auth-helpers-nextjs
@supabase/auth-helpers-react
```

### Forms & Validation
```
react-hook-form
zod
@hookform/resolvers
```

### State Management
```
zustand
```

### Payments
```
stripe
@stripe/react-stripe-js
```

### UI & Animation
```
framer-motion
tailwindcss (CSS)
```

### Utilities
```
axios
dotenv
sharp (image processing)
browser-image-compression
```

---

## Development Workflow

### Daily Workflow
```bash
npm run dev                    # Start dev server
# Edit components
# Test changes live
npm run lint                   # Check code
git commit -m "description"    # Commit changes
```

### Testing Workflow
```bash
# Manual testing in browser
# Console: check for errors
# Supabase dashboard: check data
# Stripe dashboard: check webhook events
```

### Before Push
```bash
npm run build                  # Ensure builds
npm run lint                   # No lint errors
git diff                       # Review changes
git push origin main           # Push to GitHub
```

---

## Key Metrics

### Lines of Code
```
Database:           595 SQL
Type System:        180 TS
Validation:         105 Zod
State Management:   270 TS
UI/Pages:           250+ React
Total Now:          ~1,550 lines

Estimated Final:    ~4,500 lines
```

### Complexity
```
Database:   Medium (9 tables, RLS, triggers)
API:        Medium (5 routes, validation)
Forms:      Medium (6 steps, Zod validation)
Payments:   Medium (Stripe integration)
Overall:    Medium (good structure, clear patterns)
```

### Performance
```
Bundle Size:      ~200KB (with all dependencies)
Lighthouse Score: TBD (target: >90)
Database Queries: Optimized with indexes
Images:           Optimized with next/image
```

---

## What's Missing (OK for MVP)

- ❌ Admin dashboard (Phase 2)
- ❌ Email templates (have Resend API key ready)
- ❌ Image processing with Sharp (Edge Functions)
- ❌ Advanced analytics (GA4 script loaded, events pending)
- ❌ Deployment (Vercel ready, just need to push)
- ❌ Unit tests (todo: Vitest configured)
- ❌ E2E tests (todo: Playwright setup)

**All critical functionality is ready to build.**

---

**Last Updated**: April 2024
**Status**: Foundation Complete → Ready for Week 2

Navigate using the files listed above. Good luck! 🚀
