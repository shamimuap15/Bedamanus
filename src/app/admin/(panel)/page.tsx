import Link from "next/link";
import { desc, gte, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { ORDER_STATUSES } from "@/db/schema";
import { STATUS_META, fmtBDT, fmtDate } from "@/lib/orders";
import { StatusBadge } from "@/components/admin/StatusBadge";

function startOfDhakaDay(daysAgo = 0) {
  const now = new Date(Date.now() + 6 * 3600_000);
  now.setUTCHours(0, 0, 0, 0);
  return new Date(now.getTime() - 6 * 3600_000 - daysAgo * 86400_000);
}

export default async function Dashboard() {
  const today = startOfDhakaDay(0);
  const week = startOfDhakaDay(6);

  const [byStatus, todayStats, weekStats, recent, products] = await Promise.all([
    db.select({ status: schema.orders.status, count: sql<number>`count(*)::int`, total: sql<number>`coalesce(sum(${schema.orders.total}),0)::int` }).from(schema.orders).groupBy(schema.orders.status),
    db.select({ count: sql<number>`count(*)::int`, total: sql<number>`coalesce(sum(${schema.orders.total}),0)::int` }).from(schema.orders).where(gte(schema.orders.createdAt, today)),
    db.select({ count: sql<number>`count(*)::int`, total: sql<number>`coalesce(sum(${schema.orders.total}),0)::int` }).from(schema.orders).where(gte(schema.orders.createdAt, week)),
    db.select().from(schema.orders).orderBy(desc(schema.orders.createdAt)).limit(8),
    db.select().from(schema.products),
  ]);

  const statusCount = Object.fromEntries(byStatus.map((s) => [s.status, s]));
  const delivered = statusCount.delivered?.total ?? 0;

  const card = "rounded-xl border border-[#e7e5df] bg-white p-5";
  return (
    <div className="flex flex-col gap-6">
      <div><div className="admin-eyebrow mb-2">Overview</div><h1 className="m-0 text-4xl">Dashboard</h1><p className="m-0 mt-1 text-[15px] text-[#6f6e76]">Your orders and sales at a glance.</p></div>

      {products.some((p) => p.price === 990 && p.comparePrice === 1490) && (
        <div className="rounded-xl border border-[#f0c36d] bg-[#fff8e6] p-4 text-sm">
          <strong>Set your real price:</strong> the product still has the starter price (৳990 / ৳1490).{" "}
          <Link href="/admin/products">Update it in Products &amp; price →</Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className={`${card} admin-stat admin-stat-hero col-span-2 md:col-span-1`}><div className="admin-eyebrow !text-[#a7a7b0]">Orders today</div><div className="mt-2 text-5xl font-extrabold tracking-tight text-accent">{todayStats[0].count}</div><div className="text-sm text-[#a7a7b0]">{fmtBDT(todayStats[0].total)}</div></div>
        <div className={`${card} admin-stat`} style={{ ["--c" as string]: "#7c3aed" }}><div className="admin-eyebrow">Last 7 days</div><div className="mt-2 text-3xl font-extrabold tracking-tight">{weekStats[0].count}</div><div className="text-sm text-[#6b7280]">{fmtBDT(weekStats[0].total)}</div></div>
        <div className={`${card} admin-stat`} style={{ ["--c" as string]: "#f59e0b" }}><div className="admin-eyebrow">Pending to confirm</div><div className="mt-2 text-3xl font-extrabold tracking-tight">{statusCount.pending?.count ?? 0}</div><Link href="/admin/orders?status=pending" className="text-sm font-semibold">Open →</Link></div>
        <div className={`${card} admin-stat`} style={{ ["--c" as string]: "#16a34a" }}><div className="admin-eyebrow">Delivered revenue</div><div className="mt-2 text-3xl font-extrabold tracking-tight">{fmtBDT(delivered)}</div><div className="text-sm text-[#6b7280]">{statusCount.delivered?.count ?? 0} orders</div></div>
      </div>

      <div className={card}>
        <h2 className="m-0 mb-3 text-base font-bold">Orders by status</h2>
        <div className="flex flex-wrap gap-2">
          {ORDER_STATUSES.map((s) => (
            <Link key={s} href={`/admin/orders?status=${s}`} className="rounded-full border border-[#e7e5df] bg-[#faf9f6] px-4 py-2 text-sm text-[#1f1f1f] no-underline transition hover:border-[#121214]">
              <span style={{ color: STATUS_META[s].fg }} className="font-bold">{STATUS_META[s].label}</span> · {statusCount[s]?.count ?? 0}
            </Link>
          ))}
        </div>
      </div>

      <div className={card}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="m-0 text-base font-bold">Latest orders</h2>
          <Link href="/admin/orders" className="text-sm">All orders →</Link>
        </div>
        {recent.length === 0 ? (
          <p className="m-0 text-sm text-[#666]">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id} className="border-t border-[#efefec]">
                    <td className="py-2 pr-3"><Link href={`/admin/orders/${o.id}`} className="font-semibold">{o.orderNo}</Link></td>
                    <td className="py-2 pr-3">{o.name}</td>
                    <td className="py-2 pr-3">{o.phone}</td>
                    <td className="py-2 pr-3">{fmtBDT(o.total)}</td>
                    <td className="py-2 pr-3"><StatusBadge status={o.status} /></td>
                    <td className="py-2 text-[#666]">{fmtDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
