import type { Metadata } from "next";
import { getActiveProducts, getEnabledSections, getSettings } from "@/lib/data";
import { str } from "@/lib/sections";
import { SectionRenderer } from "@/components/landing/Sections";
import { Announcement, Footer, Header, MetaPixel, StickyBar, accentStyle } from "@/components/landing/Chrome";

// Cached HTML, refreshed every 5 minutes and immediately whenever the admin saves.
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings().catch(() => null);
  if (!s) return { title: "BedaManush" };
  const og = str(s.ogImage);
  return {
    title: str(s.siteTitle) || "BedaManush",
    description: str(s.metaDescription) || undefined,
    openGraph: {
      title: str(s.siteTitle),
      description: str(s.metaDescription),
      images: og ? [{ url: og }] : undefined,
      type: "website",
      locale: "bn_BD",
    },
  };
}

export default async function LandingPage() {
  const [settings, sections, products] = await Promise.all([getSettings(), getEnabledSections(), getActiveProducts()]);
  const ctx = { settings, products };
  const first = products[0];

  return (
    <div style={accentStyle(settings)} className="bg-ground text-fg relative mx-auto w-full max-w-[480px] leading-normal">
      <Announcement s={settings} />
      <Header s={settings} />
      <main>
        {sections.map((sec) => (
          <SectionRenderer key={sec.id} type={sec.type} data={sec.data} ctx={ctx} />
        ))}
      </main>
      <Footer s={settings} />
      <StickyBar s={settings} price={first?.price} />
      <MetaPixel pixelId={str(settings.pixelId)} viewContent={first ? { value: first.price, ids: [String(first.id)] } : undefined} />
    </div>
  );
}
