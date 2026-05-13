// Pricing configuration based on user preferences
// $15 per person (torso) / $25 per person (full body)
// $15 for background

export const PRICING = {
  TORSO_PER_PERSON: 15, // USD
  FULL_BODY_PER_PERSON: 25, // USD
  BACKGROUND_ADD_ON: 15, // USD
  TAX_RATE: 0.10, // 10% tax
};

export function calculateOrderPrice(
  peopleCount: number,
  bodyType: 'full_body' | 'torso_only',
  includeBackground: boolean
): number {
  let subtotal = 0;

  if (bodyType === 'full_body') {
    subtotal = peopleCount * PRICING.FULL_BODY_PER_PERSON;
  } else {
    subtotal = peopleCount * PRICING.TORSO_PER_PERSON;
  }

  if (includeBackground) {
    subtotal += PRICING.BACKGROUND_ADD_ON;
  }

  const tax = subtotal * PRICING.TAX_RATE;
  return subtotal + tax;
}

// Convert USD to cents for Stripe
export function usdToCents(usd: number): number {
  return Math.round(usd * 100);
}

// Convert cents to USD for display
export function centsToUsd(cents: number): number {
  return cents / 100;
}

export function formatPrice(cents: number): string {
  return `$${centsToUsd(cents).toFixed(2)}`;
}
