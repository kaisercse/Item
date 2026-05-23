import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Item = {
  id: string;
  item_code: string;
  item_name: string;
  item_description: string | null;
  category: string | null;
  group_name: string | null;
  base_uom: string | null;
  purchase_uom: string | null;
  sales_uom: string | null;
  color: string | null;
  size: string | null;
  brand: string | null;
  model: string | null;
  origin: string | null;
  manufacturer: string | null;
  organic_type: string | null;
  decimal_precision: number;
  count: number;
  hs_code: string | null;
  uom_conversion: number | null;
  conversion_value: number | null;
  purchase_price: number | null;
  sales_price: number | null;
  batch_lot_tracking: boolean;
  inventory_valuation_method: string | null;
  expiry_required: boolean;
  warranty_required: boolean;
  qc_required: boolean;
  active: boolean;
  re_order: boolean;
  created_at: string;
  updated_at: string;
};

export type ItemInput = Omit<Item, 'id' | 'created_at' | 'updated_at'>;
