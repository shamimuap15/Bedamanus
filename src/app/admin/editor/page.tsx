import { asc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/admin";
import { getHomePage, getPageById, getPageProducts, getSettings } from "@/lib/data";
import { ThemeEditor } from "@/components/admin/editor/ThemeEditor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Theme editor – BedaManush", robots: { index: false } };

export default async function EditorPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const page = (await getPageById(Number(sp.page))) ?? (await db.query.pages.findFirst({ where: eq(schema.pages.isHome, true) })) ?? (await getHomePage());
  if (!page) redirect("/admin/pages");

  const [site, rows, products, pages] = await Promise.all([
    getSettings(),
    db.select().from(schema.sections).where(eq(schema.sections.pageId, page.id)).orderBy(asc(schema.sections.position), asc(schema.sections.id)),
    getPageProducts(page.id),
    db.select({ id: schema.pages.id, title: schema.pages.title, isHome: schema.pages.isHome }).from(schema.pages).orderBy(asc(schema.pages.id)),
  ]);

  return (
    <ThemeEditor
      key={page.id}
      page={{ id: page.id, title: page.title, slug: page.slug, template: page.template, isHome: page.isHome, settings: page.settings }}
      pages={pages}
      initialSite={site}
      initialSections={rows.map((r) => ({ id: r.id, type: r.type, data: r.data, enabled: r.enabled }))}
      products={products}
    />
  );
}
