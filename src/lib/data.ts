import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import type { Page } from "@/db/schema";
import { DEFAULT_SETTINGS, type Settings } from "./sections";

/** Site-wide settings (logo, contact, delivery…). */
export async function getSettings(): Promise<Settings> {
  const row = await db.query.settings.findFirst({ where: eq(schema.settings.key, "site") });
  return { ...DEFAULT_SETTINGS, ...(row?.data ?? {}) } as Settings;
}

/** Site-wide settings with one page's own design / SEO / pixel overrides on top. */
export function withPage(site: Settings, page: Pick<Page, "settings">): Settings {
  return { ...site, ...(page.settings ?? {}) } as Settings;
}

export async function getHomePage(): Promise<Page | undefined> {
  const home = await db.query.pages.findFirst({ where: and(eq(schema.pages.isHome, true), eq(schema.pages.published, true)) });
  if (home) return home;
  return db.query.pages.findFirst({ where: eq(schema.pages.published, true), orderBy: [asc(schema.pages.id)] });
}

export async function getPageBySlug(slug: string): Promise<Page | undefined> {
  return db.query.pages.findFirst({ where: and(eq(schema.pages.slug, slug), eq(schema.pages.published, true)) });
}

export async function getPageById(id: number | null | undefined): Promise<Page | undefined> {
  if (!id) return undefined;
  return db.query.pages.findFirst({ where: eq(schema.pages.id, id) });
}

export async function getPageSections(pageId: number) {
  return db
    .select()
    .from(schema.sections)
    .where(and(eq(schema.sections.pageId, pageId), eq(schema.sections.enabled, true)))
    .orderBy(asc(schema.sections.position), asc(schema.sections.id));
}

export async function getPageProducts(pageId: number) {
  return db
    .select()
    .from(schema.products)
    .where(and(eq(schema.products.pageId, pageId), eq(schema.products.active, true)))
    .orderBy(asc(schema.products.sortOrder), asc(schema.products.id));
}
