"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { asc, desc, eq, gt } from "drizzle-orm";
import { db, schema } from "@/db";
import { ORDER_STATUSES, type OrderStatus } from "@/db/schema";
import { SESSION_COOKIE, createSessionToken, safeEqual, sessionCookieOptions } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import { DEFAULT_SETTINGS, SECTION_DEFS, type SectionType } from "@/lib/sections";

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

/* ---------------- sections ---------------- */

export async function createSection(formData: FormData) {
  await requireAdmin();
  const type = String(formData.get("type")) as SectionType;
  const def = SECTION_DEFS[type];
  if (!def) return;
  if (def.single) {
    const exists = await db.query.sections.findFirst({ where: eq(schema.sections.type, type) });
    if (exists) redirect(`/admin/sections/${exists.id}`);
  }
  const last = await db.query.sections.findFirst({ orderBy: [desc(schema.sections.position)] });
  const [row] = await db
    .insert(schema.sections)
    .values({ type, data: structuredClone(def.defaults), position: (last?.position ?? -1) + 1, enabled: false })
    .returning({ id: schema.sections.id });
  refreshSite();
  redirect(`/admin/sections/${row.id}`);
}

export async function saveSection(id: number, data: Record<string, unknown>) {
  await requireAdmin();
  await db.update(schema.sections).set({ data, updatedAt: new Date() }).where(eq(schema.sections.id, id));
  refreshSite();
  return { ok: true, savedAt: new Date().toISOString() };
}

export async function toggleSection(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const s = await db.query.sections.findFirst({ where: eq(schema.sections.id, id) });
  if (!s) return;
  await db.update(schema.sections).set({ enabled: !s.enabled }).where(eq(schema.sections.id, id));
  refreshSite();
}

export async function moveSection(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const dir = String(formData.get("dir"));
  // Normalise positions first so swaps are always well-defined.
  const all = await db.select().from(schema.sections).orderBy(asc(schema.sections.position), asc(schema.sections.id));
  const idx = all.findIndex((s) => s.id === id);
  const swapWith = dir === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swapWith < 0 || swapWith >= all.length) return;
  [all[idx], all[swapWith]] = [all[swapWith], all[idx]];
  await db.transaction(async (tx) => {
    for (let i = 0; i < all.length; i++) {
      await tx.update(schema.sections).set({ position: i }).where(eq(schema.sections.id, all[i].id));
    }
  });
  refreshSite();
}

export async function duplicateSection(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const s = await db.query.sections.findFirst({ where: eq(schema.sections.id, id) });
  if (!s || SECTION_DEFS[s.type as SectionType]?.single) return;
  // Shift everything after it down by one.
  const after = await db.select().from(schema.sections).where(gt(schema.sections.position, s.position));
  for (const a of after) await db.update(schema.sections).set({ position: a.position + 1 }).where(eq(schema.sections.id, a.id));
  await db.insert(schema.sections).values({ type: s.type, data: s.data, position: s.position + 1, enabled: false });
  refreshSite();
}

export async function deleteSection(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await db.delete(schema.sections).where(eq(schema.sections.id, id));
  refreshSite();
  redirect("/admin/sections");
}

/* ---------------- products ---------------- */

export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id")) || 0;
  const values = {
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
