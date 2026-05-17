import { createHash, randomUUID } from 'crypto';

// Wompi Web Checkout — https://docs.wompi.co/docs/colombia/widget-checkout-web
// The same URL is used for sandbox and production; the public-key prefix
// (pub_test_ vs pub_prod_) determines the environment.
const WOMPI_CHECKOUT_URL = 'https://checkout.wompi.co/p/';

export type WompiCheckoutInput = {
  amountInCents: number;       // integer — COP has no minor units, but Wompi still calls it "cents"
  reference: string;            // unique per transaction
  redirectUrl: string;
  customerEmail?: string;
};

export function newWompiReference(): string {
  // Wompi references must be unique; UUID without dashes keeps URLs short
  return `negasva-${randomUUID().replace(/-/g, '')}`;
}

export function buildWompiCheckoutUrl(input: WompiCheckoutInput): string {
  const publicKey = process.env.WOMPI_PUBLIC_KEY;
  const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;
  if (!publicKey || !integritySecret) {
    throw new Error('Wompi env vars missing: WOMPI_PUBLIC_KEY, WOMPI_INTEGRITY_SECRET');
  }

  // Integrity signature: SHA256(reference + amount + currency + integritySecret) as hex
  const signature = createHash('sha256')
    .update(`${input.reference}${input.amountInCents}COP${integritySecret}`)
    .digest('hex');

  const params = new URLSearchParams({
    'public-key': publicKey,
    'currency': 'COP',
    'amount-in-cents': String(input.amountInCents),
    'reference': input.reference,
    'signature:integrity': signature,
    'redirect-url': input.redirectUrl,
  });
  if (input.customerEmail) params.set('customer-data:email', input.customerEmail);

  return `${WOMPI_CHECKOUT_URL}?${params.toString()}`;
}

// Wompi event payload shape (only what we use)
export type WompiEvent = {
  event: string;
  data: {
    transaction: {
      id: string;
      status: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | 'PENDING';
      reference: string;
      amount_in_cents: number;
      currency: string;
      customer_email?: string;
      payment_method_type?: string;
    };
  };
  signature: { properties: string[]; checksum: string };
  timestamp: number;
};

export function verifyWompiEvent(raw: WompiEvent): boolean {
  const eventsSecret = process.env.WOMPI_EVENTS_SECRET;
  if (!eventsSecret) return false;

  // Concat property values in the order Wompi sent them, then timestamp, then secret
  const concat = raw.signature.properties
    .map((path) => getPath(raw.data, path))
    .join('');

  const checksum = createHash('sha256')
    .update(`${concat}${raw.timestamp}${eventsSecret}`)
    .digest('hex')
    .toUpperCase();

  return checksum === raw.signature.checksum.toUpperCase();
}

// Resolves "transaction.id" against { transaction: { id: ... } }
function getPath(obj: unknown, path: string): string {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return '';
  }, obj) as string;
}
