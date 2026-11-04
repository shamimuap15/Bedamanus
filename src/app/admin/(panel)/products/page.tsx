import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function ProductsPage() {
  const rows = await db.select().from(schema.products).orderBy(asc(schema.products.sortOrder), asc(schema.products.id));
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="m-0 text-2xl font-bold">Products &amp; price</h1>
        <p className="m-0 text-sm text-[#666]">
          These are the packages customers can pick in the order form. The first active one sets the price shown in the hero and sticky bar.
          Add more to offer bundles (e.g. “২ সেট কম্বো”).
        </p>
      </div>
      {rows.map((p) => (
        <ProductForm key={p.id} product={p} />
      ))}
      <details className="rounded-xl border border-dashed border-[#cfcfca] bg-white">
        <summary className="cursor-pointer p-4 font-semibold">+ Add a product / package</summary>
        <div className="border-t border-[#e4e4e0] p-0">
          <ProductForm product={null} />
        </div>
      </details>
    </div>
  );
}
