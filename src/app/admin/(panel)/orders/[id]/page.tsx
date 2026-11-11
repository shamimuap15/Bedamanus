import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { ORDER_STATUSES } from "@/db/schema";
import { STATUS_META, fmtBDT, fmtDate } from "@/lib/orders";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteOrder, updateOrderDetails, updateOrderStatus } from "../../../actions";

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await db.query.orders.findFirst({ where: eq(schema.orders.id, Number(id)) });
  if (!order) notFound();

  const page = order.pageId ? await db.query.pages.findFirst({ where: eq(schema.pages.id, order.pageId) }) : undefined;
  const card = "rounded-xl border border-[#e7e5df] bg-white p-5";
  const flow = ORDER_STATUSES.filter((s) => !["cancelled", "returned"].includes(s));
  const idx = flow.indexOf(order.status);

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/orders" className="text-sm font-semibold">← All orders</Link>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="admin-eyebrow mb-2">Order</div>
          <h1 className="m-0 text-4xl">{order.orderNo}</h1>
          <p className="m-0 mt-1 text-sm text-[#6f6e76]">Placed {fmtDate(order.createdAt)}{page ? ` · via ${page.title}` : ""}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`tel:${order.phone}`} className="admin-btn no-underline">Call {order.phone}</a>
          <a href={`https://wa.me/88${order.phone}`} target="_blank" rel="noreferrer" className="admin-btn-ghost no-underline">WhatsApp</a>
        </div>
      </div>

      <section className={card} aria-label="Order status">
        <div className="admin-eyebrow mb-3">Status</div>
        <div className="flex flex-wrap gap-2">
          {ORDER_STATUSES.map((st) => {
            const m = STATUS_META[st];
            const on = st === order.status;
            const done = idx >= 0 && flow.indexOf(st) >= 0 && flow.indexOf(st) < idx;
            return (
              <form key={st} action={updateOrderStatus}>
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="status" value={st} />
                <button
                  aria-pressed={on}
                  className="min-h-[40px] cursor-pointer rounded-full border-2 px-4 text-sm font-bold transition"
                  style={on ? { background: m.bg, color: m.fg, borderColor: m.fg } : { background: "#fff", color: done ? m.fg : "#6f6e76", borderColor: done ? m.bg : "#e7e5df" }}
                >
                  {done ? "✓ " : ""}{m.label}
                </button>
              </form>
            );
          })}
        </div>
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form action={updateOrderDetails} className={`${card} grid gap-4 md:grid-cols-2`}>
          <input type="hidden" name="id" value={order.id} />
          <div className="admin-eyebrow md:col-span-2">Customer</div>
          <label className="flex flex-col gap-1 text-sm font-semibold">Name<input name="name" defaultValue={order.name} className="admin-input" /></label>
          <label className="flex flex-col gap-1 text-sm font-semibold">Phone<input name="phone" defaultValue={order.phone} className="admin-input" /></label>
          <label className="flex flex-col gap-1 text-sm font-semibold md:col-span-2">Address<textarea name="address" defaultValue={order.address} rows={2} className="admin-input" /></label>
          {order.customerNote && <div className="rounded-lg bg-[#fff8e6] px-3 py-2 text-sm md:col-span-2"><strong>Customer note:</strong> {order.customerNote}</div>}

          <div className="admin-eyebrow mt-2 md:col-span-2">Items</div>
          <div className="md:col-span-2">
            <table className="w-full text-sm">
              <tbody>
                {order.items.map((it, i) => (
                  <tr key={i} className="border-t border-[#efefec] first:border-0">
                    <td className="py-2 font-semibold">{it.name}</td>
                    <td className="py-2 text-[#6f6e76]">{fmtBDT(it.price)}</td>
                    <td className="py-2"><label className="sr-only" htmlFor={`qty_${i}`}>Quantity</label><input id={`qty_${i}`} name={`qty_${i}`} type="number" min={1} max={99} defaultValue={it.qty} className="admin-input w-20" /></td>
                    <td className="py-2 text-right font-bold">{fmtBDT(it.price * it.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <label className="flex flex-col gap-1 text-sm font-semibold">Delivery charge (৳)<input name="deliveryCharge" type="number" min={0} defaultValue={order.deliveryCharge} className="admin-input" /></label>
          <label className="flex flex-col gap-1 text-sm font-semibold md:col-span-2">Internal note <span className="font-normal text-[#6f6e76]">— only admins see this</span><textarea name="adminNote" defaultValue={order.adminNote} rows={2} className="admin-input" placeholder="e.g. Called, customer confirmed. Courier: Steadfast #12345" /></label>
          <div className="md:col-span-2"><button className="admin-btn">Save changes</button></div>
        </form>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
          <div className={`${card} flex flex-col gap-2 text-sm`}>
            <div className="admin-eyebrow mb-1">Summary</div>
            <div className="flex justify-between"><span className="text-[#6f6e76]">Subtotal</span><span>{fmtBDT(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-[#6f6e76]">Delivery · {order.area === "outside" ? "Outside Dhaka" : "Inside Dhaka"}</span><span>{order.deliveryCharge ? fmtBDT(order.deliveryCharge) : "Free"}</span></div>
            <div className="flex justify-between border-t border-[#efefec] pt-2 text-xl font-extrabold"><span>Total</span><span>{fmtBDT(order.total)}</span></div>
            <div className="text-xs text-[#6f6e76]">Cash on delivery</div>
          </div>
          <div className={`${card} text-xs break-words text-[#888]`}>
            IP: {order.ip || "—"}<br />Device: {order.userAgent || "—"}
          </div>
          <form action={deleteOrder}>
            <input type="hidden" name="id" value={order.id} />
            <ConfirmButton message="Delete this order permanently?" className="admin-btn-ghost admin-btn-danger w-full">Delete order</ConfirmButton>
          </form>
        </aside>
      </div>
    </div>
  );
}
