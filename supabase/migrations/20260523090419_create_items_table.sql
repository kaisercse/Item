/*
  # Create items table for inventory management

  1. New Tables
    - `items`
      - `id` (uuid, primary key)
      - `item_code` (text, unique)
      - `item_name` (text)
      - `item_description` (text)
      - `category` (text)
      - `group_name` (text)
      - `base_uom` (text)
      - `purchase_uom` (text)
      - `sales_uom` (text)
      - `color` (text)
      - `size` (text)
      - `brand` (text)
      - `model` (text)
      - `origin` (text)
      - `manufacturer` (text)
      - `organic_type` (text)
      - `decimal_precision` (integer)
      - `count` (integer)
      - `hs_code` (text)
      - `uom_conversion` (numeric)
      - `conversion_value` (numeric)
      - `purchase_price` (numeric)
      - `sales_price` (numeric)
      - `batch_lot_tracking` (boolean)
      - `inventory_valuation_method` (text)
      - `expiry_required` (boolean)
      - `warranty_required` (boolean)
      - `qc_required` (boolean)
      - `active` (boolean)
      - `re_order` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `items` table
    - Add policy for authenticated users to manage items
*/

CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code text UNIQUE NOT NULL,
  item_name text NOT NULL,
  item_description text,
  category text,
  group_name text,
  base_uom text,
  purchase_uom text,
  sales_uom text,
  color text,
  size text,
  brand text,
  model text,
  origin text,
  manufacturer text,
  organic_type text,
  decimal_precision integer DEFAULT 2,
  count integer DEFAULT 0,
  hs_code text,
  uom_conversion numeric,
  conversion_value numeric,
  purchase_price numeric,
  sales_price numeric,
  batch_lot_tracking boolean DEFAULT false,
  inventory_valuation_method text,
  expiry_required boolean DEFAULT false,
  warranty_required boolean DEFAULT false,
  qc_required boolean DEFAULT false,
  active boolean DEFAULT true,
  re_order boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view items"
  ON items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert items"
  ON items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update items"
  ON items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete items"
  ON items FOR DELETE
  TO authenticated
  USING (true);
