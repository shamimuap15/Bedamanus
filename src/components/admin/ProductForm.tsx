"use client";

import { useState } from "react";
import type { Page, Product } from "@/db/schema";
import { deleteProduct, saveProduct } from "@/app/admin/actions";
import { MediaInput } from "./MediaInput";

export function ProductForm({ product, pages }: { product: Product | null; pages: Pick<Page, "id" | "title" | "slug">[] }) {
  const [image, setImage] = useState(product?.image ?? "");
  const pid = product?.id ?? "new";
  const pageName = pages.find((p) => p.id === product?.pageId)?.title;
  const wrap = (children: React.ReactNode) =>
    product ? (
      <details className="group rounded-xl border border-[#e7e5df] bg-white">
        <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
          <span className="bg-tile h-12 w-12 flex-none overflow-hidden rounded-lg bg-[#efede8]">
            {product.image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={product.image} alt="" className="h-full w-full object-cover" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-extrabold">{product.name}</span>
            <span className="block text-xs text-[#6f6e76]">{pageName ?? "No page"} · ৳{product.price.toLocaleString("en-IN")}{product.comparePrice ? ` (was ৳${product.comparePrice.toLocaleString("en-IN")})` : ""}</span>
          </span>
          {!product.active && <span className="rounded-full bg-[#efefec] px-2 py-0.5 text-xs font-semibold text-[#666]">Inactive</span>}
          <span aria-hidden className="text-lg transition group-open:rotate-90">›</span>
        </summary>
        <div className="border-t border-[#efefec] p-4">{children}</div>
      </details>
    ) : (
      <div className="p-4">{children}</div>
    );
  return wrap(
    <>
      <form action={saveProduct} className="grid gap-3 md:grid-cols-2">
        <input type="hidden" name="id" value={product?.id ?? ""} />
        <input type="hidden" name="image" value={image} />
        <label className="flex flex-col gap-1 text-sm font-semibold md:col-span-2">Landing page
          <select name="pageId" defaultValue={product?.pageId ?? pages[0]?.id ?? ""} className="admin-input">
            {pages.map((p) => <option key={p.id} value={p.id}>{p.title} (/{p.slug})</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Name<input name="name" defaultValue={product?.name ?? ""} required className="admin-input" /></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Short description<input name="subtitle" defaultValue={product?.subtitle ?? ""} className="admin-input" /></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Sale price (৳)<input name="price" type="number" min={0} defaultValue={product?.price ?? ""} required className="admin-input" /></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Regular price (৳, shown crossed out)<input name="comparePrice" type="number" min={0} defaultValue={product?.comparePrice ?? ""} className="admin-input" /></label>
        <div className="flex flex-col gap-1 md:col-span-2">
          <span className="text-sm font-semibold">Image</span>
          <MediaInput id={`pimg-${pid}`} kind="image" value={image} onChange={setImage} />
        </div>
        <label className="flex flex-col gap-1 text-sm font-semibold">Sort order<input name="sortOrder" type="number" defaultValue={product?.sortOrder ?? 0} className="admin-input max-w-[120px]" /></label>
        <label className="flex items-center gap-2 self-end text-sm font-semibold"><input name="active" type="checkbox" defaultChecked={product?.active ?? true} className="h-4 w-4" />Active (can be ordered)</label>
        <div className="flex gap-2 md:col-span-2">
          <button className="admin-btn">{product ? "Save product" : "Add product"}</button>
        </div>
      </form>
      {product && (
        <form action={deleteProduct} className="mt-2">
          <input type="hidden" name="id" value={product.id} />
          <button
            className="admin-btn-ghost admin-btn-danger"
            onClick={(e) => { if (!confirm("Delete this product? Past orders keep their details.")) e.preventDefault(); }}
          >
            Delete
          </button>
        </form>
      )}
    </>,
  );
}
