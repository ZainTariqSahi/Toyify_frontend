-- Add new columns to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS delivery_address text,
ADD COLUMN IF NOT EXISTS order_quantity integer NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS free_shipping boolean NOT NULL DEFAULT false;