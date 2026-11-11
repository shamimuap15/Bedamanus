import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/data";
import { LandingPage, pageMetadata } from "@/components/landing/LandingPage";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug).catch(() => undefined);
  return page ? pageMetadata(page) : { title: "BedaManush" };
}

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) notFound();
  return <LandingPage page={page} />;
}
