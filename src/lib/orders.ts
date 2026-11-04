import type { OrderStatus } from "./statuses";

export const STATUS_META: Record<OrderStatus, { label: string; bg: string; fg: string }> = {
  pending: { label: "Pending", bg: "#fff4d6", fg: "#8a5a00" },
  confirmed: { label: "Confirmed", bg: "#e3f0ff", fg: "#1d4f91" },
  shipped: { label: "Shipped", bg: "#efe6ff", fg: "#5b2fb0" },
  delivered: { label: "Delivered", bg: "#e2f6e6", fg: "#1f6b33" },
  cancelled: { label: "Cancelled", bg: "#f1f1ef", fg: "#555" },
  returned: { label: "Returned", bg: "#fdecea", fg: "#b42318" },
};

export function fmtBDT(n: number) {
  return "৳" + n.toLocaleString("en-IN");
}

export function fmtDate(d: Date) {
  return d.toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
