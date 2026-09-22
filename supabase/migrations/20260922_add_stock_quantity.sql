-- Adds stock_quantity column to public.products table
-- Default is 20 units for newly created products
ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 20;

-- Useful index for fast stock status lookups (e.g. low stock alerts, inventory reports)
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity
    ON public.products (stock_quantity);
