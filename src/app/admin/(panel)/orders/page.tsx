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

  const [rows, [{ count }], statusCounts] = await Promise.all([
    db.select().from(schema.orders).where(where).orderBy(desc(schema.orders.createdAt)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
    db.select({ count: sql<number>`count(*)::int` }).from(schema.orders).where(where),
    db.select({ status: schema.orders.status, n: sql<number>`count(*)::int` }).from(schema.orders).groupBy(schema.orders.status),
  ]);
  const counts = new Map(statusCounts.map((r) => [r.status as string, r.n]));
  const totalAll = statusCounts.reduce((a, r) => a + r.n, 0);
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const pageTitles = new Map((await db.select({ id: schema.pages.id, title: schema.pages.title }).from(schema.pages)).map((p) => [p.id, p.title]));
  const qs = (p: Record<string, string | number>) =>
    "?" + new URLSearchParams(Object.entries({ status, q, ...p }).filter(([, v]) => v !== "" && v != null).map(([k, v]) => [k, String(v)])).toString();

  const tab = (label: string, value: string, n: number) => {
    const on = status === value;
    return (
      <Link
        key={value || "all"}
        href={qs({ status: value, page: 1 })}
        aria-current={on ? "page" : undefined}
        className={`inline-flex min-h-[38px] items-center gap-2 rounded-full border px-3.5 text-sm font-bold no-underline transition ${on ? "border-[#121214] bg-[#121214] !text-white" : "border-[#dad8d0] bg-white !text-[#121214] hover:border-[#121214]"}`}
      >
        {label}
        <span className={`rounded-full px-1.5 text-xs ${on ? "bg-white/20" : "bg-[#f3f2ee] text-[#6f6e76]"}`}>{n}</span>
      </Link>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="admin-eyebrow mb-2">Sales</div>
          <h1 className="m-0 text-4xl">Orders</h1>
        </div>
        <a href={`/api/admin/orders-export${qs({})}`} className="admin-btn-ghost no-underline">Download CSV</a>
      </div>

      <nav aria-label="Filter by status" className="flex gap-2 overflow-x-auto pb-1">
        {tab("All", "", totalAll)}
        {ORDER_STATUSES.map((s) => tab(STATUS_META[s].label, s, counts.get(s) ?? 0))}
      </nav>

      <form className="flex gap-2" role="search">
        {status && <input type="hidden" name="status" value={status} />}
        <label className="sr-only" htmlFor="q">Search</label>
        <input id="q" name="q" defaultValue={q} placeholder="Search order no, phone, name or address" className="admin-input max-w-md" />
        <button className="admin-btn">Search</button>
        {(q || status) && <Link href="/admin/orders" className="admin-btn-ghost no-underline">Clear</Link>}
      </form>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#cfccc3] bg-white p-10 text-center text-[#6f6e76]">No orders found.</div>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
          {rows.map((o) => (
            <li key={o.id} className="grid items-center gap-x-4 gap-y-2 rounded-xl border border-[#e7e5df] bg-white p-4 transition hover:border-[#121214] md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.5fr)_auto_auto]">
              <div className="min-w-0">
                <Link href={`/admin/orders/${o.id}`} className="font-extrabold">{o.orderNo}</Link>
                <div className="text-xs text-[#6f6e76]">{fmtDate(o.createdAt)}{o.pageId && pageTitles.get(o.pageId) ? ` · via ${pageTitles.get(o.pageId)}` : ""}</div>
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold">{o.name} · <a href={`tel:${o.phone}`} className="font-semibold">{o.phone}</a></div>
                <div className="truncate text-xs text-[#6f6e76]">{o.address} · {o.area === "outside" ? "Outside Dhaka" : "Inside Dhaka"}</div>
                <div className="truncate text-xs text-[#6f6e76]">{o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</div>
              </div>
              <div className="text-lg font-extrabold">{fmtBDT(o.total)}</div>
              <div className="flex items-center gap-2">
                <StatusSelect id={o.id} status={o.status} />
                <Link href={`/admin/orders/${o.id}`} className="admin-btn-ghost min-h-0 px-3 py-1.5 no-underline">Open</Link>
              </div>
            </li>
          ))}
        </ul>
      )}

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
