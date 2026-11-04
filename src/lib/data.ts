import "server-only";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { DEFAULT_SETTINGS, type Settings } from "./sections";

export async function getSettings(): Promise<Settings> {
  const row = await db.query.settings.findFirst({ where: eq(schema.settings.key, "site") });
  return { ...DEFAULT_SETTINGS, ...(row?.data ?? {}) } as Settings;
}

export async function getEnabledSections() {
  const rows = await db
    .select()
    .from(schema.sections)
    .where(eq(schema.sections.enabled, true))
    .orderBy(asc(schema.sections.position), asc(schema.sections.id));
  return rows;
}

export async function getActiveProducts() {
  return db
    .select()
    .from(schema.products)
    .where(eq(schema.products.active, true))
    .orderBy(asc(schema.products.sortOrder), asc(schema.products.id));
}
