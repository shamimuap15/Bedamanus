import Script from "next/script";
import { FacebookIcon, Icon, WhatsAppIcon } from "@/components/Icon";
import { str, taka, type Settings } from "@/lib/sections";

export function Announcement({ s }: { s: Settings }) {
  if (!str(s.announcement)) return null;
  return <div className="bg-accent px-3.5 py-2 text-center text-sm font-bold">{str(s.announcement)}</div>;
}

export function Header({ s }: { s: Settings }) {
  return (
    <header className="border-line flex items-center justify-between gap-3 border-b px-[18px] py-3">
      {str(s.logo) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={str(s.logo)} alt="BedaManush" className="block h-10 w-auto" />
      ) : (
        <span className="text-xl font-bold">BedaManush</span>
      )}
      {str(s.phone) && (
        <a href={`tel:${str(s.phoneLink) || str(s.phone)}`} className="text-fg inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold no-underline">
          <span className="text-accent"><Icon name="phone" size={18} strokeWidth={2} /></span>
          {str(s.phone)}
        </a>
      )}
    </header>
  );
}

export function Footer({ s }: { s: Settings }) {
  const circle = "bg-card text-accent flex h-11 w-11 items-center justify-center rounded-full";
  return (
    <footer className="text-muted flex flex-col items-center gap-3.5 px-[18px] pt-7 pb-6 text-center text-sm">
      {str(s.logo) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={str(s.logo)} alt="BedaManush" className="block h-[52px] w-auto" loading="lazy" />
      )}
      <div className="flex justify-center gap-2.5">
        {str(s.phone) && (
          <a href={`tel:${str(s.phoneLink) || str(s.phone)}`} aria-label="কল করুন" className={circle}><Icon name="phone" size={20} strokeWidth={2} /></a>
        )}
        {str(s.whatsapp) && (
          <a href={`https://wa.me/${str(s.whatsapp).replace(/\D/g, "")}`} aria-label="WhatsApp" className={circle}><WhatsAppIcon /></a>
        )}
        {str(s.facebookUrl) && (
          <a href={str(s.facebookUrl)} aria-label="Facebook" className={circle}><FacebookIcon /></a>
        )}
      </div>
      <span>{[str(s.address), `© ${new Date().getFullYear()} BedaManush`].filter(Boolean).join(" · ")}</span>
    </footer>
  );
}

export function StickyBar({ s, price }: { s: Settings; price?: number }) {
  if (s.stickyBar === false) return null;
  return (
    <div className="bg-ground border-line sticky bottom-0 z-20 flex items-center gap-2.5 border-t px-3.5 py-2.5">
      {str(s.phone) && (
        <a href={`tel:${str(s.phoneLink) || str(s.phone)}`} aria-label="কল করুন" className="border-line2 text-fg flex h-[52px] w-[52px] flex-none items-center justify-center rounded-xl border">
          <Icon name="phone" size={20} strokeWidth={2} />
        </a>
      )}
      <a href="#order" className="bg-accent flex min-h-[52px] flex-1 items-center justify-center rounded-xl text-lg font-bold no-underline">
        {str(s.stickyText) || "অর্ডার করুন"}
        {price ? ` · ${taka(price)}` : ""}
      </a>
    </div>
  );
}

/** Meta Pixel base code. Only rendered when a Pixel ID is set in admin settings. */
export function MetaPixel({ pixelId, viewContent }: { pixelId: string; viewContent?: { value: number; ids: string[] } }) {
  const id = pixelId.replace(/\D/g, "");
  if (!id) return null;
  const vc = viewContent
    ? `fbq('track','ViewContent',{value:${viewContent.value},currency:'BDT',content_ids:${JSON.stringify(viewContent.ids)},content_type:'product'});`
    : "";
  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');fbq('track','PageView');${vc}`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img height="1" width="1" style={{ display: "none" }} alt="" src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`} />
      </noscript>
    </>
  );
}

export function accentStyle(s: Settings): React.CSSProperties {
  const hex = (v: unknown, fb: string) => (typeof v === "string" && /^#[0-9a-f]{3,8}$/i.test(v) ? v : fb);
  return {
    ["--accent" as string]: hex(s.accentColor, "#C8FF3D"),
    ["--on-accent" as string]: hex(s.accentTextColor, "#1F1F1F"),
  };
}
