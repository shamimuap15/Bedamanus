import { Icon } from "@/components/Icon";
import { VideoPlayer } from "@/components/landing/VideoPlayer";
import { Img, OrderButton, type Ctx, type D } from "@/components/landing/Sections";
import { Rich } from "@/components/landing/extra";
import { list, str, toBn } from "@/lib/sections";
import type { Template } from "./types";

const U = "/mini-shaver/";

/** Full-bleed photo hero with the headline over the image and a trust strip. */
function ShaverHero({ d }: { d: D }) {
  return (
    <section className="flex flex-col">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-black">
        {str(d.video) ? <VideoPlayer src={str(d.video)} poster={str(d.poster)} autoplay={d.autoplay !== false} label={str(d.titleLine1)} /> : <Img src={str(d.poster)} alt={str(d.titleLine1)} eager />}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--color-ground)] via-transparent to-black/40" />
        {str(d.logo) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={str(d.logo)} alt="BedaManush" className="absolute top-4 left-1/2 h-8 w-auto -translate-x-1/2" />
        )}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 px-5 pb-4 text-center">
          <h1 className="m-0 text-[length:var(--h1)] leading-[1.2] font-bold tracking-tight">
            {str(d.titleLine1)} {str(d.titleHighlight) && <span className="text-accent">{str(d.titleHighlight)}</span>}
          </h1>
          {str(d.subtitle) && <p className="text-soft m-0 text-[15px]">{str(d.subtitle)}</p>}
        </div>
      </div>
      {list(d.trust).length > 0 && (
        <div className="bg-card border-line r-lg mx-3 -mt-1 grid grid-cols-3 gap-1 border px-2 py-4">
          {list(d.trust).map((t, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 px-1 text-center">
              <span className="text-accent"><Icon name={str(t.icon)} size={22} /></span>
              <span className="text-[13px] leading-tight font-semibold">{str(t.label)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/** Table with old-way vs product text cells. */
function ShaverComparison({ d }: { d: D }) {
  const cell = (ok: boolean, text: string, good: boolean) => (
    <div className={`flex min-h-[60px] flex-col items-center justify-center gap-0.5 px-2 py-2 text-center text-[13px] font-semibold ${good ? "bg-tint-2 text-accent" : "text-muted"}`}>
      <span aria-label={ok ? "হ্যাঁ" : "না"}>{ok ? "✓" : "×"}</span>
      {text && <span>{text}</span>}
    </div>
  );
  return (
    <section className="flex flex-col gap-4 px-[18px] sec-y">
      <h2 className="m-0 text-center text-[24px] font-extrabold tracking-tight"><Rich text={str(d.title)} /></h2>
      <div className="grid grid-cols-[1.1fr_1fr_1fr] gap-1.5 text-sm">
        <div />
        <div className="text-muted py-1 text-center font-semibold">{str(d.colA)}</div>
        <div className="bg-accent r-sm py-1 text-center font-bold">{str(d.colB)}</div>
        {list(d.rows).map((r, i) => (
          <div key={i} className="contents">
            <div className="bg-card r-sm flex items-center px-3 text-[14px] font-bold">{str(r.label)}</div>
            <div className="bg-card r-sm">{cell(Boolean(r.a), str(r.aText), false)}</div>
            <div className="bg-card r-sm border-accent/40 border">{cell(Boolean(r.b), str(r.bText), true)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Numbered vertical timeline with a short description per step. */
function ShaverHowTo({ d }: { d: D }) {
  return (
    <section className="flex flex-col gap-4 px-[18px] sec-y">
      {str(d.title) && <h2 className="m-0 text-center text-[24px] font-extrabold tracking-tight"><Rich text={str(d.title)} /></h2>}
      <ol className="m-0 flex list-none flex-col gap-3 p-0">
        {list(d.steps).map((s, i) => (
          <li key={i} className="flex items-center gap-3">
            <span className="border-accent text-accent bg-ground grid h-11 w-11 flex-none place-items-center rounded-full border-2 text-sm font-bold">{toBn(String(i + 1).padStart(2, "0"))}</span>
            <div className="bg-card r-md flex flex-1 flex-col gap-0.5 px-4 py-3">
              <span className="flex items-center gap-2 text-[15px] font-bold"><span className="text-accent"><Icon name={str(s.icon)} size={16} /></span>{str(s.label)}</span>
              {str(s.text) && <span className="text-muted text-[13px]">{str(s.text)}</span>}
            </div>
          </li>
        ))}
      </ol>
      {list(d.videos).filter((v) => str(v.video)).map((v, i) => (
        <div key={i} className="border-line r-lg aspect-video w-full overflow-hidden border bg-black"><VideoPlayer src={str(v.video)} poster={str(v.poster)} label={str(v.label)} /></div>
      ))}
    </section>
  );
}

/** Rating summary + review cards with avatars. */
function ShaverReviews({ d }: { d: D }) {
  const bars = list(d.bars);
  return (
    <section className="flex flex-col gap-4 bg-band px-[18px] sec-y">
      <h2 className="m-0 text-center text-[22px] font-extrabold tracking-tight"><Rich text={str(d.title)} /></h2>
      {str(d.score) && (
        <div className="bg-card border-line r-lg flex items-center gap-4 border p-4">
          <div className="flex flex-col items-center">
            <span className="text-accent text-4xl leading-none font-extrabold">{str(d.score)}</span>
            <span className="text-accent text-sm tracking-widest">★★★★★</span>
            <span className="text-muted mt-1 text-[11px]">{str(d.count)}</span>
          </div>
          <div className="flex flex-1 flex-col gap-1">
            {bars.map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <span className="w-6 text-right">{str(b.star)}★</span>
                <span className="bg-line h-1.5 flex-1 overflow-hidden rounded-full"><span className="bg-accent block h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, Number(b.percent) || 0))}%` }} /></span>
                <span className="text-muted w-9">{toBn(Number(b.percent) || 0)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {str(d.delivered) && <p className="text-muted m-0 text-center text-xs">{str(d.delivered)}</p>}
      {list(d.items).map((r, i) => (
        <div key={i} className="bg-card border-line r-lg flex flex-col gap-2 border p-4">
          <div className="flex items-center gap-3">
            <span className="bg-tile h-11 w-11 flex-none overflow-hidden rounded-full"><Img src={str(r.avatar)} alt={str(r.name)} /></span>
            <div className="flex-1 leading-tight"><div className="text-[15px] font-bold">{str(r.name)} <span className="text-muted text-xs font-normal">{str(r.city)}</span></div><div className="text-accent text-sm tracking-widest">★★★★★</div></div>
            <span className="border-accent text-accent rounded-full border px-2 py-0.5 text-[11px] font-semibold">✓ ভেরিফায়েড ক্রেতা</span>
          </div>
          <p className="text-soft m-0 text-[15px]">“{str(r.text)}”</p>
        </div>
      ))}
    </section>
  );
}

/** Button-only call to action with an optional line under it. */
function ShaverCta({ d }: { d: D }) {
  return (
    <section className="flex flex-col gap-2 px-[18px] py-5 text-center">
      <OrderButton text={str(d.buttonText) || "অর্ডার করুন"} />
      {str(d.subtitle) && <p className="text-muted m-0 text-sm">{str(d.subtitle)}</p>}
    </section>
  );
}

export const shaver: Template = {
  key: "shaver",
  label: "Mini Shaver (bedamanush.com)",
  description: "Dark charcoal + orange. Photo hero, comparison table, before/after slider, rating summary, countdown and price sticky bar.",
  design: { theme: "dark", accentColor: "#E0663C", accentTextColor: "#FFFFFF", font: "hind", radius: "soft", spacing: "comfortable", buttonShape: "rounded", headlineSize: "normal", stickyStyle: "price", announcement: "", siteTitle: "Beda Manus – Stay hygienic stay safe!", metaDescription: "ব্ল্যাক মিনি শেভার — বল ও বগলে ৩০ সেকেন্ডে নিরাপদ শেভ। ক্যাশ অন ডেলিভারি।", ogImage: `${U}file_00000000ac188211a94680345a683660.webp`, thankYouTitle: "ধন্যবাদ! আপনার অর্ডার হয়েছে" },
  hideHeader: true,
  starterProducts: [{ name: "BLACK Mini Shaver", subtitle: "", price: 1390, comparePrice: null, image: `${U}Black-Skin-Friendly-Mini-Shaver-product-img-01-300x300.webp` }],
  starter: [
    { type: "hero", data: {
      logo: `${U}hero_brand_img_01.webp`, badge: "", titleLine1: "বলের লোম কাটতে গিয়ে", titleHighlight: "Skin কাটার ভয়?",
      subtitle: "গোপনাঙ্গ · বগল — সবচেয়ে নরম চামড়াতেও শতভাগ নিরাপদ", poster: `${U}file_00000000ac188211a94680345a683660.webp`, video: "", showPrice: false, ctaText: "", ribbonTop: "", ribbonBottom: "", videoLabel: "", thumbs: [],
      trust: [{ icon: "shield", label: "১ বছরের সার্ভিস ওয়ারেন্টি" }, { icon: "rotate", label: "৩০ দিনের রিপ্লেসমেন্ট গ্যারান্টি" }, { icon: "heart", label: "১১,০০০+ সন্তুষ্ট কাস্টমার" }],
    } },
    { type: "video", data: { title: "৬০ সেকেন্ডে দেখে নিন *কীভাবে কাজ করে*", video: "", poster: "", ratio: "1:1", ctaText: "এখনই অর্ডার করুন" } },
    { type: "comparison", data: {
      title: "সাধারণ রেজার বনাম *মিনি শেভার*", colA: "সাধারন রেজার", colB: "মিনি শেভার",
      rows: [
        { label: "কাটার ঝুঁকি", a: false, b: true, aText: "প্রতিবার ভয়", bText: "একদম নেই" },
        { label: "বল ও বগলে নিরাপদ", a: false, b: true, aText: "কাটার ঝুঁকি", bText: "শতভাগ নিরাপদ" },
        { label: "কালো দাগ / র‍্যাশ", a: false, b: true, aText: "দাগ পড়ে", bText: "পড়ে না" },
        { label: "ফোম / জেল লাগে", a: false, b: true, aText: "লাগে", bText: "লাগে না" },
        { label: "সময় লাগে", a: false, b: true, aText: "১০-১৫ মিনিট", bText: "৩০ সেকেন্ড" },
        { label: "খরচ", a: false, b: true, aText: "প্রতি মাসে খরচ", bText: "একবারই খরচ" },
      ],
    } },
    { type: "features", data: { kicker: "30 SEC CLEAN", image: `${U}Skin-Friendly-Mini-Shaver-product-img-01.webp`, badges: [{ label: "ওয়াটারপ্রুফ" }, { label: "টাইপ-সি চার্জ" }, { label: "৬০ মিনিট ব্যাকআপ" }] } },
    { type: "howto", data: {
      title: "", videosTitle: "", videos: [],
      steps: [
        { icon: "clock", label: "এক বাটনে অন", text: "ফোম বা জেল লাগে না" },
        { icon: "check", label: "৩০ সেকেন্ডে ক্লিন", text: "বলের মতো নরম জায়গাতেও কাটা নেই" },
        { icon: "droplet", label: "ধুয়ে রেখে দিন", text: "১০ সেকেন্ডেই পরিষ্কার" },
      ],
    } },
    { type: "beforeafter", data: {
      title: "লাইভ ছবিতে *পার্থক্য* দেখুন", before: `${U}file_0000000077f48211bae82aa8beb39ab8.webp`, after: `${U}file_0000000061288207af5a4d17e1567ec4.webp`,
      beforeLabel: "আগে", afterLabel: "পরে", beforeNote: "লালচে র‍্যাশ · কাটা দাগ", afterNote: "স্মুথ স্কিন · জ্বালা নেই", hint: "স্লাইডার ড্র্যাগ করে পার্থক্য দেখুন",
      checks: [{ label: "কাটার ভয় নেই" }, { label: "জ্বালা-পোড়া নেই" }], ctaText: "এখনই অর্ডার করুন",
    } },
    { type: "reviews", data: {
      title: "২০,০০০+ ক্রেতার ভরসা", score: "৪.৮", count: "২,৫৩০টি রিভিউ", delivered: "৬৬,০০০+ ডেলিভার্ড অর্ডার - সারা বাংলাদেশে",
      bars: [{ star: "৫", percent: 82 }, { star: "৪", percent: 14 }, { star: "৩", percent: 3 }, { star: "২", percent: 1 }, { star: "১", percent: 0 }],
      items: [
        { name: "রাকিব হাসান", city: "ঢাকা", avatar: `${U}review-1-R_RX59DP.webp`, text: "বগলে একবারও কাটেনি — আগে রেজরের কথা ভাবলেই ভয় হত।" },
        { name: "সাদমান ইসলাম", city: "চট্টগ্রাম", avatar: `${U}review-2-D88fo2oM.webp`, text: "৬০ সেকেন্ডেই ক্লিন। চার্জ থাকে অনেকদিন।" },
        { name: "তানভীর আহমেদ", city: "সিলেট", avatar: `${U}review-3-DD3DTwXK.webp`, text: "রেজরের ভয় আর মাসিক খরচ — দুটোই বাঁচলো।" },
      ],
    } },
    { type: "cta", data: { title: "", subtitle: "ক্যাশ অন ডেলিভারি · ফ্রি ডেলিভারি", buttonText: "এখনই অর্ডার করুন" } },
    { type: "countdown", data: { label: "অফার শেষ হতে বাকি", hours: 7, minutes: 30 } },
    { type: "order", data: { title: "অর্ডার ফর্ম", subtitle: "অর্ডারটি কনফার্ম করতে নিচের ফর্মটি পুরন করুন", nameLabel: "আপনার পূর্ন নাম", phoneLabel: "আপনার ফোন নাম্বার (11 Digits)", addressLabel: "আপনার বাসার পূর্ন ঠিকানা", buttonText: "অর্ডারটি প্লেস করুন", note: "সম্পূর্ণ ক্যাশ অন ডেলিভারি — প্রডাক্ট হাতে পেয়ে মূল্য পরিশোধ করবো।" } },
  ],
  components: { hero: ShaverHero, comparison: ShaverComparison, howto: ShaverHowTo, reviews: ShaverReviews, cta: ShaverCta },
};
