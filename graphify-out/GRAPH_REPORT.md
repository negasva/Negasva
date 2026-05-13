# Graph Report - C:\Users\nvz9\Desktop\Claude\negasva  (2026-05-13)

## Corpus Check
- Corpus is ~20,907 words - fits in a single context window. You may not need a graph.

## Summary
- 377 nodes · 352 edges · 34 communities (30 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.9)
- Token cost: 1,500 input · 500 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Wizard State & Logic|Wizard State & Logic]]
- [[_COMMUNITY_Database & Auth|Database & Auth]]
- [[_COMMUNITY_Wizard State & Logic|Wizard State & Logic]]
- [[_COMMUNITY_Database & Auth|Database & Auth]]
- [[_COMMUNITY_Pricing & Payments|Pricing & Payments]]
- [[_COMMUNITY_Wizard State & Logic|Wizard State & Logic]]
- [[_COMMUNITY_Database & Auth|Database & Auth]]
- [[_COMMUNITY_Wizard State & Logic|Wizard State & Logic]]
- [[_COMMUNITY_Wizard State & Logic|Wizard State & Logic]]
- [[_COMMUNITY_Wizard State & Logic|Wizard State & Logic]]
- [[_COMMUNITY_Wizard State & Logic|Wizard State & Logic]]
- [[_COMMUNITY_Database & Auth|Database & Auth]]
- [[_COMMUNITY_Database & Auth|Database & Auth]]
- [[_COMMUNITY_Wizard State & Logic|Wizard State & Logic]]
- [[_COMMUNITY_Wizard State & Logic|Wizard State & Logic]]
- [[_COMMUNITY_Wizard State & Logic|Wizard State & Logic]]
- [[_COMMUNITY_Pricing & Payments|Pricing & Payments]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]

## God Nodes (most connected - your core abstractions)
1. `Quick Reference - Useful Commands & Code Snippets` - 17 edges
2. `NEGASVA - Cartoon Portrait Platform` - 13 edges
3. `Delivery Checklist - NEGASVA MVP Foundation` - 12 edges
4. `✅ What You're Getting` - 11 edges
5. `PROJECT STATUS - NEGASVA` - 11 edges
6. `🗂️ Files Delivered` - 10 edges
7. `Implementation Guide - Week 2+` - 10 edges
8. `Getting Started - NEGASVA` - 9 edges
9. `✅ What's Been Completed` - 9 edges
10. `Project Structure - NEGASVA` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Wizard Flow` --shares_data_with--> `Pricing System`  [INFERRED]
  IMPLEMENTATION_GUIDE.md → lib/constants/pricing.ts
- `Stripe Integration` --references--> `Pricing System`  [INFERRED]
  IMPLEMENTATION_GUIDE.md → lib/constants/pricing.ts
- `Negasva` --references--> `Supabase Backend`  [EXTRACTED]
  README.md → lib/supabase/client.ts
- `Wizard Flow` --references--> `Portrait Styles`  [EXTRACTED]
  IMPLEMENTATION_GUIDE.md → supabase/migrations/003_seed_data.sql
- `Wizard Flow` --implements--> `Wizard State Management`  [EXTRACTED]
  IMPLEMENTATION_GUIDE.md → lib/hooks/useWizard.ts

## Communities (34 total, 4 thin omitted)

### Community 0 - "Wizard State & Logic"
Cohesion: 0.06
Nodes (35): Already Configured, Before Going Live, 📋 Before You Start Implementation, 📊 Code Statistics, code:block10 (Database Schema:    595 lines SQL), code:block11 (✅ TypeScript:      100% type coverage), Common Questions, Database Setup (+27 more)

### Community 1 - "Database & Auth"
Cohesion: 0.06
Nodes (32): code:bash (# Development), code:typescript (// Client-side validation), code:typescript (// Execute reCAPTCHA on form submit), code:typescript (import { loadStripe } from '@stripe/js';), code:bash (# In .env.local (never commit!)), code:bash (# Check if dev server runs), code:bash (git status                    # Check changes), code:typescript (// State) (+24 more)

### Community 2 - "Wizard State & Logic"
Cohesion: 0.06
Nodes (30): Checkout Testing, code:tsx (// 1. User enters email + name), code:typescript (// 1. Verify webhook signature), code:tsx (// lib/supabase/queries.ts), code:tsx (export async function getBackgrounds() {), code:tsx (export async function createOrder(userId: string) {), code:tsx (const onSubmit = async (data: FormData) => {), code:tsx (const handleUpload = async (file: File) => {) (+22 more)

### Community 3 - "Database & Auth"
Cohesion: 0.06
Nodes (30): Before Push, code:block1 (negasva/), code:bash (npm run dev                    # Start dev server), code:bash (# Manual testing in browser), code:bash (npm run build                  # Ensure builds), code:block15 (Database:           595 SQL), code:block16 (Database:   Medium (9 tables, RLS, triggers)), code:block17 (Bundle Size:      ~200KB (with all dependencies)) (+22 more)

### Community 4 - "Pricing & Payments"
Cohesion: 0.07
Nodes (29): 1. Environment Setup, 2. Database Setup, 3. Run, Architecture, code:bash (cp .env.example .env.local), code:bash (npm install), code:block7 (Step 1-5: Update Zustand store + PATCH /api/orders/[id]), code:block8 ($15 × people count (torso) OR) (+21 more)

### Community 5 - "Wizard State & Logic"
Cohesion: 0.08
Nodes (25): code:block1 (Foundation Phase (Week 1):         ████████████████████ 100%), code:block10 (import { useWizard } from '@/lib/hooks/useWizard';), code:block11 (All tables exist with RLS enabled), code:block12 (app/), code:block13 ([ ] Create app/studio/layout.tsx (progress bar + nav)), code:block14 ([ ] lib/supabase/queries.ts), code:block15 ([ ] lib/stripe/client.ts), code:block22 (Database Migrations:       595 lines SQL) (+17 more)

### Community 7 - "Database & Auth"
Cohesion: 0.09
Nodes (21): 1️⃣ Supabase Database, 2️⃣ Environment Variables, 3️⃣ Run It, 3-Step Setup, Code Ready to Use, code:sql ([Contents of supabase/migrations/001_initial_schema.sql]), code:sql ([Contents of supabase/migrations/002_rls_policies.sql]), code:sql ([Contents of supabase/migrations/003_seed_data.sql]) (+13 more)

### Community 8 - "Wizard State & Logic"
Cohesion: 0.11
Nodes (19): code:block1 (✅ .env.example              - Template with all variables), code:block2 (✅ supabase/migrations/001_initial_schema.sql     - 595 lines), code:block3 (✅ lib/types/index.ts                   - 180+ types defined), code:block4 (✅ lib/validation/schemas.ts            - All 6 steps + auth), code:block5 (✅ lib/hooks/useWizard.ts              - Zustand store with l), code:block6 (✅ lib/supabase/client.ts              - Supabase initializat), code:block7 (✅ app/layout.tsx                      - Root with GA4 + reCA), code:block8 (✅ providers/RootProvider.tsx          - Auth context provide) (+11 more)

### Community 9 - "Wizard State & Logic"
Cohesion: 0.12
Nodes (17): 1. Project Setup, 2. Database & Schema, 3. Type System, 4. Validation & Forms, 5. State Management, 6. Pricing System, 7. Landing Page, 8. Integrations Ready (+9 more)

### Community 10 - "Wizard State & Logic"
Cohesion: 0.12
Nodes (16): code:tsx (export default function StudioLayout() {), code:tsx (// useWizard() → get currentStep), code:tsx (import { useWizard } from '@/lib/hooks/useWizard';), code:tsx (// GET /api/portrait-styles (or query Supabase directly)), code:tsx (// Query backgrounds WHERE is_active = true), code:tsx (// On upload:), Step 1: Create Wizard Layout, Step 1: Style Selector (+8 more)

### Community 11 - "Wizard State & Logic"
Cohesion: 0.15
Nodes (13): code:block16 (.env.example                          Environment template), code:block17 (supabase/migrations/001_initial_schema.sql    (440 lines)), code:block18 (lib/types/index.ts                    All TypeScript definit), code:block19 (lib/hooks/useWizard.ts                Zustand store (270 lin), code:block20 (app/page.tsx                          Landing page (250 line), code:block21 (README_NEGASVA.md                     Project overview), Core Configuration, Database (+5 more)

### Community 12 - "Database & Auth"
Cohesion: 0.15
Nodes (13): Authentication & Database, code:block10 (framer-motion), code:block11 (axios), code:block6 (@supabase/supabase-js), code:block7 (react-hook-form), code:block8 (zustand), code:block9 (stripe), Dependencies by Area (+5 more)

### Community 13 - "Database & Auth"
Cohesion: 0.18
Nodes (11): 10. Developer Experience, 1. Complete Project Setup, 2. Database (Supabase), 3. Type Safety, 4. Validation, 5. State Management, 6. UI Foundation, 7. Security & Analytics (+3 more)

### Community 14 - "Wizard State & Logic"
Cohesion: 0.22
Nodes (9): API: PATCH /api/orders/[id] (Update State), API: POST /api/orders (Create Order), API: POST /api/upload (Image Upload), API: PUT /api/orders/[id]/submit (Checkout Prep), code:typescript (// 1. Verify user + order), code:typescript (// GET: Return user's orders), code:typescript (// PATCH: Update wizard_state JSONB), code:typescript (// 1. Get FormData { file, order_id }) (+1 more)

### Community 15 - "Wizard State & Logic"
Cohesion: 0.22
Nodes (9): code:tsx (// Step1StyleSelector.tsx - Show 4 styles as cards), code:tsx (// app/studio/layout.tsx - Progress bar + navigation), code:tsx (// app/api/orders/route.ts - POST (create), GET (list)), code:tsx (// components/checkout/CheckoutForm.tsx - Stripe Elements), Next Steps (Implementation Order), Priority 1: Wizard Components, Priority 2: Wizard Layout, Priority 3: API Routes (+1 more)

### Community 16 - "Wizard State & Logic"
Cohesion: 0.29
Nodes (7): Negasva, Portrait Styles, Pricing System, Stripe Integration, Supabase Backend, Wizard Flow, Wizard State Management

### Community 18 - "Community 18"
Cohesion: 0.4
Nodes (4): code:bash (npm run dev), Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **182 isolated node(s):** `This is NOT the Next.js you know`, `1. Complete Project Setup`, `2. Database (Supabase)`, `3. Type Safety`, `4. Validation` (+177 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Delivery Checklist - NEGASVA MVP Foundation` connect `Wizard State & Logic` to `Wizard State & Logic`, `Database & Auth`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `Implementation Guide - Week 2+` connect `Wizard State & Logic` to `Wizard State & Logic`, `Wizard State & Logic`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `PROJECT STATUS - NEGASVA` connect `Wizard State & Logic` to `Wizard State & Logic`, `Wizard State & Logic`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `This is NOT the Next.js you know`, `1. Complete Project Setup`, `2. Database (Supabase)` to the rest of the system?**
  _182 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Wizard State & Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Database & Auth` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Wizard State & Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._