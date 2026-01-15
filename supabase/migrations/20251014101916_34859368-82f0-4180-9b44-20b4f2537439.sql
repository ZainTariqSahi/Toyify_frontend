-- Make concept-images bucket private for better security
UPDATE storage.buckets 
SET public = false 
WHERE id = 'concept-images';