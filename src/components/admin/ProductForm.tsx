"use client";

import { useState } from "react";
import type { Product } from "@/db/schema";
import { deleteProduct, saveProduct } from "@/app/admin/actions";
import { MediaInput } from "./MediaInput";

export function ProductForm({ product }: { product: Product | null }) {
  const [image, setImage] = useState(product?.image ?? "");
  const pid = product?.id ?? "new";
  return (
    <div className="rounded-xl border border-[#e4e4e0] bg-white p-4">
      <form action={saveProduct} className="grid gap-3 md:grid-cols-2">
        <input type="hidden" name="id" value={product?.id ?? ""} />
        <input type="hidden" name="image" value={image} />
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
    </div>
  );
}
