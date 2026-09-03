import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.spectrasunglassess.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/admin",
          "/api/admin/*",
          "/account",
          "/account/*",
          "/cart",
        ],
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/logo/*", "https://res.cloudinary.com/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
