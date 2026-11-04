"use client";

import { useEffect } from "react";
import { track } from "@/components/landing/pixel";

/** Fires the Meta Pixel Purchase event once per order (refreshes don't double count). */
export function PurchaseEvent({ orderNo, value, ids }: { orderNo: string; value: number; ids: string[] }) {
  useEffect(() => {
    const key = `bm_purchase_${orderNo}`;
    let sent = false;
    try {
      sent = localStorage.getItem(key) === "1";
    } catch {}
    if (sent) return;
    let tries = 0;
    const timer = setInterval(() => {
      const fbq = (window as unknown as { fbq?: unknown }).fbq;
      if (fbq || ++tries > 20) {
        clearInterval(timer);
        if (!fbq) return;
        track("Purchase", { value, currency: "BDT", content_ids: ids, content_type: "product" }, orderNo);
        try {
          localStorage.setItem(key, "1");
        } catch {}
      }
    }, 250);
    return () => clearInterval(timer);
  }, [orderNo, value, ids]);
  return null;
}
