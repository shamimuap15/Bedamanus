import { Icon } from "@/components/Icon";
import { VideoPlayer } from "@/components/landing/VideoPlayer";
import { Img, OrderButton, classicComponents, type Ctx, type D } from "@/components/landing/Sections";
import { list, str, taka, toBn } from "@/lib/sections";
import type { Template } from "./types";

/** Poster-style hero: big image on top, text and price on a floating card. */
function ShowcaseHero({ d, ctx }: { d: D; ctx: Ctx }) {
  const product = ctx.products[0];
  const video = str(d.video);
  return (
    <section className="flex flex-col pb-8">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-black">
        {video ? (
          <VideoPlayer src={video} poster={str(d.poster)} autoplay label={str(d.titleLine1)} />
        ) : (
          <Img src={str(d.poster)} alt={str(d.titleLine1)} eager className="bg-tile object-cover" />
        )}
        {str(d.ribbonTop) && (
          <div className="bg-accent absolute top-4 right-4 rounded-full px-4 py-2 text-center leading-[1.05]">
            <div className="text-xl font-extrabold">{str(d.ribbonTop)}</div>
            <div className="text-xs font-semibold">{str(d.ribbonBottom)}</div>
          </div>
        )}
      </div>
      <div className="bg-ground r-lg border-line relative z-10 mx-4 -mt-16 flex flex-col gap-3 border p-5 text-center shadow-[0_24px_60px_-24px_rgba(0,0,0,.45)]">
        {str(d.badge) && <span className="text-accent text-sm font-bold tracking-wide">{str(d.badge)}</span>}
        <h1 className="m-0 text-[length:var(--h1)] leading-[1.1] font-extrabold tracking-tight">
          {str(d.titleLine1)} {str(d.titleHighlight) && <span className="hl">{str(d.titleHighlight)}</span>}
        </h1>
        {str(d.subtitle) && <p className="text-soft m-0">{str(d.subtitle)}</p>}
        {d.showPrice !== false && product && (
          <div className="flex items-baseline justify-center gap-3">
            {product.comparePrice ? <span className="text-muted line-through">{taka(product.comparePrice)}</span> : null}
            <span className="text-[38px] leading-none font-extrabold">{taka(product.price)}</span>
          </div>
        )}
        {str(d.ctaText) && <OrderButton text={str(d.ctaText)} />}
        {list(d.trust).length > 0 && (
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-1">
            {list(d.trust).map((t, i) => (
              <span key={i} className="text-soft inline-flex items-center gap-1.5 text-sm"><span className="text-accent"><Icon name={str(t.icon)} size={18} /></span>{str(t.label)}</span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/** Products as a swipeable row of tall cards. */
function ShowcaseProducts({ d }: { d: D }) {
  return (
    <section className="flex flex-col gap-4 py-10">
      <h2 className="m-0 px-[18px] text-center text-[28px] font-extrabold tracking-tight">{str(d.title)}</h2>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-[18px] pb-2">
        {list(d.items).map((p, i) => (
          <div key={i} className="bg-card r-lg border-line w-[78%] flex-none snap-start overflow-hidden border">
            <div className="bg-tile aspect-[4/5]"><Img src={str(p.image1)} alt={str(p.name)} /></div>
            <div className="flex flex-col gap-2 p-4">
              <div className="flex items-center gap-2"><span className="bg-accent rounded-full px-2.5 py-0.5 text-sm font-bold">{toBn(String(i + 1).padStart(2, "0"))}</span><h3 className="m-0 text-lg font-bold">{str(p.name)}</h3></div>
              <p className="text-muted m-0 text-sm">{str(p.tags)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export const showcase: Template = {
  key: "showcase",
  label: "Showcase light",
  description: "Light, airy poster layout: full-width hero image with a floating card and swipeable product cards.",
  design: { theme: "warm", accentColor: "#FF6B3D", accentTextColor: "#FFFFFF", font: "anek", radius: "round", spacing: "airy", buttonShape: "pill", headlineSize: "big" },
  starter: [{ type: "hero" }, { type: "products" }, { type: "problems" }, { type: "gallery" }, { type: "reviews" }, { type: "faq" }, { type: "order" }],
  components: { hero: ShowcaseHero, products: ShowcaseProducts },
};


