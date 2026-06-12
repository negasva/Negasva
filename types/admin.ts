export interface Price {
  id: string;
  key: string;
  label: string;
  amount: number;
  currency: string;
  updated_at: string;
}

export interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  expires_at: string | null;
  max_uses: number | null;
  current_uses: number;
  active: boolean;
  created_at: string;
}

export interface Package {
  id: string;
  name: string;
  description: string | null;
  final_price: number;
  active: boolean;
  created_at: string;
}

export interface Background {
  id: string;
  name: string;
  image_url: string;
  style: string | null;
  active: boolean;
  created_at: string;
}

export interface DrawingStyle {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  example_image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 'pending' | 'in_progress' | 'delivered' | 'cancelled';

export interface AdminOrder {
  id: string;
  client_name: string;
  client_email: string | null;
  client_instagram: string | null;
  style: string | null;
  body_type: 'torso_only' | 'full_body' | null;
  background_name: string | null;
  people_count: number;
  status: OrderStatus;
  price: number | null;
  currency: string;
  notes: string | null;
  reference: string | null;
  created_at: string;
  delivered_at: string | null;
}
