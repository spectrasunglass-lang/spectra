import type { Metadata } from "next";
import FlaggedProductCollection from "@/components/FlaggedProductCollection";

export const metadata: Metadata = {
  title: "Computer Glasses — SPECTRA",
  description:
    "Explore SPECTRA computer glasses selected for comfortable, clear everyday screen use.",
};

export const revalidate = 60;

export default function ComputerGlassesPage() {
  return (
    <FlaggedProductCollection
      flag="is_computer_glasses"
      eyebrow="Screen-Ready Vision"
      title="Computer Glasses"
      description="Thoughtfully selected eyewear for focused, comfortable everyday screen time."
      emptyMessage="Computer glasses coming soon"
    />
  );
}
