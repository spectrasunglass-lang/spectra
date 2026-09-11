-- ==============================================================================
-- SPECTRA SUNGLASS - COUPONS TABLE & ORDERS INTEGRATION
-- Run this in your Supabase Project -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. CREATE COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL,
    min_order_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
    max_discount_amount NUMERIC(10, 2) DEFAULT NULL,
    valid_from TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ DEFAULT NULL,
    usage_limit INTEGER DEFAULT NULL,
    used_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ADD COUPON COLUMNS TO ORDERS TABLE
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT DEFAULT NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0;

-- 3. ENABLE ROW LEVEL SECURITY & POLICIES
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'coupons' AND policyname = 'Allow full access on coupons'
    ) THEN
        CREATE POLICY "Allow full access on coupons"
            ON public.coupons FOR ALL
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- 4. INDEXES FOR HIGH-SPEED COUPON LOOKUP
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons (UPPER(code));
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons (is_active);

-- 5. REALTIME (Safe if already added)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.coupons;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN others THEN NULL;
END $$;

-- 6. INSERT POPULAR STARTER COUPONS (IF NONE EXIST)
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_order_value, max_discount_amount, is_active)
VALUES 
    ('SPECTRA10', 'Welcome VIP 10% off your entire order', 'percentage', 10.00, 999.00, 500.00, true),
    ('LUXURY500', 'Flat ₹500 off on premium titanium frames', 'fixed', 500.00, 2499.00, NULL, true)
ON CONFLICT (code) DO NOTHING;
