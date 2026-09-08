-- ==============================================================================
-- SPECTRA SUNGLASS - CUSTOMERS TABLE & MIGRATION
-- Run this in your Supabase Project -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. CREATE CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID,
    name TEXT NOT NULL DEFAULT 'Client',
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    city TEXT,
    address TEXT,
    total_orders INTEGER NOT NULL DEFAULT 0,
    total_spent NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    last_active_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ENABLE ROW LEVEL SECURITY & POLICIES
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'customers' AND policyname = 'Allow full access on customers'
    ) THEN
        CREATE POLICY "Allow full access on customers"
            ON public.customers FOR ALL
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- 3. INDEXES FOR HIGH-SPEED SEARCH & QUERYING
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers (email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers (phone);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON public.customers (created_at DESC);

-- 4. ADD TO REALTIME (Safe if already added)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN others THEN NULL;
END $$;

-- 5. AUTO-POPULATE INITIAL CUSTOMERS FROM EXISTING ORDERS
INSERT INTO public.customers (name, email, phone, city, address, total_orders, total_spent, created_at, last_active_at)
SELECT 
    COALESCE(MAX(customer_name), split_part(LOWER(TRIM(customer_email)), '@', 1), 'Client') AS name,
    LOWER(TRIM(customer_email)) AS email,
    MAX(customer_phone) AS phone,
    MAX(city) AS city,
    MAX(address) AS address,
    COUNT(*) AS total_orders,
    COALESCE(SUM(amount), 0) AS total_spent,
    MIN(created_at) AS created_at,
    MAX(created_at) AS last_active_at
FROM public.orders
WHERE customer_email IS NOT NULL AND TRIM(customer_email) != ''
GROUP BY LOWER(TRIM(customer_email))
ON CONFLICT (email) DO UPDATE SET
    total_orders = EXCLUDED.total_orders,
    total_spent = EXCLUDED.total_spent,
    phone = COALESCE(EXCLUDED.phone, public.customers.phone),
    city = COALESCE(EXCLUDED.city, public.customers.city),
    address = COALESCE(EXCLUDED.address, public.customers.address),
    last_active_at = EXCLUDED.last_active_at;
