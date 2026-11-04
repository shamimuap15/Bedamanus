import type { OrderStatus } from "@/db/schema";
import { STATUS_META } from "@/lib/orders";

export function StatusBadge({ status }: { status: OrderStatus }) {
  const m = STATUS_META[status] ?? STATUS_META.pending;
  return (
    <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: m.bg, color: m.fg }}>
      {m.label}
    </span>
  );
}
