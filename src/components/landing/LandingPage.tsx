import type { Metadata } from "next";
import type { Page } from "@/db/schema";
import { getPageProducts, getPageSections, getSettings, withPage } from "@/lib/data";
import { str } from "@/lib/sections";
import { fontHref } from "@/lib/design";
import { SectionRenderer, getTemplate } from "@/templates";
import { Announcement, Footer, Header, MetaPixel, StickyBar, accentStyle } from "./Chrome";

export async function pageMetadata(page: Page): Promise<Metadata> {
  const s = withPage(await getSettings().catch(() => ({}) as never), page);
  const og = str(s.ogImage);
  return {
    title: str(s.siteTitle) || page.title || "BedaManush",
    description: str(s.metaDescription) || undefined,
    openGraph: {
      title: str(s.siteTitle) || page.title,
      description: str(s.metaDescription),
      images: og ? [{ url: og }] : undefined,
      type: "website",
      locale: "bn_BD",
    },
  };
}

export async function LandingPage({ page }: { page: Page }) {
  const [site, sections, products] = await Promise.all([getSettings(), getPageSections(page.id), getPageProducts(page.id)]);
  const settings = withPage(site, page);
  const ctx = { settings, products, pageId: page.id };
  const first = products[0];
  const font = fontHref(settings);

  return (
    <div style={accentStyle(settings)} className="bg-ground text-fg relative mx-auto w-full max-w-[480px] leading-normal">
      {font && <link rel="stylesheet" href={font} precedence="default" />}
      <Announcement s={settings} />
      {!getTemplate(page.template).hideHeader && <Header s={settings} />}
      <main>
        {sections.map((sec) => (
          <SectionRenderer key={sec.id} template={page.template} type={sec.type} data={sec.data} ctx={ctx} />
        ))}
      </main>
      <Footer s={settings} />
      <StickyBar s={settings} price={first?.price} />
      <MetaPixel pixelId={str(settings.pixelId)} viewContent={first ? { value: first.price, ids: [String(first.id)] } : undefined} />
    </div>
  );
}
