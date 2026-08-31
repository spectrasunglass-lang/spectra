import HeroSection from "@/components/HeroSection";
import NewArrivalsSection from "@/components/NewArrivalsSection";
import ShopByShapeSection from "@/components/ShopByShapeSection";
import SpotlightSection from "@/components/SpotlightSection";
import AllProductsSection from "@/components/AllProductsSection";
import OurStorySection from "@/components/OurStorySection";
import { createClient } from "@/lib/supabase/server";
import { SpotlightCard, SpotlightHeading } from "@/types/campaign";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SPECTRA — See Beyond Limits",
  description:
    "SPECTRA luxury eyewear. Crafted for visionaries. Designed to stand apart. Shop men's and women's sunglasses, polarized lenses and exclusive collections.",
};

export const revalidate = 0; // Fresh data on each load

export default async function Home() {
  const supabase = await createClient();

  // Fetch active products and media settings in parallel
  const [
    { data: newArrivalsData },
    { data: allProductsData },
    { data: settingsData },
  ] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, subtitle, price, compare_price, image_url, slug, is_new, shape, category")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("products")
      .select("id, name, subtitle, price, compare_price, image_url, slug, is_new, shape, category")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .range(0, 7),
    supabase
      .from("settings")
      .select("key, value")
      .in("key", [
        "hero_slide_1_desktop",
        "hero_slide_1_mobile",
        "hero_slide_2_desktop",
        "hero_slide_2_mobile",
        "hero_slide_3_desktop",
        "hero_slide_3_mobile",
        "hero_slide_1",
        "hero_slide_2",
        "hero_slide_3",
        "story_image",
        "spotlight_stories",
        "spotlight_heading",
      ]),
  ]);

  const newArrivals = (newArrivalsData || []).map((p) => ({
    id: p.id,
    name: p.name,
    subtitle: p.subtitle || "",
    price: Number(p.price),
    compare_price: p.compare_price ? Number(p.compare_price) : null,
    image_url: p.image_url,
    slug: p.slug,
    is_new: Boolean(p.is_new),
    shape: p.shape,
    category: p.category,
  }));

  const allProducts = (allProductsData || []).map((p) => ({
    id: p.id,
    name: p.name,
    subtitle: p.subtitle || "",
    price: Number(p.price),
    compare_price: p.compare_price ? Number(p.compare_price) : null,
    image_url: p.image_url,
    slug: p.slug,
    is_new: Boolean(p.is_new),
    shape: p.shape,
    category: p.category,
  }));

  const settingsMap: Record<string, string> = {};
  (settingsData || []).forEach((row) => {
    if (row.value) settingsMap[row.key] = row.value;
  });

  const heroSlides = [
    {
      desktop: settingsMap.hero_slide_1_desktop || settingsMap.hero_slide_1 || null,
      mobile: settingsMap.hero_slide_1_mobile || null,
    },
    {
      desktop: settingsMap.hero_slide_2_desktop || settingsMap.hero_slide_2 || null,
      mobile: settingsMap.hero_slide_2_mobile || null,
    },
    {
      desktop: settingsMap.hero_slide_3_desktop || settingsMap.hero_slide_3 || null,
      mobile: settingsMap.hero_slide_3_mobile || null,
    },
  ];

  const storyImage = settingsMap.story_image || null;

  let spotlightCards: SpotlightCard[] = [];
  if (settingsMap.spotlight_stories) {
    try {
      const parsed = JSON.parse(settingsMap.spotlight_stories);
      if (Array.isArray(parsed)) spotlightCards = parsed;
    } catch {}
  }

  let spotlightHeading: SpotlightHeading = {};
  if (settingsMap.spotlight_heading) {
    try {
      spotlightHeading = JSON.parse(settingsMap.spotlight_heading);
    } catch {}
  }

  return (
    <div className="bg-[#0a0a0a]">
      {/* 1. Hero Section */}
      <HeroSection slides={heroSlides} />

      {/* 2. Shop By Shape */}
      <ShopByShapeSection />

  

      {/* 4. New Arrivals */}
      <NewArrivalsSection products={newArrivals} />

      {/* 5. Our Story */}
      <OurStorySection storyImageUrl={storyImage} />

          {/* 3. Editorial Spotlight / Campaigns Section */}
      <SpotlightSection cards={spotlightCards} heading={spotlightHeading} />

      {/* 6. All Products (Initial 8, scroll loads next 8) */}
      <AllProductsSection initialProducts={allProducts} />
    </div>
  );
}
