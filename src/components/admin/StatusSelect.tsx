"use client";

import { useRef } from "react";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/statuses";
import { STATUS_META } from "@/lib/orders";
import { updateOrderStatus } from "@/app/admin/actions";

export function StatusSelect({ id, status }: { id: number; status: OrderStatus }) {
  const formRef = useRef<HTMLFormElement>(null);
  const m = STATUS_META[status];
  return (
    <form ref={formRef} action={updateOrderStatus}>
      <input type="hidden" name="id" value={id} />
      <label className="sr-only" htmlFor={`st-${id}`}>Status</label>
      <select
        id={`st-${id}`}
        name="status"
        defaultValue={status}
        onChange={() => formRef.current?.requestSubmit()}
        className="rounded-full border-0 px-2.5 py-1 text-xs font-bold"
        style={{ background: m.bg, color: m.fg }}
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>{STATUS_META[s].label}</option>
        ))}
      </select>
    </form>
  );
}
