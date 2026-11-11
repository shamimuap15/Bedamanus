import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getHomePage } from "@/lib/data";
import { LandingPage, pageMetadata } from "@/components/landing/LandingPage";

// Cached HTML, refreshed every 5 minutes and immediately whenever the admin saves.
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getHomePage().catch(() => undefined);
  return page ? pageMetadata(page) : { title: "BedaManush" };
}

export default async function Home() {
  const page = await getHomePage();
  if (!page) notFound();
  return <LandingPage page={page} />;
}
