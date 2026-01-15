-- Fix RLS policies for orders table

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;

-- Remove public SELECT access - orders should only be accessed through secure edge functions
-- No SELECT policy means no public access to order data

-- Only allow service role (edge functions) to insert orders
CREATE POLICY "Service role can insert orders"
ON public.orders
FOR INSERT
TO service_role
WITH CHECK (true);

-- Add order_token column for secure order lookup
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_token TEXT UNIQUE DEFAULT gen_random_uuid()::text;