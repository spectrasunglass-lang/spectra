export interface GiftPackage {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url?: string | null;
  is_active: boolean;
  created_at?: string;
}

export const DEFAULT_GIFT_PACKAGES: GiftPackage[] = [
  {
    id: "gift_hardbox",
    name: "Spectra Signature Hardbox",
    price: 149,
    description: "Matte black hard-shell gift box with gold debossed logo, velvet lining & satin pull ribbon.",
    image_url: "/logo/logo.png",
    is_active: true,
  },
  {
    id: "gift_casket",
    name: "Royal Velvet Presentation Casket",
    price: 299,
    description: "Deep emerald velvet jewelry-grade casket with wax-sealed authenticity card & microfiber pouch.",
    image_url: "/logo/logo.png",
    is_active: true,
  },
  {
    id: "gift_gold_edition",
    name: "Festive Gold Edition Box",
    price: 499,
    description: "Limited edition brushed gold casket with personalized message card and premium travel pouch.",
    image_url: "/logo/logo.png",
    is_active: true,
  },
];
