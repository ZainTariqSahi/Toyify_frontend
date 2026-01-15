-- Add order_number column to orders table
ALTER TABLE public.orders
ADD COLUMN order_number TEXT UNIQUE;

-- Create function to generate unique order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate order number on insert
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := public.generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.set_order_number();