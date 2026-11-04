import { Icon } from "@/components/Icon";
import { list, str, taka, toBn, type Settings } from "@/lib/sections";
import type { Product } from "@/db/schema";
import { OrderForm } from "./OrderForm";

type D = Record<string, unknown>;
type Ctx = { settings: Settings; products: Product[] };

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="m-0 text-center text-[26px] font-bold leading-tight">{children}</h2>
);

function Img({ src, alt, className = "", eager = false }: { src: string; alt: string; className?: string; eager?: boolean }) {
  if (!src) return <div className={`bg-tile ${className}`} aria-hidden />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" className={`block h-full w-full object-cover ${className}`} />;
}

function OrderButton({ text, className = "" }: { text: string; className?: string }) {
  return (
    <a
      href="#order"
      className={`bg-accent flex min-h-[58px] items-center justify-center gap-2.5 rounded-[14px] text-xl font-bold no-underline ${className}`}
    >
      {text}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </a>
  );
}

/* ---------------- HERO ---------------- */
function Hero({ d, ctx }: { d: D; ctx: Ctx }) {
  const product = ctx.products[0];
  const video = str(d.video);
  const poster = str(d.poster);
  const autoplay = d.autoplay !== false;
  return (
    <section className="flex flex-col gap-[18px] px-[18px] pt-5 pb-9">
      <div className="flex flex-col items-center gap-3 text-center">
        {str(d.badge) && (
          <span className="bg-tint text-accent inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-sm font-bold">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 9v4M12 17h.01" />
              <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            </svg>
            {str(d.badge)}
          </span>
        )}
        <h1 className="m-0 text-[36px] leading-[1.15] font-bold">
          {str(d.titleLine1)}
          {str(d.titleHighlight) && (
            <>
              <br />
              <span className="hl">{str(d.titleHighlight)}</span>
            </>
          )}
        </h1>
        {str(d.subtitle) && <p className="text-soft m-0 text-lg">{str(d.subtitle)}</p>}
      </div>

      <div className="relative">
        <div className="border-line aspect-square overflow-hidden rounded-[22px] border bg-black">
          {video ? (
            <video
              src={video}
              poster={poster || undefined}
              controls
              playsInline
              muted={autoplay}
              autoPlay={autoplay}
              loop={autoplay}
              preload="metadata"
              aria-label={str(d.titleLine1)}
              className="block h-full w-full object-cover"
            />
          ) : (
            <Img src={poster} alt={str(d.titleLine1)} eager className="bg-tile object-contain" />
          )}
        </div>
        {video && str(d.videoLabel) && (
          <div className="bg-ground pointer-events-none absolute top-3 left-3 flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold">
            <span className="h-2 w-2 rounded-full" style={{ background: "var(--accent)" }} />
            {str(d.videoLabel)}
          </div>
        )}
        {str(d.ribbonTop) && (
          <div className="bg-accent pointer-events-none absolute right-3 bottom-3 rounded-[14px] px-3.5 py-2 text-center leading-[1.1]">
            <div className="text-[26px] font-bold">{str(d.ribbonTop)}</div>
            <div className="text-[13px] font-semibold">{str(d.ribbonBottom)}</div>
          </div>
        )}
      </div>

      {list(d.thumbs).length > 0 && (
        <div className="grid grid-cols-3 gap-2.5">
          {list(d.thumbs).map((t, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="bg-tile aspect-square w-full overflow-hidden rounded-[14px]">
                <Img src={str(t.image)} alt={str(t.label)} />
              </div>
              <span className="text-center text-[13px] font-semibold">{str(t.label)}</span>
            </div>
          ))}
        </div>
      )}

      {d.showPrice !== false && product && (
        <div className="flex items-center justify-center gap-3.5">
          {product.comparePrice ? <span className="text-muted text-[17px] line-through">{taka(product.comparePrice)}</span> : null}
          <span className="text-[32px] font-bold">{taka(product.price)}</span>
        </div>
      )}
      {str(d.ctaText) && <OrderButton text={str(d.ctaText)} />}

      {list(d.trust).length > 0 && (
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(list(d.trust).length, 3)}, minmax(0,1fr))` }}>
          {list(d.trust).map((t, i) => (
            <div key={i} className="bg-band flex flex-col items-center gap-1.5 rounded-[14px] px-1.5 py-3">
              <span className="text-accent"><Icon name={str(t.icon)} size={26} /></span>
              <span className="text-center text-[13px]">{str(t.label)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------------- PROBLEMS ---------------- */
function Problems({ d }: { d: D }) {
  return (
    <section className="bg-band flex flex-col gap-5 px-[18px] py-10">
      <H2>{str(d.title)}</H2>
      <div className="grid grid-cols-2 gap-2.5">
        {list(d.items).map((it, i) => (
          <div key={i} className="bg-card flex flex-col items-center gap-2.5 rounded-2xl px-3 py-[18px]">
            <span className="bg-tint text-accent flex h-[52px] w-[52px] items-center justify-center rounded-full">
              <Icon name="cross" size={26} strokeWidth={2.2} />
            </span>
            <span className="text-center text-base font-semibold">{str(it.label)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- PRODUCTS ---------------- */
function Products({ d }: { d: D }) {
  return (
    <section className="flex flex-col gap-[18px] px-[18px] py-10">
      <H2>{str(d.title)}</H2>
      {list(d.items).map((p, i) => {
        const imgs = [str(p.image1), str(p.image2)].filter(Boolean);
        const tags = str(p.tags).split(",").map((t) => t.trim()).filter(Boolean);
        return (
          <div key={i} className="bg-band border-line flex flex-col gap-3 rounded-[22px] border p-3">
            <div className={`grid gap-2 ${imgs.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
              {imgs.map((src, j) => (
                <div key={j} className="bg-tile aspect-square overflow-hidden rounded-2xl">
                  <Img src={src} alt={str(p.name)} />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2.5 px-1">
              <span className="bg-accent rounded-lg px-2 py-0.5 text-[15px] font-bold">{toBn(String(i + 1).padStart(2, "0"))}</span>
              <h3 className="m-0 text-[21px] font-bold">{str(p.name)}</h3>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 px-1 pb-1 text-sm">
                {tags.map((t, j) => (
                  <span key={j} className="bg-card rounded-full px-3 py-1">{t}</span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

/* ---------------- COMPARISON ---------------- */
function Comparison({ d }: { d: D }) {
  const yes = <span className="text-accent inline-flex"><Icon name="check" size={22} strokeWidth={3} label="হ্যাঁ" /></span>;
  const no = <span className="inline-flex text-[#8a8a91]"><Icon name="cross" size={20} strokeWidth={2.5} label="না" /></span>;
  return (
    <section className="bg-band flex flex-col gap-[18px] px-[18px] py-10">
      <H2>{str(d.title)}</H2>
      <table className="bg-card w-full border-separate border-spacing-0 overflow-hidden rounded-2xl text-base">
        <thead>
          <tr>
            <th scope="col" className="p-3.5 text-left"><span className="sr-only">বৈশিষ্ট্য</span></th>
            <th scope="col" className="text-muted w-[72px] px-2 py-3.5 font-semibold">{str(d.colA)}</th>
            <th scope="col" className="bg-accent w-[84px] px-2 py-3.5 font-bold">{str(d.colB)}</th>
          </tr>
        </thead>
        <tbody>
          {list(d.rows).map((r, i) => (
            <tr key={i}>
              <td className="border-line border-t px-3.5 py-3">{str(r.label)}</td>
              <td className="border-line border-t text-center">{r.a ? yes : no}</td>
              <td className="border-line bg-tint-2 border-t text-center">{r.b ? yes : no}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

/* ---------------- GALLERY ---------------- */
function Gallery({ d }: { d: D }) {
  return (
    <section className="flex flex-col gap-[18px] px-[18px] py-10">
      <H2>{str(d.title)}</H2>
      <div className="grid grid-cols-2 gap-2.5">
        {list(d.items).map((g, i) => (
          <div key={i} className={`bg-tile relative overflow-hidden rounded-[18px] ${g.wide ? "col-span-2 aspect-[5/4]" : "aspect-square"}`}>
            <Img src={str(g.image)} alt={str(g.caption)} />
            {str(g.caption) && (
              <span className="bg-ground absolute bottom-2.5 left-2.5 rounded-full px-3 py-1 text-[13px] font-semibold">{str(g.caption)}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- HOW TO ---------------- */
function HowTo({ d }: { d: D }) {
  const steps = list(d.steps);
  const videos = list(d.videos).filter((v) => str(v.video) || str(v.poster));
  return (
    <section className="bg-band flex flex-col gap-5 px-[18px] py-10">
      <H2>{str(d.title)}</H2>
      {steps.length > 0 && (
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(steps.length, 4)}, minmax(0,1fr))` }}>
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <span className="bg-card border-line2 text-accent flex h-[60px] w-[60px] items-center justify-center rounded-full border">
                <Icon name={str(s.icon)} size={28} />
              </span>
              <span className="text-center text-sm font-semibold">{str(s.label)}</span>
            </div>
          ))}
        </div>
      )}
      {videos.length > 0 && (
        <>
          {str(d.videosTitle) && (
            <div className="mt-2 flex items-center justify-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" className="text-accent" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>
              <span className="text-lg font-bold">{str(d.videosTitle)}</span>
            </div>
          )}
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(videos.length, 3)}, minmax(0,1fr))` }}>
            {videos.map((v, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="border-line aspect-[9/16] overflow-hidden rounded-[14px] border bg-black">
                  {str(v.video) ? (
                    <video src={str(v.video)} poster={str(v.poster) || undefined} controls playsInline preload="metadata" aria-label={str(v.label)} className="block h-full w-full object-cover" />
                  ) : (
                    <Img src={str(v.poster)} alt={str(v.label)} />
                  )}
                </div>
                {str(v.label) && <span className="text-center text-[13px] font-semibold">{str(v.label)}</span>}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

/* ---------------- REVIEWS ---------------- */
function Reviews({ d }: { d: D }) {
  const items = list(d.items);
  if (items.length === 0) return null;
  return (
    <section className="flex flex-col gap-[18px] px-[18px] py-10">
      <H2>{str(d.title)}</H2>
      <div className="-mx-[18px] flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-[18px] pb-1">
        {items.map((r, i) =>
          str(r.image) ? (
            <div key={i} className="bg-tile w-[62%] flex-none snap-start overflow-hidden rounded-[14px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={str(r.image)} alt={str(r.name) ? `${str(r.name)}-এর রিভিউ` : "গ্রাহকের রিভিউ"} loading="lazy" className="block h-auto w-full" />
            </div>
          ) : (
            <div key={i} className="bg-card flex w-[78%] flex-none snap-start flex-col gap-2.5 rounded-2xl p-5">
              <span className="text-accent text-lg tracking-[2px]" aria-label="৫ তারকা">★★★★★</span>
              <p className="text-soft m-0 text-base">{str(r.text)}</p>
              {str(r.name) && <span className="text-muted text-sm">{str(r.name)}</span>}
            </div>
          ),
        )}
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
function Faq({ d }: { d: D }) {
  const items = list(d.items);
  if (items.length === 0) return null;
  return (
    <section className="flex flex-col gap-4 px-[18px] py-10">
      <H2>{str(d.title)}</H2>
      <div className="flex flex-col gap-2.5">
        {items.map((f, i) => (
          <details key={i} className="border-line group rounded-[14px] border px-4 py-3.5">
            <summary className="flex min-h-[28px] cursor-pointer list-none items-center justify-between gap-3 text-[17px] font-bold">
              {str(f.q)}
              <span className="text-accent text-2xl leading-none transition group-open:rotate-45" aria-hidden>+</span>
            </summary>
            <p className="text-muted mt-2 mb-0 text-base">{str(f.a)}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/* ---------------- CTA ---------------- */
function Cta({ d }: { d: D }) {
  return (
    <section className="bg-tint flex flex-col gap-3 px-[18px] py-8 text-center">
      <h2 className="m-0 text-[26px] font-bold">{str(d.title)}</h2>
      {str(d.subtitle) && <p className="text-soft m-0">{str(d.subtitle)}</p>}
      <OrderButton text={str(d.buttonText) || "অর্ডার করুন"} />
    </section>
  );
}

/* ---------------- ORDER ---------------- */
function Order({ d, ctx }: { d: D; ctx: Ctx }) {
  return (
    <section id="order" className="bg-band border-accent flex scroll-mt-2 flex-col gap-4 border-t-2 px-[18px] pt-9 pb-10">
      <div className="flex flex-col gap-1 text-center">
        <H2>{str(d.title)}</H2>
        {str(d.subtitle) && <p className="text-muted m-0">{str(d.subtitle)}</p>}
      </div>
      <OrderForm
        products={ctx.products.map((p) => ({ id: p.id, name: p.name, subtitle: p.subtitle, price: p.price, comparePrice: p.comparePrice, image: p.image }))}
        labels={{
          name: str(d.nameLabel) || "নাম",
          phone: str(d.phoneLabel) || "মোবাইল",
          address: str(d.addressLabel) || "ঠিকানা",
          button: str(d.buttonText) || "অর্ডার কনফার্ম করুন",
          note: str(d.note),
        }}
        delivery={{
          inside: Number(ctx.settings.deliveryInside) || 0,
          outside: Number(ctx.settings.deliveryOutside) || 0,
          insideLabel: str(ctx.settings.insideLabel) || "ঢাকার ভেতরে",
          outsideLabel: str(ctx.settings.outsideLabel) || "ঢাকার বাইরে",
        }}
      />
    </section>
  );
}

export function SectionRenderer({ type, data, ctx }: { type: string; data: D; ctx: Ctx }) {
  switch (type) {
    case "hero": return <Hero d={data} ctx={ctx} />;
    case "problems": return <Problems d={data} />;
    case "products": return <Products d={data} />;
    case "comparison": return <Comparison d={data} />;
    case "gallery": return <Gallery d={data} />;
    case "howto": return <HowTo d={data} />;
    case "reviews": return <Reviews d={data} />;
    case "faq": return <Faq d={data} />;
    case "cta": return <Cta d={data} />;
    case "order": return <Order d={data} ctx={ctx} />;
    default: return null;
  }
}
