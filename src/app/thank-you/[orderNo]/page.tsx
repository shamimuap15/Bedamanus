import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getPageById, getSettings, withPage } from "@/lib/data";
import { str, taka, toBn } from "@/lib/sections";
import { Footer, Header, MetaPixel, accentStyle } from "@/components/landing/Chrome";
import { PurchaseEvent } from "./PurchaseEvent";

export const dynamic = "force-dynamic";
export const metadata = { title: "ধন্যবাদ – BedaManush", robots: { index: false } };

export default async function ThankYou({ params }: { params: Promise<{ orderNo: string }> }) {
  const { orderNo } = await params;
  const [order, site] = await Promise.all([
    db.query.orders.findFirst({ where: eq(schema.orders.orderNo, orderNo) }),
    getSettings(),
  ]);
  // Only show recent orders (48h) so old order pages can't be browsed.
  if (!order || Date.now() - order.createdAt.getTime() > 48 * 3600_000) notFound();

  const page = await getPageById(order.pageId);
  const settings = page ? withPage(site, page) : site;
  const backHref = page && !page.isHome ? `/${page.slug}` : "/";
  const maskedPhone = order.phone.slice(0, 3) + "*****" + order.phone.slice(-3);

  return (
    <div style={accentStyle(settings)} className="bg-ground text-fg mx-auto min-h-screen w-full max-w-[480px]">
      <Header s={settings} />
      <main className="flex flex-col gap-5 px-[18px] py-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="bg-accent flex h-16 w-16 items-center justify-center rounded-full">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <h1 className="m-0 text-[28px] leading-tight font-bold">{str(settings.thankYouTitle)}</h1>
          <p className="text-soft m-0">{str(settings.thankYouText)}</p>
        </div>

        <div className="bg-card flex flex-col gap-2.5 rounded-2xl p-4 text-[15px]">
          <div className="flex justify-between"><span className="text-muted">অর্ডার নম্বর</span><span className="font-bold">{order.orderNo}</span></div>
          <div className="flex justify-between"><span className="text-muted">নাম</span><span>{order.name}</span></div>
          <div className="flex justify-between"><span className="text-muted">মোবাইল</span><span>{toBn(maskedPhone)}</span></div>
          <div className="border-line border-t" />
          {order.items.map((it, i) => (
            <div key={i} className="flex justify-between gap-3"><span>{it.name} × {toBn(it.qty)}</span><span>{taka(it.price * it.qty)}</span></div>
          ))}
          <div className="flex justify-between"><span className="text-muted">ডেলিভারি</span><span>{order.deliveryCharge ? taka(order.deliveryCharge) : "ফ্রি"}</span></div>
          <div className="border-line flex justify-between border-t pt-2 text-xl font-bold"><span>সর্বমোট</span><span className="text-accent">{taka(order.total)}</span></div>
          <p className="text-muted m-0 text-center text-sm">পণ্য হাতে পেয়ে টাকা দিন (ক্যাশ অন ডেলিভারি)</p>
        </div>

        {str(settings.phone) && (
          <a href={`tel:${str(settings.phoneLink) || str(settings.phone)}`} className="border-line2 text-fg flex min-h-[52px] items-center justify-center rounded-xl border font-semibold no-underline">
            প্রশ্ন থাকলে কল করুন: {str(settings.phone)}
          </a>
        )}
        <Link href={backHref} className="text-accent text-center">← মূল পেজে ফিরে যান</Link>
      </main>
      <Footer s={settings} />
      <MetaPixel pixelId={str(settings.pixelId)} />
      <PurchaseEvent orderNo={order.orderNo} value={order.total} ids={order.items.map((i) => String(i.productId))} />
    </div>
  );
}
