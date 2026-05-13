// Core domain types for the entire application

export type OrderStatus = 'draft' | 'submitted' | 'payment_pending' | 'paid' | 'completed' | 'refunded';
export type BodyType = 'full_body' | 'torso_only';
export type Role = 'self' | 'spouse' | 'child' | 'parent' | 'friend' | 'other';
export type Mood = 'happy' | 'serious' | 'playful' | 'romantic' | 'peaceful' | 'adventurous';
export type Expression = 'smiling' | 'neutral' | 'laughing';

// User Profile
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Wizard form state (what user selects in 6 steps)
export interface WizardState {
  styleId: string | null;
  styleName: string | null;

  bodyType: BodyType | null;
  skinTone: string | null;
  clothingColor: string | null;
  bodyAccessories: string[];

  backgroundId: string | null;
  backgroundName: string | null;

  people: Person[];

  mood: Mood | null;
  expression: Expression | null;
  detailAccessories: string[];
  specialRequests: string;

  imageUrls: string[];
}

export interface Person {
  id: string;
  name: string;
  role: Role;
  description: string;
}

// Portrait Style (reference table)
export interface PortraitStyle {
  id: string;
  slug: string;
  name: string;
  description: string;
  example_image_url: string;
  price_multiplier: number;
  is_active: boolean;
  created_at: string;
}

// Background (reference table)
export interface Background {
  id: string;
  slug: string;
  name: string;
  description: string;
  thumbnail_url: string;
  is_active: boolean;
  created_at: string;
}

// Main Order
export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_price_cents: number;
  currency: string;
  wizard_state: WizardState;
  stripe_payment_intent_id?: string;
  stripe_customer_id?: string;
  created_at: string;
  submitted_at?: string;
  completed_at?: string;
  updated_at: string;
}

// Order Images
export interface OrderImage {
  id: string;
  order_id: string;
  storage_path: string;
  file_size_bytes: number;
  mime_type: string;
  uploaded_by_user_id: string;
  uploaded_at: string;
  metadata?: {
    width: number;
    height: number;
    hash: string;
  };
}

// Transaction (Stripe sync)
export interface Transaction {
  id: string;
  order_id: string;
  stripe_transaction_id: string;
  amount_cents: number;
  status: 'pending' | 'succeeded' | 'failed';
  type: 'charge' | 'refund';
  error_message?: string;
  created_at: string;
  processed_at?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateOrderResponse {
  order_id: string;
  status: OrderStatus;
}

export interface SubmitOrderResponse {
  order: Order;
  clientSecret: string;
  totalPrice: number;
}

export interface UploadResponse {
  url: string;
  metadata: {
    width: number;
    height: number;
    size: number;
  };
}

// Stripe event types
export interface StripePaymentIntentSucceededEvent {
  type: 'payment_intent.succeeded';
  data: {
    object: {
      id: string;
      client_secret: string;
      amount: number;
      currency: string;
      status: string;
      metadata: {
        order_id: string;
      };
    };
  };
}

export interface StripePaymentIntentFailedEvent {
  type: 'payment_intent.payment_failed';
  data: {
    object: {
      id: string;
      last_payment_error: {
        message: string;
      };
      metadata: {
        order_id: string;
      };
    };
  };
}

export type StripeWebhookEvent = StripePaymentIntentSucceededEvent | StripePaymentIntentFailedEvent;

// Rate limit
export interface RateLimit {
  id: string;
  user_id?: string;
  action: string;
  count: number;
  window_start: string;
  window_end: string;
  created_at: string;
}
