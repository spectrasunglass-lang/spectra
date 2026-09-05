-- Adds the two storefront collection flags used by the mobile navigation.
ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS is_computer_glasses BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS is_accessory BOOLEAN DEFAULT false;

-- Supports the active, newest-first collection queries without indexing unrelated products.
CREATE INDEX IF NOT EXISTS idx_products_computer_glasses_active
    ON public.products (created_at DESC)
    WHERE status = 'active' AND is_computer_glasses = true;

CREATE INDEX IF NOT EXISTS idx_products_accessory_active
    ON public.products (created_at DESC)
    WHERE status = 'active' AND is_accessory = true;
