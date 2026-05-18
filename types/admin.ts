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
