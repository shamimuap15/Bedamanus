import { NextResponse } from "next/server";
import { and, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { getSettings } from "@/lib/data";
import { fromBn } from "@/lib/sections";

export const dynamic = "force-dynamic";

function normalizePhone(raw: string) {
  let p = fromBn(raw).replace(/\D/g, "");
  if (p.startsWith("880")) p = p.slice(2);
  else if (p.startsWith("88")) p = p.slice(2);
  return p;
}

const bodySchema = z.object({
  name: z.string().trim().min(2, "নাম লিখুন").max(80, "নাম অনেক বড়"),
  phone: z
    .string()
    .transform((v) => normalizePhone(v))
    .refine((v) => /^01[3-9]\d{8}$/.test(v), "সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (০১XXXXXXXXX)"),
  address: z.string().trim().min(8, "সম্পূর্ণ ঠিকানা লিখুন").max(300, "ঠিকানা অনেক বড়"),
  note: z.string().trim().max(300).optional().default(""),
  productId: z.coerce.number().int().positive(),
  qty: z.coerce.number().int().min(1).max(10),
  area: z.enum(["inside", "outside"]).default("inside"),
  website: z.string().optional().default(""),
});

function newOrderNo() {
  const d = new Date(Date.now() + 6 * 3600 * 1000); // Asia/Dhaka date
  const ymd = d.toISOString().slice(2, 10).replace(/-/g, "");
  const rnd = Math.floor(1000 + Math.random() * 9000);
  return `BM${ymd}${rnd}`;
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = String(issue.path[0] ?? "form");
      errors[k] ??= issue.message;
    }
    return NextResponse.json({ message: "ফর্মের তথ্য ঠিক করুন", errors }, { status: 422 });
  }
  const input = parsed.data;

  // Honeypot filled → bot.
  if (input.website) return NextResponse.json({ message: "Invalid request" }, { status: 400 });

  const phone = input.phone;

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const userAgent = (req.headers.get("user-agent") ?? "").slice(0, 300);

  // Basic abuse protection: max 8 orders per IP per hour.
  if (ip) {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.orders)
      .where(and(eq(schema.orders.ip, ip), gte(schema.orders.createdAt, new Date(Date.now() - 3600_000))));
    if (count >= 8) {
      return NextResponse.json({ message: "অনেকবার চেষ্টা হয়েছে। একটু পরে আবার চেষ্টা করুন বা কল করুন।" }, { status: 429 });
    }
  }

  const product = await db.query.products.findFirst({
    where: and(eq(schema.products.id, input.productId), eq(schema.products.active, true)),
  });
  if (!product) return NextResponse.json({ message: "এই প্রোডাক্টটি এখন পাওয়া যাচ্ছে না" }, { status: 422 });

  // Double-submit protection: same phone + product within 10 minutes returns the existing order.
  const recent = await db.query.orders.findFirst({
    where: and(eq(schema.orders.phone, phone), gte(schema.orders.createdAt, new Date(Date.now() - 10 * 60_000))),
    orderBy: (o, { desc }) => [desc(o.createdAt)],
  });
  if (recent && recent.items.some((i) => i.productId === product.id && i.qty === input.qty)) {
    return NextResponse.json({ orderNo: recent.orderNo, duplicate: true });
  }

  const settings = await getSettings();
  const inside = Number(settings.deliveryInside) || 0;
  const outside = Number(settings.deliveryOutside) || 0;
  const deliveryCharge = input.area === "outside" ? outside : inside;
  const subtotal = product.price * input.qty;
  const total = subtotal + deliveryCharge;

  for (let attempt = 0; attempt < 5; attempt++) {
    const orderNo = newOrderNo();
    try {
      await db.insert(schema.orders).values({
        orderNo,
        name: input.name,
        phone,
        address: input.address,
        area: input.area,
        items: [{ productId: product.id, name: product.name, price: product.price, qty: input.qty }],
        subtotal,
        deliveryCharge,
        total,
        customerNote: input.note,
        ip,
        userAgent,
      });
      return NextResponse.json({ orderNo });
    } catch (e) {
      const msg = String((e as Error).message ?? e);
      if (!msg.includes("order_no")) {
        console.error("Order insert failed", e);
        return NextResponse.json({ message: "অর্ডার সেভ করা যায়নি। আবার চেষ্টা করুন বা কল করুন।" }, { status: 500 });
      }
    }
  }
  return NextResponse.json({ message: "অর্ডার সেভ করা যায়নি। আবার চেষ্টা করুন।" }, { status: 500 });
}
