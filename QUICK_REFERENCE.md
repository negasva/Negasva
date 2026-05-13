# Quick Reference - Useful Commands & Code Snippets

## Commands

```bash
# Development
npm run dev           # Start dev server (http://localhost:3000)
npm run build         # Production build
npm run lint          # Check code

# Supabase (if CLI installed)
supabase status       # Check connection
supabase db push      # Push migrations
```

## Import Common Modules

```typescript
// State
import { useWizard } from '@/lib/hooks/useWizard';

// Validation
import { Step1StyleSchema, CheckoutSchema } from '@/lib/validation/schemas';

// Types
import type { Order, WizardState, Person } from '@/lib/types';

// Supabase
import { supabase } from '@/lib/supabase/client';

// Pricing
import { calculateOrderPrice, formatPrice } from '@/lib/constants/pricing';

// Forms
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
```

## Zustand Store Usage

```typescript
// Get all state
const wizard = useWizard();

// Get specific values
const { currentStep, styleId, people } = useWizard();

// Update state
wizard.setStyle('rick-morty', 'Rick and Morty');
wizard.setStep(2);
wizard.setPeople([{ id: '1', name: 'John', role: 'self', description: 'Me' }]);
wizard.addImageUrl('https://...');

// Reset
wizard.reset();
```

## Form Pattern (All 6 Steps)

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Step2BodySchema } from '@/lib/validation/schemas';
import { useWizard } from '@/lib/hooks/useWizard';

export function Step2Component() {
  const wizard = useWizard();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(Step2BodySchema),
    defaultValues: {
      bodyType: wizard.bodyType,
      skinTone: wizard.skinTone,
    },
  });

  const onSubmit = async (data) => {
    // Update Zustand
    wizard.setBodyType(data.bodyType);
    wizard.setSkinTone(data.skinTone);

    // Update DB
    await fetch(`/api/orders/${wizard.orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ wizardState: wizard }),
    });

    // Move next
    wizard.setStep(3);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
      <button type="submit">Next</button>
    </form>
  );
}
```

## Fetch Patterns

```typescript
// GET orders
const response = await fetch('/api/orders');
const orders = await response.json();

// CREATE order
const response = await fetch('/api/orders', {
  method: 'POST',
});
const { orderId } = await response.json();

// UPDATE order state
const response = await fetch(`/api/orders/${orderId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ wizardState }),
});

// UPLOAD image
const formData = new FormData();
formData.append('file', file);
formData.append('order_id', orderId);
const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});
const { url } = await response.json();

// SUBMIT for checkout
const response = await fetch(`/api/orders/${orderId}/submit`, {
  method: 'PUT',
});
const { clientSecret, totalPrice } = await response.json();
```

## Database Queries (Supabase)

```typescript
import { supabase } from '@/lib/supabase/client';

// GET portrait styles
const { data: styles } = await supabase
  .from('portrait_styles')
  .select('*')
  .eq('is_active', true);

// GET backgrounds
const { data: backgrounds } = await supabase
  .from('backgrounds')
  .select('*')
  .eq('is_active', true);

// GET user's orders
const { data: orders } = await supabase
  .from('orders')
  .select('*')
  .eq('user_id', userId);

// GET single order
const { data: order } = await supabase
  .from('orders')
  .select('*')
  .eq('id', orderId)
  .single();

// INSERT order image
const { data: image } = await supabase
  .from('order_images')
  .insert({
    order_id: orderId,
    storage_path: `orders/${orderId}/image.jpg`,
  })
  .select()
  .single();
```

## Tailwind Classes (Common)

```jsx
// Layout
<div className="max-w-5xl mx-auto px-4">
<div className="grid md:grid-cols-3 gap-8">
<div className="flex justify-between items-center">

// Typography
<h1 className="text-3xl font-bold">
<p className="text-gray-600">

// Buttons
<button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">

// Cards
<div className="bg-white p-6 rounded-lg shadow">

// Forms
<input className="border border-gray-300 rounded px-4 py-2 w-full">
<textarea className="border border-gray-300 rounded px-4 py-2 w-full">

// Spacing
className="mt-6 mb-4 px-4 py-2"

// Colors (app palette)
bg-indigo-600   Primary
bg-pink-500     Secondary
bg-teal-500     Accent
bg-gray-50      Light background
```

## Price Calculation

```typescript
import { calculateOrderPrice, formatPrice } from '@/lib/constants/pricing';

// Calculate total (includes tax)
const total = calculateOrderPrice(
  2,              // people count
  'full_body',    // body type
  true            // has background
);
// Result: $65 (2×$25 + $15 + tax)

// Format for display
const display = formatPrice(6500); // cents
// Result: "$65.00"

// Convert cents to USD
import { centsToUsd } from '@/lib/constants/pricing';
centsToUsd(6500) // 65
```

## Error Handling

```typescript
try {
  const response = await fetch('/api/...');
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  const data = await response.json();
  return data;
} catch (error) {
  console.error('Error:', error.message);
  setError(error.message);
  // Show toast/alert to user
}
```

## File Upload Validation

```typescript
// Client-side validation
const validateFile = (file: File): string | null => {
  // Check size
  if (file.size > 5 * 1024 * 1024) {
    return 'File too large (max 5MB)';
  }

  // Check MIME type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return 'Invalid format (jpg, png, webp only)';
  }

  return null; // Valid
};

// Usage
const error = validateFile(file);
if (error) {
  setError(error);
  return;
}

// Proceed with upload
```

## reCAPTCHA v3

```typescript
// Execute reCAPTCHA on form submit
const handleSubmit = async () => {
  const token = await grecaptcha.execute(
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    { action: 'submit' }
  );

  // Send token to backend for verification
  const response = await fetch('/api/verify-recaptcha', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });

  const { score } = await response.json();

  if (score < 0.5) {
    setError('Bot detection: please try again');
    return;
  }

  // Proceed with form submission
};
```

## Stripe Payment

```typescript
import { loadStripe } from '@stripe/js';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const handlePayment = async (clientSecret) => {
    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: { name: customerName, email: customerEmail },
      },
    });

    if (error) {
      console.error(error);
      setError(error.message);
    } else {
      // Payment successful
      router.push('/studio/success');
    }
  };

  return (
    <form onSubmit={() => handlePayment(clientSecret)}>
      <CardElement />
      <button type="submit">Pay ${formatPrice(totalCents)}</button>
    </form>
  );
}
```

## Environment Variables

```bash
# In .env.local (never commit!)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Le...
RECAPTCHA_SECRET_KEY=6Le...

# Email
RESEND_API_KEY=re_...

# Analytics
NEXT_PUBLIC_GA_ID=G-...
```

## Testing Commands

```bash
# Check if dev server runs
npm run dev

# Test form validation
// Fill form → submit → check console for Zod errors

# Test database
// Open Supabase dashboard → click table → view rows

# Test Stripe webhook
// Use Stripe CLI or test webhook simulator

# Test image upload
// Use browser DevTools → Network tab → watch /api/upload
```

## Git Commands

```bash
git status                    # Check changes
git add .                     # Stage all
git commit -m "message"       # Commit
git push origin main          # Push to GitHub
git log --oneline -10         # View recent commits
```

## Useful Links

- **Supabase Dashboard**: https://app.supabase.com
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Google reCAPTCHA**: https://www.google.com/recaptcha/admin
- **Google Analytics**: https://analytics.google.com
- **Vercel Deploy**: https://vercel.com/dashboard
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind Docs**: https://tailwindcss.com/docs

---

**Save this page for quick lookup while coding!**
