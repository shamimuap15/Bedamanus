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

  const card = "rounded-xl border border-[#e4e4e0] bg-white p-4";
  return (
    <div className="flex flex-col gap-6">
      <h1 className="m-0 text-2xl font-bold">Dashboard</h1>

      {products.some((p) => p.price === 990 && p.comparePrice === 1490) && (
        <div className="rounded-xl border border-[#f0c36d] bg-[#fff8e6] p-4 text-sm">
          <strong>Set your real price:</strong> the product still has the starter price (৳990 / ৳1490).{" "}
          <Link href="/admin/products">Update it in Products &amp; price →</Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className={card}><div className="text-sm text-[#666]">Orders today</div><div className="text-2xl font-bold">{todayStats[0].count}</div><div className="text-sm text-[#666]">{fmtBDT(todayStats[0].total)}</div></div>
        <div className={card}><div className="text-sm text-[#666]">Last 7 days</div><div className="text-2xl font-bold">{weekStats[0].count}</div><div className="text-sm text-[#666]">{fmtBDT(weekStats[0].total)}</div></div>
        <div className={card}><div className="text-sm text-[#666]">Pending to confirm</div><div className="text-2xl font-bold">{statusCount.pending?.count ?? 0}</div><Link href="/admin/orders?status=pending" className="text-sm">Open →</Link></div>
        <div className={card}><div className="text-sm text-[#666]">Delivered revenue</div><div className="text-2xl font-bold">{fmtBDT(delivered)}</div><div className="text-sm text-[#666]">{statusCount.delivered?.count ?? 0} orders</div></div>
      </div>

      <div className={card}>
        <h2 className="m-0 mb-3 text-base font-bold">Orders by status</h2>
        <div className="flex flex-wrap gap-2">
          {ORDER_STATUSES.map((s) => (
            <Link key={s} href={`/admin/orders?status=${s}`} className="rounded-lg border border-[#e4e4e0] px-3 py-2 text-sm text-[#1f1f1f] no-underline">
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
