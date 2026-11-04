import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { fmtBDT, fmtDate } from "@/lib/orders";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteOrder, updateOrderDetails } from "../../../actions";

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await db.query.orders.findFirst({ where: eq(schema.orders.id, Number(id)) });
  if (!order) notFound();

  const card = "rounded-xl border border-[#e4e4e0] bg-white p-4";
  return (
    <div className="flex flex-col gap-4">
      <Link href="/admin/orders" className="text-sm">← All orders</Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="m-0 text-2xl font-bold">{order.orderNo}</h1>
        <StatusSelect id={order.id} status={order.status} />
        <span className="text-sm text-[#666]">Placed {fmtDate(order.createdAt)}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <a href={`tel:${order.phone}`} className="admin-btn no-underline">Call {order.phone}</a>
        <a href={`https://wa.me/88${order.phone}`} target="_blank" rel="noreferrer" className="admin-btn-ghost no-underline">WhatsApp</a>
      </div>

      <form action={updateOrderDetails} className={`${card} grid gap-4 md:grid-cols-2`}>
        <input type="hidden" name="id" value={order.id} />
        <label className="flex flex-col gap-1 text-sm font-semibold">Name<input name="name" defaultValue={order.name} className="admin-input" /></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Phone<input name="phone" defaultValue={order.phone} className="admin-input" /></label>
        <label className="flex flex-col gap-1 text-sm font-semibold md:col-span-2">Address<textarea name="address" defaultValue={order.address} rows={2} className="admin-input" /></label>
        <div className="md:col-span-2">
          <div className="mb-1 text-sm font-semibold">Items</div>
          <table className="w-full text-sm">
            <tbody>
              {order.items.map((it, i) => (
                <tr key={i} className="border-t border-[#efefec]">
                  <td className="py-2">{it.name}</td>
                  <td className="py-2">{fmtBDT(it.price)}</td>
                  <td className="py-2"><label className="sr-only" htmlFor={`qty_${i}`}>Quantity</label><input id={`qty_${i}`} name={`qty_${i}`} type="number" min={1} max={99} defaultValue={it.qty} className="admin-input w-20" /></td>
                  <td className="py-2 text-right font-semibold">{fmtBDT(it.price * it.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <label className="flex flex-col gap-1 text-sm font-semibold">Delivery charge (৳)<input name="deliveryCharge" type="number" min={0} defaultValue={order.deliveryCharge} className="admin-input" /></label>
        <div className="flex flex-col justify-end text-sm">
          <div>Subtotal: {fmtBDT(order.subtotal)}</div>
          <div className="text-lg font-bold">Total: {fmtBDT(order.total)}</div>
          <div className="text-[#666]">{order.area === "outside" ? "Outside Dhaka" : "Inside Dhaka"}</div>
        </div>
        {order.customerNote && <div className="text-sm md:col-span-2"><strong>Customer note:</strong> {order.customerNote}</div>}
        <label className="flex flex-col gap-1 text-sm font-semibold md:col-span-2">Internal note (only admins see this)<textarea name="adminNote" defaultValue={order.adminNote} rows={2} className="admin-input" placeholder="e.g. Called, customer confirmed. Courier: Steadfast #12345" /></label>
        <div className="md:col-span-2"><button className="admin-btn">Save changes</button></div>
      </form>

      <div className={`${card} text-xs text-[#888]`}>
        IP: {order.ip || "—"} · Device: {order.userAgent || "—"}
      </div>

      <form action={deleteOrder}>
        <input type="hidden" name="id" value={order.id} />
        <ConfirmButton message="Delete this order permanently?" className="admin-btn-ghost admin-btn-danger">Delete order</ConfirmButton>
      </form>
    </div>
  );
}
