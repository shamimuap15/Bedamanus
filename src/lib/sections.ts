/**
 * Content model for the landing page.
 *
 * Every section type declares the fields the admin panel can edit. The admin
 * editor is generated from these definitions, so adding a field here makes it
 * editable without touching the admin UI.
 */

export type FieldDef =
  | { key: string; label: string; type: "text"; placeholder?: string; help?: string }
  | { key: string; label: string; type: "textarea"; placeholder?: string; help?: string }
  | { key: string; label: string; type: "image"; help?: string }
  | { key: string; label: string; type: "video"; help?: string }
  | { key: string; label: string; type: "boolean"; help?: string }
  | { key: string; label: string; type: "number"; help?: string }
  | { key: string; label: string; type: "color"; help?: string }
  | { key: string; label: string; type: "icon"; help?: string }
  | { key: string; label: string; type: "list"; itemLabel: string; fields: FieldDef[]; help?: string };

export const ICONS = [
  "cash",
  "shield",
  "dry",
  "truck",
  "check",
  "cross",
  "droplet",
  "bottle",
  "rotate",
  "hanger",
  "phone",
  "star",
  "heart",
  "leaf",
  "clock",
  "gift",
] as const;
export type IconName = (typeof ICONS)[number];

export type SectionType =
  | "hero"
  | "problems"
  | "products"
  | "comparison"
  | "gallery"
  | "howto"
  | "reviews"
  | "faq"
  | "cta"
  | "order";

type SectionDef = {
  label: string;
  description: string;
  /** Only one of these may exist (e.g. the order form). */
  single?: boolean;
  fields: FieldDef[];
  defaults: Record<string, unknown>;
};

const title: FieldDef = { key: "title", label: "Section title", type: "text" };

export const SECTION_DEFS: Record<SectionType, SectionDef> = {
  hero: {
    label: "Hero",
    description: "Hook headline, video, product thumbnails, price and main button.",
    fields: [
      { key: "badge", label: "Warning tag above headline", type: "text" },
      { key: "titleLine1", label: "Headline – line 1", type: "text" },
      { key: "titleHighlight", label: "Headline – highlighted line", type: "text" },
      { key: "subtitle", label: "Sub-headline", type: "textarea" },
      { key: "video", label: "Hero video (MP4)", type: "video", help: "Leave empty to show the cover image only." },
      { key: "poster", label: "Video cover / hero image", type: "image" },
      { key: "autoplay", label: "Autoplay video (muted, loop)", type: "boolean" },
      { key: "videoLabel", label: "Small label on video", type: "text" },
      { key: "ribbonTop", label: "Corner badge – big text", type: "text" },
      { key: "ribbonBottom", label: "Corner badge – small text", type: "text" },
      {
        key: "thumbs",
        label: "Product thumbnails",
        type: "list",
        itemLabel: "Thumbnail",
        fields: [
          { key: "image", label: "Image", type: "image" },
          { key: "label", label: "Label", type: "text" },
        ],
      },
      { key: "showPrice", label: "Show price (from first product)", type: "boolean" },
      { key: "ctaText", label: "Button text", type: "text" },
      {
        key: "trust",
        label: "Trust badges",
        type: "list",
        itemLabel: "Badge",
        fields: [
          { key: "icon", label: "Icon", type: "icon" },
          { key: "label", label: "Text", type: "text" },
        ],
      },
    ],
    defaults: {
      badge: "লুফা ব্যবহার করছেন? সাবধান!",
      titleLine1: "পিঠে হাত পৌঁছায় না?",
      titleHighlight: "ময়লা জমেই থাকে!",
      subtitle: "মাথা থেকে পা — ৩-ইন-১ সিলিকন কম্বোতে ডিপ ক্লিন",
      video: "",
      poster: "",
      autoplay: true,
      videoLabel: "ভিডিও",
      ribbonTop: "৩টি",
      ribbonBottom: "এক দামে",
      thumbs: [],
      showPrice: true,
      ctaText: "অর্ডার করুন",
      trust: [],
    },
  },
  problems: {
    label: "Problems",
    description: "Pain points shown as icon tiles.",
    fields: [
      title,
      {
        key: "items",
        label: "Problems",
        type: "list",
        itemLabel: "Problem",
        fields: [{ key: "label", label: "Text", type: "text" }],
      },
    ],
    defaults: { title: "লুফা দিয়ে আর না", items: [] },
  },
  products: {
    label: "What's in the combo",
    description: "One card per product with photos and short tags.",
    fields: [
      title,
      {
        key: "items",
        label: "Products",
        type: "list",
        itemLabel: "Product",
        fields: [
          { key: "name", label: "Name", type: "text" },
          { key: "image1", label: "Image 1", type: "image" },
          { key: "image2", label: "Image 2 (optional)", type: "image" },
          { key: "tags", label: "Tags (comma separated)", type: "text" },
        ],
      },
    ],
    defaults: { title: "কম্বোতে পাচ্ছেন", items: [] },
  },
  comparison: {
    label: "Comparison table",
    description: "✓ / ✗ table comparing the old way with your product.",
    fields: [
      title,
      { key: "colA", label: "Column A (old way)", type: "text" },
      { key: "colB", label: "Column B (your product)", type: "text" },
      {
        key: "rows",
        label: "Rows",
        type: "list",
        itemLabel: "Row",
        fields: [
          { key: "label", label: "Feature", type: "text" },
          { key: "a", label: "Column A has it", type: "boolean" },
          { key: "b", label: "Column B has it", type: "boolean" },
        ],
      },
    ],
    defaults: { title: "লুফা বনাম সিলিকন", colA: "লুফা", colB: "সিলিকন", rows: [] },
  },
  gallery: {
    label: "Photo gallery",
    description: "Grid of photos with small captions.",
    fields: [
      title,
      {
        key: "items",
        label: "Photos",
        type: "list",
        itemLabel: "Photo",
        fields: [
          { key: "image", label: "Image", type: "image" },
          { key: "caption", label: "Caption", type: "text" },
          { key: "wide", label: "Full width", type: "boolean" },
        ],
      },
    ],
    defaults: { title: "কাছ থেকে দেখুন", items: [] },
  },
  howto: {
    label: "How to use",
    description: "Icon steps plus how-to-use videos.",
    fields: [
      title,
      {
        key: "steps",
        label: "Steps",
        type: "list",
        itemLabel: "Step",
        fields: [
          { key: "icon", label: "Icon", type: "icon" },
          { key: "label", label: "Text", type: "text" },
        ],
      },
      { key: "videosTitle", label: "Videos heading", type: "text" },
      {
        key: "videos",
        label: "Videos",
        type: "list",
        itemLabel: "Video",
        fields: [
          { key: "video", label: "Video (MP4)", type: "video" },
          { key: "poster", label: "Cover image", type: "image" },
          { key: "label", label: "Label", type: "text" },
        ],
      },
    ],
    defaults: { title: "৪ ধাপে ব্যবহার", steps: [], videosTitle: "ভিডিওতে দেখুন", videos: [] },
  },
  reviews: {
    label: "Customer reviews",
    description: "Review screenshots or written reviews.",
    fields: [
      title,
      {
        key: "items",
        label: "Reviews",
        type: "list",
        itemLabel: "Review",
        fields: [
          { key: "image", label: "Screenshot (optional)", type: "image" },
          { key: "text", label: "Review text (if no screenshot)", type: "textarea" },
          { key: "name", label: "Customer name", type: "text" },
        ],
      },
    ],
    defaults: { title: "গ্রাহকের রিভিউ", items: [] },
  },
  faq: {
    label: "FAQ",
    description: "Questions and answers.",
    fields: [
      title,
      {
        key: "items",
        label: "Questions",
        type: "list",
        itemLabel: "Question",
        fields: [
          { key: "q", label: "Question", type: "text" },
          { key: "a", label: "Answer", type: "textarea" },
        ],
      },
    ],
    defaults: { title: "সাধারণ প্রশ্ন", items: [] },
  },
  cta: {
    label: "Call-to-action banner",
    description: "A short banner with an order button.",
    fields: [
      title,
      { key: "subtitle", label: "Sub text", type: "text" },
      { key: "buttonText", label: "Button text", type: "text" },
    ],
    defaults: { title: "আজই অর্ডার করুন", subtitle: "ক্যাশ অন ডেলিভারি", buttonText: "অর্ডার করুন" },
  },
  order: {
    label: "Order form",
    description: "Checkout form. Prices and options come from Products.",
    single: true,
    fields: [
      title,
      { key: "subtitle", label: "Sub text", type: "text" },
      { key: "nameLabel", label: "Name field label", type: "text" },
      { key: "phoneLabel", label: "Phone field label", type: "text" },
      { key: "addressLabel", label: "Address field label", type: "text" },
      { key: "buttonText", label: "Submit button text", type: "text" },
      { key: "note", label: "Note under button", type: "text" },
    ],
    defaults: {
      title: "অর্ডার করুন",
      subtitle: "কোনো অগ্রিম টাকা লাগবে না",
      nameLabel: "নাম",
      phoneLabel: "মোবাইল",
      addressLabel: "ঠিকানা",
      buttonText: "অর্ডার কনফার্ম করুন",
      note: "পণ্য হাতে পেয়ে টাকা দিন",
    },
  },
};

export const SECTION_TYPES = Object.keys(SECTION_DEFS) as SectionType[];

/* ---------------- Site settings ---------------- */

export const SETTINGS_FIELDS: FieldDef[] = [
  { key: "siteTitle", label: "Browser tab / SEO title", type: "text" },
  { key: "metaDescription", label: "SEO description", type: "textarea" },
  { key: "ogImage", label: "Share image (Facebook preview)", type: "image" },
  { key: "logo", label: "Logo", type: "image" },
  { key: "announcement", label: "Top announcement bar (empty = hidden)", type: "text" },
  { key: "accentColor", label: "Brand accent colour", type: "color" },
  { key: "accentTextColor", label: "Text colour on accent buttons", type: "color" },
  { key: "phone", label: "Phone number (shown)", type: "text" },
  { key: "phoneLink", label: "Phone number for calling (e.g. +8801719119992)", type: "text" },
  { key: "whatsapp", label: "WhatsApp number (e.g. 8801719119992)", type: "text" },
  { key: "facebookUrl", label: "Facebook page URL", type: "text" },
  { key: "address", label: "Footer address", type: "text" },
  { key: "deliveryInside", label: "Delivery charge – inside Dhaka (৳)", type: "number" },
  { key: "deliveryOutside", label: "Delivery charge – outside Dhaka (৳)", type: "number" },
  { key: "insideLabel", label: "Inside Dhaka label", type: "text" },
  { key: "outsideLabel", label: "Outside Dhaka label", type: "text" },
  { key: "stickyBar", label: "Show sticky order bar on mobile", type: "boolean" },
  { key: "stickyText", label: "Sticky bar button text", type: "text" },
  { key: "thankYouTitle", label: "Thank-you page title", type: "text" },
  { key: "thankYouText", label: "Thank-you page message", type: "textarea" },
  { key: "pixelId", label: "Meta (Facebook) Pixel ID", type: "text", help: "Fires PageView, InitiateCheckout and Purchase." },
];

export const DEFAULT_SETTINGS: Record<string, unknown> = {
  siteTitle: "৩-ইন-১ সিলিকন বাথ কম্বো – BedaManush",
  metaDescription: "লং হ্যান্ডেল বডি ব্রাশ + হেয়ার ম্যাসাজ ব্রাশ + ফ্ল্যাট বডি স্ক্রাবার। ক্যাশ অন ডেলিভারি।",
  ogImage: "",
  logo: "",
  announcement: "ক্যাশ অন ডেলিভারি · সারাদেশে",
  accentColor: "#C8FF3D",
  accentTextColor: "#1F1F1F",
  phone: "০১৭১৯-১১৯৯৯২",
  phoneLink: "+8801719119992",
  whatsapp: "8801719119992",
  facebookUrl: "https://facebook.com/bedamanushbd",
  address: "মিরপুর, ঢাকা",
  deliveryInside: 0,
  deliveryOutside: 0,
  insideLabel: "ঢাকার ভেতরে",
  outsideLabel: "ঢাকার বাইরে",
  stickyBar: true,
  stickyText: "অর্ডার করুন",
  thankYouTitle: "ধন্যবাদ! আপনার অর্ডার হয়েছে",
  thankYouText: "আমাদের প্রতিনিধি শীঘ্রই আপনাকে ফোন করে অর্ডার কনফার্ম করবেন।",
  pixelId: "",
};

export type Settings = typeof DEFAULT_SETTINGS & Record<string, unknown>;

/* ---------------- helpers ---------------- */

export function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : v == null ? fallback : String(v);
}
export function list<T = Record<string, unknown>>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}
export function num(v: unknown, fallback = 0): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
export function toBn(input: number | string): string {
  return String(input).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}
export function fromBn(input: string): string {
  return input.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
}
export function taka(n: number): string {
  return "৳ " + toBn(n.toLocaleString("en-IN"));
}
