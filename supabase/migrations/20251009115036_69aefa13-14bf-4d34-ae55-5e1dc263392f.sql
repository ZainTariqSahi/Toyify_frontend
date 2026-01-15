-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  original_image_url TEXT NOT NULL,
  ai_description TEXT NOT NULL,
  generated_concept_url TEXT,
  order_size TEXT NOT NULL,
  order_price DECIMAL(10, 2) NOT NULL,
  order_status TEXT NOT NULL DEFAULT 'pending',
  payment_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Anyone can insert orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view their own orders" 
ON public.orders 
FOR SELECT 
USING (true);

-- Create storage bucket for generated concept images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('concept-images', 'concept-images', true);

-- Create storage policies
CREATE POLICY "Anyone can upload concept images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'concept-images');

CREATE POLICY "Concept images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'concept-images');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();