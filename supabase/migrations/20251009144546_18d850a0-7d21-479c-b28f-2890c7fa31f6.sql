-- Fix security warnings by setting search_path for functions

-- Update generate_order_number function with proper search_path
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  date_part TEXT;
  seq_num INT;
  order_num TEXT;
BEGIN
  -- Get today's date in YYYYMMDD format
  date_part := TO_CHAR(NOW(), 'YYYYMMDD');
  
  -- Count orders from today and increment
  SELECT COUNT(*) + 1 INTO seq_num
  FROM public.orders
  WHERE order_number LIKE 'BUZ-' || date_part || '-%';
  
  -- Format as BUZ-YYYYMMDD-XXXXX
  order_num := 'BUZ-' || date_part || '-' || LPAD(seq_num::TEXT, 5, '0');
  
  RETURN order_num;
END;
$$;

-- Update set_order_number trigger function with proper search_path
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := public.generate_order_number();
  END IF;
  RETURN NEW;
END;
$$;