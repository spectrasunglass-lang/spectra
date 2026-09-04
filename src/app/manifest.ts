import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SPECTRA — Luxury Eyewear & Polarized Sunglasses",
    short_name: "SPECTRA",
    description: "Premium handcrafted polarized sunglasses and luxury eyewear. Designed in Malappuram, Kerala, shipped Pan-India.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
