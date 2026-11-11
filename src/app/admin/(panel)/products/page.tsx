import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function ProductsPage() {
  const [rows, pages] = await Promise.all([
    db.select().from(schema.products).orderBy(asc(schema.products.pageId), asc(schema.products.sortOrder), asc(schema.products.id)),
    db.select({ id: schema.pages.id, title: schema.pages.title, slug: schema.pages.slug }).from(schema.pages).orderBy(asc(schema.pages.id)),
  ]);
  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="admin-eyebrow mb-2">Catalogue</div>
        <h1 className="m-0 text-4xl">Products &amp; price</h1>
        <p className="m-0 mt-1 max-w-2xl text-[15px] text-[#6f6e76]">
          Each product belongs to one landing page; these are the packages customers can pick in that page’s order form. The first active one sets the price shown in the hero and sticky bar.
          Add more to offer bundles (e.g. “২ সেট কম্বো”).
        </p>
      </div>
      {rows.map((p) => (
        <ProductForm key={p.id} product={p} pages={pages} />
      ))}
      <details className="rounded-xl border border-dashed border-[#cfccc3] bg-white">
        <summary className="cursor-pointer p-4 font-bold">+ Add a product / package</summary>
        <div className="border-t border-[#e4e4e0] p-0">
          <ProductForm product={null} pages={pages} />
        </div>
      </details>
    </div>
  );
}
