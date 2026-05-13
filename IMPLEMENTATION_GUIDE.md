# Implementation Guide - Week 2+

This guide shows exactly what to build next and in what order.

## Current Status
✅ **Foundation phase complete**
- Database schema ready
- Types defined
- Validation schemas created
- Zustand store configured
- Landing page done

🚀 **Next: Wizard 6-step UI**

---

## Week 2: Wizard Components & Layout

### Step 1: Create Wizard Layout

File: `app/studio/layout.tsx`

Features:
- Progress stepper (visual: [✓] [●] [ ] [ ] [ ] [ ])
- Step labels and numbers
- Back/Next buttons
- Layout wrapper for all step pages

```tsx
export default function StudioLayout() {
  // - Show progress bar at top
  // - Render {children}
  // - Show Back/Next buttons at bottom
  // - Prevent progress > current step
}
```

### Step 2: Create Router Page

File: `app/studio/page.tsx`

Purpose: Redirect to current step based on Zustand store

```tsx
// useWizard() → get currentStep
// if not authenticated → redirect to /login
// if no orderId → POST /api/orders first
// redirect to `/studio/step-${step}`
```

### Step 3-8: Create 6 Step Components

Create directory: `components/wizard/`

Each component pattern:
```tsx
import { useWizard } from '@/lib/hooks/useWizard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function Step[N]Component() {
  const wizard = useWizard();
  const form = useForm({
    resolver: zodResolver(Step[N]Schema),
    defaultValues: { /* from wizard store */ }
  });

  const onSubmit = async (data) => {
    // Update Zustand
    // PATCH /api/orders/[id]
    // wizard.setStep([N+1])
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
      <button>Next</button>
    </form>
  );
}
```

#### Step 1: Style Selector

File: `components/wizard/Step1StyleSelector.tsx`

Features:
- Grid of 4 style cards (Rick & Morty, Gravity Falls, Simpsons, Fairly OddParents)
- Large images (400x300px minimum)
- Click to select
- Show checkmark on selected
- Don't allow Next without selection

Data to fetch:
```tsx
// GET /api/portrait-styles (or query Supabase directly)
// SELECT * FROM portrait_styles WHERE is_active = true
```

#### Step 2: Body Builder

File: `components/wizard/Step2BodyBuilder.tsx`

Form fields:
- Body type toggle (full_body / torso_only) - shows price difference
- Skin tone selector (6 color swatches: A, B, C, D, E, F)
- Clothing color picker
- Accessories checkboxes (glasses, hat, necklace, rings)

#### Step 3: Background Picker

File: `components/wizard/Step3BackgroundPicker.tsx`

Features:
- Grid of background thumbnails (6-10 per style)
- Click to select
- Show name on hover
- Option to customize (textarea for custom bg description)

Data to fetch:
```tsx
// Query backgrounds WHERE is_active = true
// Filter by selected style (optional)
```

#### Step 4: People Selector

File: `components/wizard/Step4PeopleSelector.tsx`

Features:
- Dynamic form: Add/Remove people (1-4)
- For each person:
  - Name input
  - Role select (self, spouse, child, parent, friend, other)
  - Description textarea (appearance, age, etc.)
- Show real-time price calculation
- Icon counter showing filled slots

#### Step 5: Details Form

File: `components/wizard/Step5DetailsForm.tsx`

Form fields:
- Mood select (happy, serious, playful, romantic, peaceful, adventurous)
- Expression radio buttons (smiling, neutral, laughing)
- Accessories checkboxes (wedding ring, watch, tattoo, glasses)
- Special requests textarea (max 500 chars)

#### Step 6: Image Upload

File: `components/wizard/Step6ImageUpload.tsx`

Features:
- Drag & drop zone
- File size validation (max 5MB)
- Format validation (jpg, png, webp only)
- Show uploads progress bar
- Display thumbnail previews
- Remove individual images
- Show required: 2+ images minimum

Form handling:
```tsx
// On upload:
// 1. Client-side validate (size, format, dimensions)
// 2. Compress if needed (browser-image-compression)
// 3. POST /api/upload
// 4. Get back URL
// 5. Store in Zustand
// 6. PATCH /api/orders/[id]
```

---

## Week 3: API Routes & Backend

### API: POST /api/orders (Create Order)

File: `app/api/orders/route.ts`

```typescript
// GET: Return user's orders
// POST: Create new draft order
//   1. Verify user is authenticated
//   2. Create order with status='draft'
//   3. Return { orderId, status: 'draft' }
```

### API: PATCH /api/orders/[id] (Update State)

File: `app/api/orders/[id]/route.ts`

```typescript
// PATCH: Update wizard_state JSONB
//   1. Get user auth
//   2. Verify user owns order
//   3. Validate wizard_state (Zod)
//   4. Update DB
//   5. Return updated order
```

### API: POST /api/upload (Image Upload)

File: `app/api/upload/route.ts`

```typescript
// 1. Get FormData { file, order_id }
// 2. Validate:
//    - File size < 5MB
//    - MIME type is image/*
//    - User owns order
// 3. Generate filename: {order_id}/{uuid}-{original}
// 4. Get signed URL for upload
// 5. Client uploads to Storage
// 6. Create order_images record
// 7. Trigger process-portrait-image Edge Function
// 8. Return processed URLs
```

### API: PUT /api/orders/[id]/submit (Checkout Prep)

File: `app/api/orders/[id]/submit/route.ts`

```typescript
// 1. Verify user + order
// 2. Validate wizard_state is complete:
//    - All required fields filled
//    - At least 2 images uploaded
// 3. Calculate price:
//    - base = peopleCount × pricePerPerson
//    - if background: + $15
//    - tax = subtotal × 0.10
// 4. Create Stripe PaymentIntent
// 5. Update order.status = 'payment_pending'
// 6. Return { order, clientSecret, totalPrice }
```

---

## Week 4: Stripe Integration

### Component: CheckoutForm

File: `components/checkout/CheckoutForm.tsx`

Features:
- Order summary (read-only display)
- Email input
- First/Last name inputs
- Instagram username (optional)
- Stripe CardElement
- Total price display
- Submit button

Process:
```tsx
// 1. User enters email + name
// 2. On submit:
//    a. Execute reCAPTCHA
//    b. Validate form (Zod)
//    c. Call confirmPayment(clientSecret)
//    d. If successful → redirect to /studio/success
//    e. If failed → show error message
```

### Webhook: POST /api/webhooks/stripe

File: `app/api/webhooks/stripe/route.ts`

```typescript
// 1. Verify webhook signature
// 2. Listen to events:
//    - payment_intent.succeeded
//    - payment_intent.payment_failed
// 3. On success:
//    a. Create/update transaction record
//    b. Update order.status = 'paid'
//    c. Trigger send-order-email Edge Function
//    d. Create analytics_event
// 4. Return 200 OK
```

---

## File Creation Checklist

### Week 2 (Wizard Components)
- [ ] `app/studio/layout.tsx` - Wizard layout
- [ ] `app/studio/page.tsx` - Router
- [ ] `components/wizard/Step1StyleSelector.tsx`
- [ ] `components/wizard/Step2BodyBuilder.tsx`
- [ ] `components/wizard/Step3BackgroundPicker.tsx`
- [ ] `components/wizard/Step4PeopleSelector.tsx`
- [ ] `components/wizard/Step5DetailsForm.tsx`
- [ ] `components/wizard/Step6ImageUpload.tsx`

### Week 3 (APIs)
- [ ] `app/api/orders/route.ts`
- [ ] `app/api/orders/[id]/route.ts`
- [ ] `app/api/upload/route.ts`
- [ ] `app/api/orders/[id]/submit/route.ts`
- [ ] `lib/supabase/queries.ts`
- [ ] `lib/supabase/mutations.ts`

### Week 4 (Stripe)
- [ ] `components/checkout/CheckoutForm.tsx`
- [ ] `lib/stripe/client.ts`
- [ ] `lib/stripe/server.ts`
- [ ] `app/api/webhooks/stripe/route.ts`
- [ ] `app/studio/success/page.tsx`
- [ ] `app/studio/error/page.tsx`

---

## Database Query Examples

Once API routes are created, you'll need these helpers:

### Get Portrait Styles
```tsx
// lib/supabase/queries.ts
export async function getPortraitStyles() {
  const { data, error } = await supabase
    .from('portrait_styles')
    .select('*')
    .eq('is_active', true);
  return data;
}
```

### Get Backgrounds
```tsx
export async function getBackgrounds() {
  const { data, error } = await supabase
    .from('backgrounds')
    .select('*')
    .eq('is_active', true);
  return data;
}
```

### Create Order
```tsx
export async function createOrder(userId: string) {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      status: 'draft',
      wizard_state: {}
    })
    .select()
    .single();
  return data;
}
```

### Update Order State
```tsx
export async function updateOrderState(
  orderId: string,
  wizardState: WizardState
) {
  const { data, error } = await supabase
    .from('orders')
    .update({ wizard_state: wizardState })
    .eq('id', orderId)
    .select()
    .single();
  return data;
}
```

---

## Testing as You Build

### Step 1 Testing
- [ ] Styles load correctly
- [ ] Can select style
- [ ] Next button enabled only after selection
- [ ] Zustand store updates
- [ ] PATCH /api/orders/[id] succeeds

### Step 2 Testing
- [ ] Form fields render
- [ ] Can change values
- [ ] Form validation works
- [ ] Price updates on body type change

### Step 6 Testing (Critical)
- [ ] Can drag & drop files
- [ ] File size validation works
- [ ] Format validation works
- [ ] Progress bar shows upload status
- [ ] Images appear as thumbnails
- [ ] Can remove images
- [ ] At least 2 images required to continue

### Checkout Testing
- [ ] OrderSummary shows correct data
- [ ] Can enter email/name
- [ ] Stripe CardElement loads
- [ ] Price calculation correct
- [ ] Submission succeeds with test card 4242 4242 4242 4242

---

## Common Patterns to Follow

### Form Submission (All Steps)
```tsx
const onSubmit = async (data: FormData) => {
  try {
    setLoading(true);
    
    // Update store
    wizard.setBodyType(data.bodyType);
    
    // Update DB
    const response = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ wizardState: wizard.getState() })
    });
    
    if (!response.ok) throw new Error('Failed');
    
    // Move to next step
    wizard.setStep(currentStep + 1);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

### Image Upload Pattern
```tsx
const handleUpload = async (file: File) => {
  // 1. Validate
  if (file.size > 5 * 1024 * 1024) {
    setError('Max 5MB');
    return;
  }
  
  // 2. Compress if needed
  const compressed = await imageCompression(file, { maxSizeMB: 5 });
  
  // 3. Upload
  const formData = new FormData();
  formData.append('file', compressed);
  formData.append('order_id', orderId);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });
  
  const { url } = await response.json();
  wizard.addImageUrl(url);
};
```

---

## Next: Reach Out When Ready

Once you complete Week 2 (Wizard components), we'll:
1. Review and integrate with API routes
2. Add animations with Framer Motion
3. Implement error boundaries
4. Add loading states
5. Optimize performance

Keep the wizard store synced with the database so users can resume if they close the browser.

Good luck! 🚀
