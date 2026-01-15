-- Fix 1: Add UPDATE policy for orders table to allow service role to update order status
CREATE POLICY "Service role can update orders"
ON orders FOR UPDATE
USING (true)
WITH CHECK (true);

-- Fix 2: Clean up any existing orders with null user_id before making it NOT NULL
-- Delete orphaned orders with null user_id (if any exist)
DELETE FROM orders WHERE user_id IS NULL;

-- Make user_id NOT NULL to enforce data integrity
ALTER TABLE orders ALTER COLUMN user_id SET NOT NULL;