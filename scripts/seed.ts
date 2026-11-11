/**
 * Seeds the database with the landing page content from the approved design.
 * Safe to re-run: it only inserts settings/sections/products when the tables are empty.
 * Pass --force to wipe sections + products + settings and re-seed (orders are never touched).
 */
import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../src/db/schema";
import { eq, isNull } from "drizzle-orm";
import { DEFAULT_SETTINGS, SECTION_DEFS } from "../src/lib/sections";
import { DESIGN_DEFAULTS } from "../src/lib/design";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false, max: 1 });
const db = drizzle(sql, { schema });
const force = process.argv.includes("--force");

const img = (n: string) => `/seed/${n}`;

const sectionsSeed: { type: keyof typeof SECTION_DEFS; data: Record<string, unknown> }[] = [
  {
    type: "hero",
    data: {
      ...SECTION_DEFS.hero.defaults,
      poster: img("hero.jpg"),
      thumbs: [
        { image: img("longphoto.jpg"), label: "বডি ব্রাশ" },
        { image: img("hair34.jpg"), label: "হেয়ার ব্রাশ" },
        { image: img("scrubber.jpg"), label: "বডি স্ক্রাবার" },
      ],
      trust: [
        { icon: "cash", label: "ক্যাশ অন ডেলিভারি" },
        { icon: "shield", label: "ফুড-গ্রেড সিলিকন" },
        { icon: "dry", label: "দ্রুত শুকায়" },
      ],
    },
  },
  {
    type: "problems",
    data: {
      title: "লুফা দিয়ে আর না",
      items: [
        { label: "পিঠে হাত যায় না" },
        { label: "জীবাণু ও দুর্গন্ধ" },
        { label: "ত্বকে র‍্যাশ" },
        { label: "খুশকি জমে থাকে" },
      ],
    },
  },
  {
    type: "products",
    data: {
      title: "কম্বোতে পাচ্ছেন",
      items: [
        { name: "লং হ্যান্ডেল বডি ব্রাশ", image1: img("longdims.jpg"), image2: "", tags: "পিঠে পুরো নাগাল, স্টিল কোর, ৩৭ সেমি" },
        { name: "হেয়ার ম্যাসাজ ব্রাশ", image1: img("hairback.jpg"), image2: img("hairhand.jpg"), tags: "খুশকি দূর, স্ক্যাল্প ম্যাসাজ, ৮৫ গ্রাম" },
        { name: "ফ্ল্যাট বডি স্ক্রাবার", image1: img("bend.jpg"), image2: img("dims.jpg"), tags: "ঘন ফেনা, ফ্লেক্সিবল, ডেড স্কিন দূর" },
      ],
    },
  },
  {
    type: "comparison",
    data: {
      title: "লুফা বনাম সিলিকন",
      colA: "লুফা",
      colB: "সিলিকন",
      rows: [
        { label: "পিঠে নাগাল", a: false, b: true },
        { label: "দ্রুত শুকায়", a: false, b: true },
        { label: "জীবাণুমুক্ত", a: false, b: true },
        { label: "ত্বকে কোমল", a: false, b: true },
        { label: "স্ক্যাল্প ম্যাসাজ", a: false, b: true },
        { label: "দীর্ঘদিন টেকে", a: false, b: true },
      ],
    },
  },
  {
    type: "gallery",
    data: {
      title: "কাছ থেকে দেখুন",
      items: [
        { image: img("foam.jpg"), caption: "ঘন ফেনা", wide: true },
        { image: img("dual.jpg"), caption: "ডুয়াল সাইড", wide: false },
        { image: img("bristle.jpg"), caption: "নরম ব্রিসল", wide: false },
        { image: img("hook.jpg"), caption: "হুকে ঝোলান", wide: false },
        { image: img("greyblack.jpg"), caption: "সব বয়সের", wide: false },
      ],
    },
  },
  {
    type: "howto",
    data: {
      title: "৪ ধাপে ব্যবহার",
      steps: [
        { icon: "droplet", label: "ভিজিয়ে নিন" },
        { icon: "bottle", label: "ওয়াশ দিন" },
        { icon: "rotate", label: "গোল করে ঘষুন" },
        { icon: "hanger", label: "ঝুলিয়ে রাখুন" },
      ],
      videosTitle: "ভিডিওতে দেখুন",
      videos: [
        { video: "", poster: img("longphoto.jpg"), label: "বডি ব্রাশ" },
        { video: "", poster: img("hairhand.jpg"), label: "হেয়ার ব্রাশ" },
        { video: "", poster: img("foam.jpg"), label: "বডি স্ক্রাবার" },
      ],
    },
  },
  { type: "reviews", data: { title: "গ্রাহকের রিভিউ", items: [] } },
  {
    type: "faq",
    data: {
      title: "সাধারণ প্রশ্ন",
      items: [
        { q: "কম্বোতে কয়টি প্রোডাক্ট থাকবে?", a: "৩টি — লং হ্যান্ডেল বডি ব্রাশ, হেয়ার ম্যাসাজ ব্রাশ এবং ফ্ল্যাট বডি স্ক্রাবার।" },
        { q: "শিশুরা কি ব্যবহার করতে পারবে?", a: "হ্যাঁ। নরম ফুড-গ্রেড সিলিকন হওয়ায় শিশু ও সংবেদনশীল ত্বকের জন্যও নিরাপদ।" },
        { q: "কিভাবে পরিষ্কার রাখব?", a: "ব্যবহারের পর পানি দিয়ে ধুয়ে ঝুলিয়ে রাখুন। সিলিকন পানি ধরে রাখে না, তাই জীবাণু জমে না।" },
      ],
    },
  },
  { type: "order", data: { ...SECTION_DEFS.order.defaults } },
];

async function main() {
  if (force) {
    await db.delete(schema.sections);
    await db.delete(schema.products);
    await db.delete(schema.settings);
    await db.delete(schema.pages);
    console.log("Cleared settings, pages, sections and products.");
  }

  const existingSettings = await db.select().from(schema.settings);
  if (existingSettings.length === 0) {
    await db.insert(schema.settings).values({ key: "site", data: { ...DEFAULT_SETTINGS, logo: img("logo.png"), ogImage: img("hero.jpg") } });
    console.log("Seeded settings.");
  }

  const existingSections = await db.select({ id: schema.sections.id }).from(schema.sections);
  if (existingSections.length === 0) {
    await db.insert(schema.sections).values(sectionsSeed.map((s, i) => ({ type: s.type, data: s.data, position: i, enabled: true })));
    console.log(`Seeded ${sectionsSeed.length} sections.`);
  }

  const existingProducts = await db.select({ id: schema.products.id }).from(schema.products);
  if (existingProducts.length === 0) {
    await db.insert(schema.products).values([
      {
        name: "৩-ইন-১ সিলিকন বাথ কম্বো",
        subtitle: "বডি ব্রাশ + হেয়ার ব্রাশ + ফ্ল্যাট স্ক্রাবার",
        price: 990,
        comparePrice: 1490,
        image: img("hero.jpg"),
        sortOrder: 0,
      },
    ]);
    console.log("Seeded 1 product (placeholder price ৳990 — change it in /admin/products).");
  }

  // Landing pages: make sure a home page exists and everything created before multi-page support belongs to it.
  let [home] = await db.select().from(schema.pages).where(eq(schema.pages.isHome, true));
  if (!home) {
    const [site] = await db.select().from(schema.settings).where(eq(schema.settings.key, "site"));
    const design = Object.fromEntries(Object.entries(site?.data ?? {}).filter(([k]) => k in DESIGN_DEFAULTS));
    [home] = await db
      .insert(schema.pages)
      .values({ slug: "home", title: "Home", template: "classic", isHome: true, settings: { ...DESIGN_DEFAULTS, ...design } })
      .returning();
    console.log("Created the home page.");
  }
  await db.update(schema.sections).set({ pageId: home.id }).where(isNull(schema.sections.pageId));
  await db.update(schema.products).set({ pageId: home.id }).where(isNull(schema.products.pageId));
  await db.update(schema.orders).set({ pageId: home.id }).where(isNull(schema.orders.pageId));

  await sql.end();
}

main().catch(async (e) => {
  console.error(e);
  await sql.end();
  process.exit(1);
});
