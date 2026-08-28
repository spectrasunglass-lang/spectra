import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SPECTRA — See Beyond Limits",
  description:
    "SPECTRA luxury eyewear. Crafted for visionaries. Designed to stand apart.",
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
    >
      <body className="h-full font-sans">
        {children}
      </body>
    </html>
  );
}
