-- Stores zero or more colour options for a single product. Each option has an
-- ID, customer-facing name, and a colour-specific image URL.
ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS color_variants JSONB NOT NULL DEFAULT '[]'::JSONB;
