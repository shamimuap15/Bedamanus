"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { taka, toBn } from "@/lib/sections";
import { track } from "./pixel";

type P = { id: number; name: string; subtitle: string; price: number; comparePrice: number | null; image: string };

export function OrderForm({
  products,
  labels,
  delivery,
}: {
  products: P[];
  labels: { name: string; phone: string; address: string; button: string; note: string };
  delivery: { inside: number; outside: number; insideLabel: string; outsideLabel: string };
}) {
  const router = useRouter();
  const [productId, setProductId] = useState(products[0]?.id ?? 0);
  const [qty, setQty] = useState(1);
  const [area, setArea] = useState<"inside" | "outside">("inside");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const startedRef = useRef(false);

  const product = products.find((p) => p.id === productId) ?? products[0];
  const showArea = delivery.inside !== delivery.outside;
  const deliveryCharge = area === "inside" ? delivery.inside : delivery.outside;
  const subtotal = product ? product.price * qty : 0;
  const total = subtotal + deliveryCharge;

  const contentIds = useMemo(() => (product ? [String(product.id)] : []), [product]);

  function onStart() {
    if (startedRef.current || !product) return;
    startedRef.current = true;
    track("InitiateCheckout", { value: subtotal, currency: "BDT", content_ids: contentIds, content_type: "product" });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!product || submitting) return;
    const fd = new FormData(e.currentTarget);
    const body = {
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      address: String(fd.get("address") ?? ""),
      note: String(fd.get("note") ?? ""),
      productId: product.id,
      qty,
      area,
      website: String(fd.get("website") ?? ""), // honeypot
    };
    setSubmitting(true);
    setErrors({});
    setFormError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (json.errors) setErrors(json.errors);
        setFormError(json.message || "অর্ডার করা যায়নি, আবার চেষ্টা করুন।");
        setSubmitting(false);
        return;
      }
      router.push(`/thank-you/${encodeURIComponent(json.orderNo)}`);
    } catch {
      setFormError("ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।");
      setSubmitting(false);
    }
  }

  if (!product) {
    return <p className="text-muted text-center">এই মুহূর্তে অর্ডার নেওয়া বন্ধ আছে।</p>;
  }

  const inputCls =
    "bg-ground border-line2 text-fg min-h-12 w-full rounded-[10px] border px-3.5 py-3 text-base placeholder:text-[#8a8a91] focus:border-[var(--accent)] focus:outline-none";

  return (
    <form onSubmit={onSubmit} onFocus={onStart} className="flex flex-col gap-4" noValidate>
      {/* Product choice */}
      <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
        <legend className="sr-only">প্যাকেজ বেছে নিন</legend>
        {products.map((p) => {
          const selected = p.id === product.id;
          return (
            <label
              key={p.id}
              className={`bg-card flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3 ${selected ? "border-accent" : "border-transparent"}`}
            >
              <input
                type="radio"
                name="product"
                value={p.id}
                checked={selected}
                onChange={() => setProductId(p.id)}
                className="sr-only"
              />
              <span className="bg-tile h-[68px] w-[68px] flex-none overflow-hidden rounded-xl">
                {p.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt="" className="block h-full w-full object-contain" />
                )}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-base font-bold">{p.name}</span>
                {p.subtitle && <span className="text-muted text-[13px]">{p.subtitle}</span>}
                <span className="flex items-baseline gap-2">
                  <span className="text-accent text-lg font-bold">{taka(p.price)}</span>
                  {p.comparePrice ? <span className="text-muted text-sm line-through">{taka(p.comparePrice)}</span> : null}
                </span>
              </span>
              {products.length > 1 && (
                <span
                  aria-hidden
                  className={`h-5 w-5 flex-none rounded-full border-2 ${selected ? "border-accent" : "border-line2"}`}
                  style={selected ? { boxShadow: "inset 0 0 0 4px #29292d", background: "var(--accent)" } : undefined}
                />
              )}
            </label>
          );
        })}
      </fieldset>

      {/* Quantity */}
      <div className="flex items-center justify-between">
        <span className="text-soft">পরিমাণ</span>
        <div className="border-line2 flex items-center overflow-hidden rounded-[10px] border">
          <button type="button" aria-label="পরিমাণ কমান" onClick={() => setQty((q) => Math.max(1, q - 1))} className="bg-ground text-fg h-11 w-11 text-xl">−</button>
          <span className="w-10 text-center font-bold" aria-live="polite">{toBn(qty)}</span>
          <button type="button" aria-label="পরিমাণ বাড়ান" onClick={() => setQty((q) => Math.min(10, q + 1))} className="bg-ground text-fg h-11 w-11 text-xl">+</button>
        </div>
      </div>

      {/* Customer details */}
      <div className="flex flex-col gap-1">
        <label htmlFor="o-name" className="text-[15px] font-semibold">{labels.name}</label>
        <input id="o-name" name="name" autoComplete="name" placeholder="আপনার নাম" className={inputCls} aria-invalid={!!errors.name} />
        {errors.name && <span className="text-sm text-[#ff8f8f]">{errors.name}</span>}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="o-phone" className="text-[15px] font-semibold">{labels.phone}</label>
        <input id="o-phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel" placeholder="০১XXXXXXXXX" className={inputCls} aria-invalid={!!errors.phone} />
        {errors.phone && <span className="text-sm text-[#ff8f8f]">{errors.phone}</span>}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="o-addr" className="text-[15px] font-semibold">{labels.address}</label>
        <textarea id="o-addr" name="address" rows={2} autoComplete="street-address" placeholder="বাসা, রোড, থানা, জেলা" className={`${inputCls} resize-y`} aria-invalid={!!errors.address} />
        {errors.address && <span className="text-sm text-[#ff8f8f]">{errors.address}</span>}
      </div>
      {/* Honeypot: hidden from people, bots fill it */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="absolute -left-[9999px] h-px w-px opacity-0" aria-hidden />

      {showArea && (
        <fieldset className="m-0 grid grid-cols-2 gap-2 border-0 p-0">
          <legend className="mb-1 text-[15px] font-semibold">ডেলিভারি এলাকা</legend>
          {(["inside", "outside"] as const).map((a) => (
            <label key={a} className={`bg-card flex min-h-12 cursor-pointer flex-col justify-center rounded-xl border-2 px-3 py-2 ${area === a ? "border-accent" : "border-transparent"}`}>
              <input type="radio" name="area" value={a} checked={area === a} onChange={() => setArea(a)} className="sr-only" />
              <span className="font-semibold">{a === "inside" ? delivery.insideLabel : delivery.outsideLabel}</span>
              <span className="text-muted text-sm">{taka(a === "inside" ? delivery.inside : delivery.outside)}</span>
            </label>
          ))}
        </fieldset>
      )}

      {/* Summary */}
      <div className="bg-card flex flex-col gap-2 rounded-[14px] px-4 py-3.5 text-[15px]">
        <div className="flex justify-between"><span className="text-soft">সাবটোটাল</span><span>{taka(subtotal)}</span></div>
        <div className="flex justify-between"><span className="text-soft">ডেলিভারি</span><span>{deliveryCharge === 0 ? "ফ্রি" : taka(deliveryCharge)}</span></div>
        <div className="border-line flex justify-between border-t pt-2 text-xl font-bold"><span>সর্বমোট</span><span className="text-accent">{taka(total)}</span></div>
      </div>

      {formError && <p role="alert" className="m-0 rounded-lg bg-[#3a1f1f] px-3 py-2 text-center text-[#ffb4b4]">{formError}</p>}

      <button type="submit" disabled={submitting} className="bg-accent min-h-[58px] rounded-[14px] text-xl font-bold disabled:opacity-60">
        {submitting ? "অপেক্ষা করুন…" : labels.button}
      </button>
      {labels.note && <p className="text-muted m-0 text-center text-sm">{labels.note}</p>}
    </form>
  );
}
