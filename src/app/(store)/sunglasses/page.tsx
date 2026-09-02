import { redirect } from "next/navigation";

interface SunglassesPageProps {
  searchParams: Promise<{
    category?: string;
    shape?: string;
    sort?: string;
  }>;
}

export default async function SunglassesPage({ searchParams }: SunglassesPageProps) {
  const params = await searchParams;
  const q = new URLSearchParams(params as Record<string, string>).toString();
  redirect(q ? `/collections?${q}` : "/collections");
}
