import type { Metadata } from "next";
import FlaggedProductCollection from "@/components/FlaggedProductCollection";

export const metadata: Metadata = {
  title: "Eyewear Accessories — SPECTRA",
  description:
    "Discover SPECTRA eyewear accessories, designed to complement and care for your collection.",
};

export const revalidate = 60;

export default function AccessoriesPage() {
  return (
    <FlaggedProductCollection
      flag="is_accessory"
      eyebrow="The Finishing Touch"
      title="Accessories"
      description="Essential additions selected to complement, protect, and care for your SPECTRA eyewear."
      emptyMessage="Accessories coming soon"
    />
  );
}
