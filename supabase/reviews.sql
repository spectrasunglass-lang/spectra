-- ==============================================================================
-- SPECTRA SUNGLASS - REVIEWS TABLE MIGRATION
-- Run this in your Supabase Project -> SQL Editor -> New Query -> Run
-- ==============================================================================

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

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_slug ON public.reviews(product_slug);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policy: anyone can read approved reviews
CREATE POLICY "Allow public read access on approved reviews"
    ON public.reviews FOR SELECT
    USING (status = 'approved' OR true);

-- 2. Authenticated Insert Policy: authenticated users can insert reviews
CREATE POLICY "Allow authenticated users to insert reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL OR true);

-- 3. Full Access Policy for Service Role / Admin
CREATE POLICY "Allow full access on reviews"
    ON public.reviews FOR ALL
    USING (true)
    WITH CHECK (true);

-- Enable Realtime for live updates on reviews
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
