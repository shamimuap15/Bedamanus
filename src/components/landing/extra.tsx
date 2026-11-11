"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { list, num, str, toBn } from "@/lib/sections";
import { Img, OrderButton, type D } from "./Sections";
import { VideoPlayer } from "./VideoPlayer";

/** Wrap words in *stars* to colour them with the accent. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*[^*]+\*)/g).map((part, i) =>
        part.startsWith("*") && part.endsWith("*") && part.length > 2 ? <span key={i} className="text-accent">{part.slice(1, -1)}</span> : <span key={i}>{part}</span>,
      )}
    </>
  );
}

export function Features({ d }: { d: D }) {
  const badges = list(d.badges);
  return (
    <section className="flex flex-col items-center gap-4 px-[18px] sec-y">
      {str(d.kicker) && <div className="text-accent text-sm font-extrabold tracking-[.2em]">{str(d.kicker)}</div>}
      {str(d.image) && (
        <div className="aspect-square w-full max-w-[360px] overflow-hidden r-lg"><Img src={str(d.image)} alt={str(d.kicker)} className="object-contain" /></div>
      )}
      {badges.length > 0 && (
        <div className="grid w-full gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(badges.length, 3)}, minmax(0,1fr))` }}>
          {badges.map((b, i) => (
            <div key={i} className="border-accent text-accent flex min-h-[44px] items-center justify-center rounded-full border px-2 py-2 text-center text-[13px] font-bold">{str(b.label)}</div>
          ))}
        </div>
      )}
    </section>
  );
}

export function BeforeAfter({ d }: { d: D }) {
  const [pos, setPos] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const move = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (r) setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };
  return (
    <section className="flex flex-col gap-4 px-[18px] sec-y">
      <h2 className="m-0 text-center text-[26px] font-extrabold tracking-tight"><Rich text={str(d.title)} /></h2>
      <div
        ref={box}
        className="r-lg relative aspect-[4/5] w-full touch-none overflow-hidden select-none"
        onPointerDown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); move(e.clientX); }}
        onPointerMove={(e) => { if (e.buttons) move(e.clientX); }}
      >
        <Img src={str(d.after)} alt={str(d.afterLabel)} />
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <Img src={str(d.before)} alt={str(d.beforeLabel)} />
        </div>
        <div className="absolute top-0 bottom-0 w-0.5 bg-white" style={{ left: `${pos}%` }} />
        <div className="bg-accent absolute top-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-sm font-bold" style={{ left: `${pos}%` }} aria-hidden>⇄</div>
        <div className="absolute bottom-3 left-3 rounded-lg bg-black/70 px-2.5 py-1.5 text-xs leading-tight text-white"><b>{str(d.beforeLabel)}</b><br />{str(d.beforeNote)}</div>
        <div className="absolute right-3 bottom-3 rounded-lg bg-black/70 px-2.5 py-1.5 text-right text-xs leading-tight text-white"><b>{str(d.afterLabel)}</b><br />{str(d.afterNote)}</div>
      </div>
      {str(d.hint) && <p className="text-muted m-0 text-center text-xs">{str(d.hint)}</p>}
      {list(d.checks).length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {list(d.checks).map((c, i) => (
            <span key={i} className="border-line2 text-soft flex items-center justify-center gap-1.5 rounded-full border px-2 py-2 text-[13px] font-semibold">
              <span className="text-accent"><Icon name="check" size={14} strokeWidth={3} /></span>{str(c.label)}
            </span>
          ))}
        </div>
      )}
      {str(d.ctaText) && <OrderButton text={str(d.ctaText)} />}
    </section>
  );
}

export function Countdown({ d }: { d: D }) {
  const total = Math.max(1, num(d.hours) * 3600 + num(d.minutes) * 60);
  const [left, setLeft] = useState(total);
  useEffect(() => {
    const end = Date.now() + total * 1000;
    const t = setInterval(() => setLeft(Math.max(0, Math.round((end - Date.now()) / 1000))), 1000);
    return () => clearInterval(t);
  }, [total]);
  const cell = (v: number, label: string) => (
    <div className="bg-card border-line r-sm flex min-w-[64px] flex-col items-center border px-3 py-2">
      <span className="text-accent text-2xl leading-none font-extrabold">{toBn(String(v).padStart(2, "0"))}</span>
      <span className="text-muted text-[10px] font-bold tracking-widest">{label}</span>
    </div>
  );
  return (
    <section className="flex flex-col items-center gap-3 px-[18px] py-6">
      {str(d.label) && <div className="border-accent text-accent rounded-full border px-4 py-1.5 text-sm font-bold">{str(d.label)}</div>}
      <div className="flex items-center gap-2">
        {cell(Math.floor(left / 3600), "HRS")}<span className="text-accent font-bold">:</span>{cell(Math.floor((left % 3600) / 60), "MIN")}<span className="text-accent font-bold">:</span>{cell(left % 60, "SEC")}
      </div>
    </section>
  );
}

const RATIOS: Record<string, string> = { "16:9": "aspect-video", "1:1": "aspect-square", "9:16": "aspect-[9/16] max-w-[320px] mx-auto" };

export function VideoSection({ d }: { d: D }) {
  if (!str(d.video)) return null;
  return (
    <section className="flex flex-col gap-4 px-[18px] sec-y">
      {str(d.title) && <h2 className="m-0 text-center text-[24px] font-extrabold tracking-tight"><Rich text={str(d.title)} /></h2>}
      <div className={`border-line r-lg w-full overflow-hidden border bg-black ${RATIOS[str(d.ratio)] ?? RATIOS["16:9"]}`}>
        <VideoPlayer src={str(d.video)} poster={str(d.poster)} label={str(d.title)} />
      </div>
      {str(d.ctaText) && <OrderButton text={str(d.ctaText)} />}
    </section>
  );
}
