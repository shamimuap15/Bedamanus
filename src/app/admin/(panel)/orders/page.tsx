import Link from "next/link";
import { desc, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { ORDER_STATUSES } from "@/db/schema";
import { STATUS_META, fmtBDT, fmtDate } from "@/lib/orders";
import { orderFilters } from "@/lib/orderQuery";
import { StatusSelect } from "@/components/admin/StatusSelect";

const PAGE_SIZE = 50;

export default async function OrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const status = sp.status ?? "";
  const q = sp.q ?? "";
  const page = Math.max(1, Number(sp.page) || 1);
  const where = orderFilters(status, q);

  const [rows, [{ count }]] = await Promise.all([
    db.select().from(schema.orders).where(where).orderBy(desc(schema.orders.createdAt)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
    db.select({ count: sql<number>`count(*)::int` }).from(schema.orders).where(where),
  ]);
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const qs = (p: Record<string, string | number>) =>
    "?" + new URLSearchParams(Object.entries({ status, q, ...p }).filter(([, v]) => v !== "" && v != null).map(([k, v]) => [k, String(v)])).toString();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="m-0 text-2xl font-bold">Orders <span className="text-base font-normal text-[#666]">({count})</span></h1>
        <a href={`/api/admin/orders-export${qs({})}`} className="admin-btn-ghost no-underline">Download CSV</a>
      </div>

      <form className="flex flex-wrap gap-2" role="search">
        <label className="sr-only" htmlFor="q">Search</label>
        <input id="q" name="q" defaultValue={q} placeholder="Search order no, phone, name, address" className="admin-input max-w-sm" />
        <label className="sr-only" htmlFor="status">Status</label>
        <select id="status" name="status" defaultValue={status} className="admin-input w-auto">
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
        </select>
        <button className="admin-btn">Filter</button>
        {(q || status) && <Link href="/admin/orders" className="admin-btn-ghost no-underline">Clear</Link>}
      </form>

      <div className="overflow-x-auto rounded-xl border border-[#e4e4e0] bg-white">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-[#fafaf8] text-left text-[#555]">
            <tr>
              <th className="px-3 py-2.5 font-semibold">Order</th>
              <th className="px-3 py-2.5 font-semibold">Customer</th>
              <th className="px-3 py-2.5 font-semibold">Address</th>
              <th className="px-3 py-2.5 font-semibold">Items</th>
              <th className="px-3 py-2.5 font-semibold">Total</th>
              <th className="px-3 py-2.5 font-semibold">Status</th>
              <th className="px-3 py-2.5 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-[#666]">No orders found.</td></tr>
            )}
            {rows.map((o) => (
              <tr key={o.id} className="border-t border-[#efefec] align-top">
                <td className="px-3 py-2.5"><Link href={`/admin/orders/${o.id}`} className="font-semibold">{o.orderNo}</Link></td>
                <td className="px-3 py-2.5">
                  <div className="font-semibold">{o.name}</div>
                  <a href={`tel:${o.phone}`} className="text-[#1d4f91]">{o.phone}</a>
                </td>
                <td className="max-w-[240px] px-3 py-2.5"><div className="line-clamp-2">{o.address}</div><div className="text-xs text-[#888]">{o.area === "outside" ? "Outside Dhaka" : "Inside Dhaka"}</div></td>
                <td className="px-3 py-2.5">{o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</td>
                <td className="px-3 py-2.5 font-semibold">{fmtBDT(o.total)}</td>
                <td className="px-3 py-2.5"><StatusSelect id={o.id} status={o.status} /></td>
                <td className="px-3 py-2.5 whitespace-nowrap text-[#666]">{fmtDate(o.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <nav className="flex items-center gap-2" aria-label="Pagination">
          {page > 1 && <Link href={qs({ page: page - 1 })} className="admin-btn-ghost no-underline">← Prev</Link>}
          <span className="text-sm text-[#666]">Page {page} of {pages}</span>
          {page < pages && <Link href={qs({ page: page + 1 })} className="admin-btn-ghost no-underline">Next →</Link>}
        </nav>
      )}
    </div>
  );
}
