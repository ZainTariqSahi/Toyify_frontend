-- Add RLS policies for concept-images storage bucket to allow permanent URLs
-- Users can view images from their own orders
CREATE POLICY "Users can view their order images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'concept-images' AND
  auth.uid() IN (
    SELECT user_id FROM public.orders 
    WHERE original_image_url LIKE '%' || name || '%'
    OR generated_concept_url LIKE '%' || name || '%'
  )
);

-- Users can upload images to their own folder
CREATE POLICY "Users can upload their order images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'concept-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own uploaded images
CREATE POLICY "Users can delete their order images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'concept-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);