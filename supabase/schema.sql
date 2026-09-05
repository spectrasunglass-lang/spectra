-- ==============================================================================
-- SPECTRA SUNGLASS - SUPABASE DATABASE SCHEMA
-- Run this in your Supabase Project -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subtitle TEXT,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    compare_price NUMERIC(10, 2),
    category TEXT NOT NULL DEFAULT 'men',
    shape TEXT NOT NULL DEFAULT 'rectangle',
    image_url TEXT,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_new BOOLEAN DEFAULT true,
    is_polarized BOOLEAN DEFAULT false,
    is_gift BOOLEAN DEFAULT false,
    is_computer_glasses BOOLEAN DEFAULT false,
    is_accessory BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Migration helpers if table already exists
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_polarized BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_gift BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_computer_glasses BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_accessory BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_products_computer_glasses_active
    ON public.products (created_at DESC)
    WHERE status = 'active' AND is_computer_glasses = true;

CREATE INDEX IF NOT EXISTS idx_products_accessory_active
    ON public.products (created_at DESC)
    WHERE status = 'active' AND is_accessory = true;


-- 2. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    product_name TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    city TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. SETTINGS TABLE (Store identity, media banners, etc.)
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. SUBSCRIBERS TABLE (VIP Newsletter & Email Marketing)
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Subscribers Policies: Public can insert/upsert, full access
CREATE POLICY "Allow public insert on subscribers"
    ON public.subscribers FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow full access on subscribers"
    ON public.subscribers FOR ALL
    USING (true)
    WITH CHECK (true);

-- Products Policies: Public read, full access for all operations
CREATE POLICY "Allow public read access on products"
    ON public.products FOR SELECT
    USING (true);

CREATE POLICY "Allow full access on products"
    ON public.products FOR ALL
    USING (true)
    WITH CHECK (true);

-- Orders Policies: Full access
CREATE POLICY "Allow full access on orders"
    ON public.orders FOR ALL
    USING (true)
    WITH CHECK (true);

-- Order Items Policies: Full access
CREATE POLICY "Allow full access on order_items"
    ON public.order_items FOR ALL
    USING (true)
    WITH CHECK (true);

-- Settings Policies: Full access
CREATE POLICY "Allow full access on settings"
    ON public.settings FOR ALL
    USING (true)
    WITH CHECK (true);

-- 6. REVIEWS TABLE (Customer Product Reviews & Ratings)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    product_slug TEXT,
    user_id UUID,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT NOT NULL,
    is_verified_buyer BOOLEAN DEFAULT true,
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_slug ON public.reviews(product_slug);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on approved reviews"
    ON public.reviews FOR SELECT
    USING (status = 'approved' OR true);

CREATE POLICY "Allow full access on reviews"
    ON public.reviews FOR ALL
    USING (true)
    WITH CHECK (true);

-- Enable Realtime for live updates on products, orders, settings, subscribers, reviews
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscribers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;

