import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Quicksand } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://spectrasunglass.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SPECTRA — Luxury Eyewear & Polarized Sunglasses | Malappuram, Kerala",
    template: "%s | SPECTRA Eyewear",
  },
  description:
    "Discover SPECTRA: Kerala's premier luxury eyewear brand in Malappuram. Handcrafted polarized sunglasses for men & women, 100% UV400 protection, premium Italian acetate, and fast express delivery across Malappuram, Kozhikode, Kochi, all Kerala & Pan-India.",
  keywords: [
    // Malappuram & Kerala Geotargeted
    "sunglasses in malappuram",
    "sunglasses shop in malappuram",
    "luxury eyewear malappuram",
    "best sunglasses in kerala",
    "branded sunglasses kerala",
    "polarized sunglasses malappuram",
    "optical store malappuram",
    "sunglass brand kerala",
    "spectra sunglass",
    "spectra sunglasses malappuram",
    "eyewear boutique calicut malappuram kochi",
    "buy sunglasses online kerala",
    "best sunglasses shop in kerala",
    "sunglasses price in kerala",
    "kerala eyewear online store",
    "malappuram sunglasses online cash on delivery",
    
    // Product & Intent Keywords
    "luxury sunglasses for men",
    "designer sunglasses for women",
    "polarized sunglasses india",
    "uv400 protection sunglasses",
    "aviator sunglasses kerala",
    "wayfarer sunglasses kerala",
    "cat eye sunglasses",
    "round sunglasses",
    "rectangle sunglasses",
    "handcrafted luxury eyewear",
    "premium eyewear brand india",
  ],
  authors: [{ name: "SPECTRA Eyewear", url: siteUrl }],
  creator: "SPECTRA Luxury Eyewear",
  publisher: "SPECTRA",
  category: "Eyewear & Luxury Fashion",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "SPECTRA Luxury Eyewear",
    title: "SPECTRA — Luxury Eyewear & Polarized Sunglasses | Malappuram, Kerala",
    description:
      "Handcrafted luxury sunglasses and polarized optics in Malappuram, Kerala. Designed for visionaries. Free delivery across Kerala & Pan-India.",
    images: [
      {
        url: "/logo/logo.png",
        width: 1200,
        height: 630,
        alt: "SPECTRA Luxury Eyewear Malappuram Kerala",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SPECTRA — Luxury Eyewear & Polarized Sunglasses",
    description:
      "Premium polarized sunglasses & handcrafted luxury eyewear in Malappuram, Kerala. Express delivery across India.",
    images: ["/logo/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "geo.region": "IN-KL",
    "geo.placename": "Malappuram, Kerala, India",
    "geo.position": "11.0732;76.0740",
    ICBM: "11.0732, 76.0740",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a0a0a",
};

// Enterprise Structured Data Schemas (JSON-LD)
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "SPECTRA Luxury Eyewear",
  alternateName: ["SPECTRA", "SPECTRA Sunglass", "SPECTRA Kerala"],
  url: siteUrl,
  logo: `${siteUrl}/logo/logo.png`,
  email: "spectrasunglass@gmail.com",
  telephone: "+91 81299 50341",
  sameAs: [
    "https://instagram.com",
    "https://facebook.com",
    "https://wa.me/c/918129950341",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91 81299 50341",
    contactType: "customer service",
    areaServed: "IN",
    availableLanguage: ["English", "Malayalam", "Hindi"],
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["Store", "LocalBusiness"],
  name: "SPECTRA Luxury Eyewear Malappuram",
  image: `${siteUrl}/logo/logo.png`,
  "@id": `${siteUrl}/#localbusiness`,
  url: siteUrl,
  telephone: "+91 81299 50341",
  email: "spectrasunglass@gmail.com",
  priceRange: "₹₹",
  currenciesAccepted: "INR",
  paymentAccepted: "Cash, Credit Card, UPI, Net Banking, Cash on Delivery",
  address: {
    "@type": "PostalAddress",
    streetAddress: "SPECTRA Eyewear Boutique, Down Hill",
    addressLocality: "Malappuram",
    addressRegion: "Kerala",
    postalCode: "676505",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 11.0732,
    longitude: 76.0740,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "09:00",
      closes: "21:30",
    },
  ],
  areaServed: [
    { "@type": "City", name: "Malappuram" },
    { "@type": "City", name: "Manjeri" },
    { "@type": "City", name: "Perinthalmanna" },
    { "@type": "City", name: "Tirur" },
    { "@type": "City", name: "Kottakkal" },
    { "@type": "City", name: "Kozhikode" },
    { "@type": "City", name: "Kochi" },
    { "@type": "State", name: "Kerala" },
    { "@type": "Country", name: "India" },
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "SPECTRA",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/collections?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${quicksand.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Instant synchronous check for return visitors — zero flash of splash screen */}
        <Script
          id="spectra-preintro-gate"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem('site_intro_played')==='true'){document.documentElement.classList.add('intro-seen');}}catch(e){}`,
          }}
        />
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {/* Local Business & Malappuram Store Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        {/* WebSite SearchAction Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="h-full font-sans antialiased overflow-x-hidden" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

