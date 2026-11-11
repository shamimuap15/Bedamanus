import Link from "next/link";
import { asc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { fmtBDT } from "@/lib/orders";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { CopyUrl } from "@/components/admin/CopyUrl";
import { NewPageDialog } from "@/components/admin/NewPageDialog";
import { TemplateMock } from "@/components/admin/TemplateMock";
import { TEMPLATE_LIST, getTemplate } from "@/templates";
import { deletePage, duplicatePage, setHomePage, togglePagePublished } from "../../actions";

export default async function PagesPage() {
  const [pages, secCounts, prodCounts, orderStats] = await Promise.all([
    db.select().from(schema.pages).orderBy(asc(schema.pages.id)),
    db.select({ pageId: schema.sections.pageId, n: sql<number>`count(*)::int` }).from(schema.sections).groupBy(schema.sections.pageId),
    db.select({ pageId: schema.products.pageId, n: sql<number>`count(*)::int` }).from(schema.products).where(eq(schema.products.active, true)).groupBy(schema.products.pageId),
    db.select({ pageId: schema.orders.pageId, n: sql<number>`count(*)::int`, total: sql<number>`coalesce(sum(${schema.orders.total}),0)::int` }).from(schema.orders).groupBy(schema.orders.pageId),
  ]);
  const secN = new Map(secCounts.map((r) => [r.pageId, r.n]));
  const prodN = new Map(prodCounts.map((r) => [r.pageId, r.n]));
  const ord = new Map(orderStats.map((r) => [r.pageId, r]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="admin-eyebrow mb-2">Landing pages</div>
          <h1 className="m-0 text-4xl">Pages</h1>
          <p className="m-0 mt-1 max-w-xl text-[15px] text-[#6f6e76]">One domain, many landing pages. Each has its own design, content, products and orders.</p>
        </div>
        <NewPageDialog templates={TEMPLATE_LIST.map((t) => ({ key: t.key, label: t.label, description: t.description, mock: <TemplateMock t={t} /> }))} />
      </div>

      <ul className="m-0 grid list-none gap-4 p-0 min-[1300px]:grid-cols-2">
        {pages.map((p) => {
          const path = p.isHome ? "/" : `/${p.slug}`;
          const stats = ord.get(p.id);
          return (
            <li key={p.id} className={`flex flex-col overflow-hidden rounded-2xl border bg-white sm:flex-row ${p.published ? "border-[#e7e5df]" : "border-dashed border-[#cfccc3]"}`}>
              <div className="relative h-[220px] w-full flex-none overflow-hidden bg-[#e9e7e1] sm:h-auto sm:w-[170px]">
                {p.published ? (
                  <iframe
                    src={path} title={`${p.title} preview`} loading="lazy" tabIndex={-1} aria-hidden
                    className="pointer-events-none absolute top-0 left-1/2 h-[1000px] w-[480px] origin-top -translate-x-1/2 scale-[.36] border-0 sm:scale-[.354]"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-xs font-bold text-[#6f6e76]">Draft</div>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="m-0 truncate text-xl font-extrabold tracking-tight">{p.title}</h2>
                      {p.isHome && <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold">Home</span>}
                      {!p.published && <span className="rounded-full bg-[#efefec] px-2 py-0.5 text-xs font-semibold text-[#666]">Draft</span>}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-[#6f6e76]">
                      <CopyUrl path={path} />
                      <span>{getTemplate(p.template).label}</span>
                    </div>
                  </div>
                  <details className="relative flex-none">
                    <summary aria-label="More actions" className="grid h-9 w-9 cursor-pointer list-none place-items-center rounded-full text-lg hover:bg-[#f3f2ee]">⋯</summary>
                    <div className="absolute right-0 z-20 mt-1 flex w-48 flex-col rounded-xl border border-[#e7e5df] bg-white p-1.5 shadow-[0_20px_50px_-20px_rgba(18,18,20,.35)]">
                      <form action={duplicatePage}><input type="hidden" name="id" value={p.id} /><button className="w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-[#f3f2ee]">Duplicate</button></form>
                      {!p.isHome && (
                        <>
                          <form action={setHomePage}><input type="hidden" name="id" value={p.id} /><button className="w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-[#f3f2ee]">Make home page</button></form>
                          <form action={togglePagePublished}><input type="hidden" name="id" value={p.id} /><button className="w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-[#f3f2ee]">{p.published ? "Unpublish" : "Publish"}</button></form>
                          <form action={deletePage}><ConfirmButton message="Delete this page and its sections? Orders are kept." className="w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#b42318] hover:bg-[#fdecea]">Delete</ConfirmButton><input type="hidden" name="id" value={p.id} /></form>
                        </>
                      )}
                    </div>
                  </details>
                </div>

                <dl className="m-0 grid grid-cols-3 gap-2 text-center">
                  {[
                    ["Orders", String(stats?.n ?? 0)],
                    ["Revenue", fmtBDT(stats?.total ?? 0)],
                    ["Products", String(prodN.get(p.id) ?? 0)],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-xl bg-[#faf9f6] px-2 py-2">
                      <dd className="m-0 text-base font-extrabold">{v}</dd>
                      <dt className="text-[11px] font-semibold tracking-wide text-[#6f6e76] uppercase">{k}</dt>
                    </div>
                  ))}
                </dl>

                <div className="mt-auto flex flex-wrap gap-2">
                  <Link href={`/admin/editor?page=${p.id}`} className="admin-btn no-underline">Edit page</Link>
                  <a href={path} target="_blank" rel="noreferrer" className="admin-btn-ghost no-underline">View ↗</a>
                  <span className="ml-auto self-center text-xs text-[#6f6e76]">{secN.get(p.id) ?? 0} sections</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
