"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, asc, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { ORDER_STATUSES, type OrderStatus } from "@/db/schema";
import { SESSION_COOKIE, createSessionToken, safeEqual, sessionCookieOptions } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import { DEFAULT_SETTINGS, SECTION_DEFS, type SectionType } from "@/lib/sections";
import { getTemplate } from "@/templates";

function refreshSite() {
  revalidatePath("/", "layout");
}

/* ---------------- auth ---------------- */

export async function login(_prev: { error: string; username?: string } | undefined, formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const U = process.env.ADMIN_USERNAME ?? "";
  const P = process.env.ADMIN_PASSWORD ?? "";
  if (!U || !P) return { error: "ADMIN_USERNAME / ADMIN_PASSWORD are not configured on the server.", username };
  // Small delay slows down password guessing.
  await new Promise((r) => setTimeout(r, 400));
  if (!safeEqual(username, U) || !safeEqual(password, P)) return { error: "Wrong username or password.", username };
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await createSessionToken(username), sessionCookieOptions);
  redirect("/admin");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

/* ---------------- orders ---------------- */

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status")) as OrderStatus;
  if (!ORDER_STATUSES.includes(status)) return;
  await db.update(schema.orders).set({ status, updatedAt: new Date() }).where(eq(schema.orders.id, id));
  revalidatePath("/admin", "layout");
}

export async function updateOrderDetails(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const delivery = Math.max(0, Math.round(Number(formData.get("deliveryCharge")) || 0));
  const order = await db.query.orders.findFirst({ where: eq(schema.orders.id, id) });
  if (!order) return;
  const items = order.items.map((it, i) => ({
    ...it,
    qty: Math.max(1, Math.min(99, Math.round(Number(formData.get(`qty_${i}`)) || it.qty))),
  }));
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  await db
    .update(schema.orders)
    .set({
      name: String(formData.get("name") ?? order.name).trim() || order.name,
      phone: String(formData.get("phone") ?? order.phone).trim() || order.phone,
      address: String(formData.get("address") ?? order.address).trim() || order.address,
      adminNote: String(formData.get("adminNote") ?? "").slice(0, 2000),
      items,
      subtotal,
      deliveryCharge: delivery,
      total: subtotal + delivery,
      updatedAt: new Date(),
    })
    .where(eq(schema.orders.id, id));
  revalidatePath("/admin", "layout");
}

export async function deleteOrder(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await db.delete(schema.orders).where(eq(schema.orders.id, id));
  revalidatePath("/admin", "layout");
  redirect("/admin/orders");
}

/* ---------------- pages ---------------- */

const RESERVED_SLUGS = new Set(["admin", "api", "thank-you", "_next", "seed", "uploads", "favicon.ico", "robots.txt", "sitemap.xml"]);

function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

async function uniqueSlug(base: string) {
  let slug = slugify(base) || "page";
  if (RESERVED_SLUGS.has(slug)) slug += "-page";
  let n = 2;
  while (await db.query.pages.findFirst({ where: eq(schema.pages.slug, slug) })) slug = `${slugify(base) || "page"}-${n++}`;
  return slug;
}

export async function createPage(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim() || "New page";
  const tpl = getTemplate(String(formData.get("template") ?? "classic"));
  const slug = await uniqueSlug(String(formData.get("slug") ?? "") || title);
  const any = await db.query.pages.findFirst();
  const [page] = await db
    .insert(schema.pages)
    .values({ slug, title, template: tpl.key, isHome: !any, settings: structuredClone(tpl.design) })
    .returning({ id: schema.pages.id });
  for (let i = 0; i < tpl.starter.length; i++) {
    const st = tpl.starter[i];
    await db.insert(schema.sections).values({
      pageId: page.id,
      type: st.type,
      position: i,
      enabled: true,
      data: structuredClone({ ...SECTION_DEFS[st.type].defaults, ...(st.data ?? {}) }),
    });
  }
  for (let i = 0; i < (tpl.starterProducts ?? []).length; i++) {
    const sp = tpl.starterProducts![i];
    await db.insert(schema.products).values({ pageId: page.id, name: sp.name, subtitle: sp.subtitle ?? "", price: sp.price, comparePrice: sp.comparePrice ?? null, image: sp.image ?? "", sortOrder: i });
  }
  refreshSite();
  redirect(`/admin/editor?page=${page.id}`);
}

export async function duplicatePage(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const src = await db.query.pages.findFirst({ where: eq(schema.pages.id, id) });
  if (!src) return;
  const slug = await uniqueSlug(`${src.slug}-copy`);
  const [page] = await db
    .insert(schema.pages)
    .values({ slug, title: `${src.title} (copy)`, template: src.template, isHome: false, published: false, settings: src.settings })
    .returning({ id: schema.pages.id });
  const secs = await db.select().from(schema.sections).where(eq(schema.sections.pageId, id)).orderBy(asc(schema.sections.position), asc(schema.sections.id));
  for (const sec of secs) {
    await db.insert(schema.sections).values({ pageId: page.id, type: sec.type, position: sec.position, enabled: sec.enabled, data: sec.data });
  }
  revalidatePath("/admin", "layout");
  redirect(`/admin/editor?page=${page.id}`);
}

export async function setHomePage(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await db.transaction(async (tx) => {
    await tx.update(schema.pages).set({ isHome: false });
    await tx.update(schema.pages).set({ isHome: true, published: true }).where(eq(schema.pages.id, id));
  });
  refreshSite();
  revalidatePath("/admin/pages");
}

export async function togglePagePublished(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const p = await db.query.pages.findFirst({ where: eq(schema.pages.id, id) });
  if (!p || p.isHome) return;
  await db.update(schema.pages).set({ published: !p.published, updatedAt: new Date() }).where(eq(schema.pages.id, id));
  refreshSite();
  revalidatePath("/admin/pages");
}

export async function deletePage(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const p = await db.query.pages.findFirst({ where: eq(schema.pages.id, id) });
  if (!p || p.isHome) return;
  await db.transaction(async (tx) => {
    await tx.delete(schema.sections).where(eq(schema.sections.pageId, id));
    await tx.update(schema.products).set({ pageId: null }).where(eq(schema.products.pageId, id));
    await tx.delete(schema.pages).where(eq(schema.pages.id, id));
  });
  refreshSite();
  revalidatePath("/admin/pages");
}

/** Theme editor: create a hidden section row and hand it back to the client. */
export async function addSectionRow(pageId: number, type: SectionType) {
  await requireAdmin();
  const def = SECTION_DEFS[type];
  if (!def) throw new Error("Unknown section type");
  if (def.single) {
    const exists = await db.query.sections.findFirst({ where: and(eq(schema.sections.pageId, pageId), eq(schema.sections.type, type)) });
    if (exists) throw new Error("This section already exists");
  }
  const last = await db.query.sections.findFirst({ where: eq(schema.sections.pageId, pageId), orderBy: [desc(schema.sections.position)] });
  const [row] = await db
    .insert(schema.sections)
    .values({ pageId, type, data: structuredClone(def.defaults), position: (last?.position ?? -1) + 1, enabled: false })
    .returning();
  return { id: row.id, type: row.type, data: row.data as Record<string, unknown>, enabled: row.enabled };
}

export async function duplicateSectionRow(id: number) {
  await requireAdmin();
  const src = await db.query.sections.findFirst({ where: eq(schema.sections.id, id) });
  if (!src || !src.pageId) throw new Error("Section not found");
  if (SECTION_DEFS[src.type as SectionType]?.single) throw new Error("This section can only be added once");
  const last = await db.query.sections.findFirst({ where: eq(schema.sections.pageId, src.pageId), orderBy: [desc(schema.sections.position)] });
  const [row] = await db
    .insert(schema.sections)
    .values({ pageId: src.pageId, type: src.type, data: structuredClone(src.data), position: (last?.position ?? -1) + 1, enabled: false })
    .returning();
  return { id: row.id, type: row.type, data: row.data as Record<string, unknown>, enabled: row.enabled };
}

export async function removeSectionRow(id: number) {
  await requireAdmin();
  await db.delete(schema.sections).where(eq(schema.sections.id, id));
  refreshSite();
  return { ok: true };
}

/** Theme editor: save one page (design/SEO overrides, template, slug) + site-wide settings + every section in one go. */
export async function saveEditor(input: {
  pageId: number;
  site: Record<string, unknown>;
  page: { title: string; slug: string; template: string; settings: Record<string, unknown> };
  sections: { id: number; data: Record<string, unknown>; enabled: boolean }[];
}) {
  await requireAdmin();
  const current = await db.query.pages.findFirst({ where: eq(schema.pages.id, input.pageId) });
  if (!current) throw new Error("Page not found");

  const site: Record<string, unknown> = {};
  for (const k of Object.keys(DEFAULT_SETTINGS)) if (k in input.site) site[k] = input.site[k];
  const pageSettings: Record<string, unknown> = {};
  for (const k of Object.keys(DEFAULT_SETTINGS)) if (k in input.page.settings) pageSettings[k] = input.page.settings[k];

  let slug = current.slug;
  if (!current.isHome && slugify(input.page.slug) && slugify(input.page.slug) !== current.slug) {
    const want = slugify(input.page.slug);
    const clash = await db.query.pages.findFirst({ where: eq(schema.pages.slug, want) });
    if (RESERVED_SLUGS.has(want) || (clash && clash.id !== current.id)) throw new Error("That URL is already used");
    slug = want;
  }

  await db.transaction(async (tx) => {
    await tx
      .insert(schema.settings)
      .values({ key: "site", data: site })
      .onConflictDoUpdate({ target: schema.settings.key, set: { data: site, updatedAt: new Date() } });
    await tx
      .update(schema.pages)
      .set({ title: input.page.title.trim() || current.title, slug, template: getTemplate(input.page.template).key, settings: pageSettings, updatedAt: new Date() })
      .where(eq(schema.pages.id, input.pageId));
    for (let i = 0; i < input.sections.length; i++) {
      const sec = input.sections[i];
      await tx
        .update(schema.sections)
        .set({ data: sec.data, enabled: Boolean(sec.enabled), position: i, updatedAt: new Date() })
        .where(and(eq(schema.sections.id, Number(sec.id)), eq(schema.sections.pageId, input.pageId)));
    }
  });
  refreshSite();
  return { ok: true, savedAt: new Date().toISOString(), slug };
}

/* ---------------- products ---------------- */

export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id")) || 0;
  const values = {
    pageId: Number(formData.get("pageId")) || null,
    name: String(formData.get("name") ?? "").trim() || "Untitled",
    subtitle: String(formData.get("subtitle") ?? "").trim(),
    price: Math.max(0, Math.round(Number(formData.get("price")) || 0)),
    comparePrice: Number(formData.get("comparePrice")) > 0 ? Math.round(Number(formData.get("comparePrice"))) : null,
    image: String(formData.get("image") ?? "").trim(),
    active: formData.get("active") === "on",
    sortOrder: Math.round(Number(formData.get("sortOrder")) || 0),
  };
  if (id) await db.update(schema.products).set(values).where(eq(schema.products.id, id));
  else await db.insert(schema.products).values(values);
  refreshSite();
  revalidatePath("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await db.delete(schema.products).where(eq(schema.products.id, id));
  refreshSite();
  revalidatePath("/admin/products");
}

/* ---------------- settings ---------------- */

export async function saveSettings(data: Record<string, unknown>) {
  await requireAdmin();
  const clean: Record<string, unknown> = {};
  for (const k of Object.keys(DEFAULT_SETTINGS)) if (k in data) clean[k] = data[k];
  await db
    .insert(schema.settings)
    .values({ key: "site", data: clean })
    .onConflictDoUpdate({ target: schema.settings.key, set: { data: clean, updatedAt: new Date() } });
  refreshSite();
  return { ok: true, savedAt: new Date().toISOString() };
}
