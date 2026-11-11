"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { Product } from "@/db/schema";
import { DEFAULT_SETTINGS, DESIGN_FIELDS, SECTION_DEFS, SECTION_TYPES, type FieldDef, type SectionType } from "@/lib/sections";
import { designVars, fontHref } from "@/lib/design";
import { SectionRenderer, TEMPLATE_LIST, getTemplate } from "@/templates";
import { Announcement, Footer, Header, StickyBar } from "@/components/landing/Chrome";
import { FieldsEditor } from "../FieldsEditor";
import { addSectionRow, duplicateSectionRow, removeSectionRow, saveEditor } from "@/app/admin/actions";

type Obj = Record<string, unknown>;
type Sec = { id: number; type: string; data: Obj; enabled: boolean };
type View = { kind: "home" } | { kind: "add" } | { kind: "theme" } | { kind: "global" } | { kind: "page" } | { kind: "section"; id: number };

const GLOBAL_FIELDS: FieldDef[] = [
  { key: "logo", label: "Logo", type: "image" },
  { key: "announcement", label: "Top announcement bar (empty = hidden)", type: "text" },
  { key: "phone", label: "Phone number (shown)", type: "text" },
  { key: "phoneLink", label: "Phone number for calling (e.g. +8801719119992)", type: "text" },
  { key: "whatsapp", label: "WhatsApp number", type: "text" },
  { key: "facebookUrl", label: "Facebook page URL", type: "text" },
  { key: "address", label: "Footer address", type: "text" },
  { key: "stickyBar", label: "Show sticky order bar", type: "boolean" },
  { key: "stickyText", label: "Sticky bar button text", type: "text" },
];

const PAGE_FIELDS: FieldDef[] = [
  { key: "siteTitle", label: "Browser tab / SEO title", type: "text" },
  { key: "metaDescription", label: "SEO description", type: "textarea" },
  { key: "ogImage", label: "Share image (Facebook preview)", type: "image" },
  { key: "pixelId", label: "Meta (Facebook) Pixel ID for this page", type: "text", help: "Empty = use the site-wide Pixel." },
  { key: "thankYouTitle", label: "Thank-you page title", type: "text" },
  { key: "thankYouText", label: "Thank-you page message", type: "textarea" },
];
const PAGE_KEYS = new Set([...DESIGN_FIELDS, ...PAGE_FIELDS].map((f) => f.key));
/** Only the page-level keys whose value actually changed, so untouched fields keep inheriting the site-wide value. */
const changedKeys = (next: Obj, prev: Obj, keys: Set<string>) => Object.fromEntries(Object.entries(next).filter(([k, v]) => keys.has(k) && v !== prev[k]));

type PageInfo = { id: number; title: string; slug: string; template: string; isHome: boolean; settings: Obj };

const ICON_PATHS: Record<string, string> = {
  hero: "M3 4h18v11H3zM3 19h12",
  problems: "M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z",
  products: "M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8",
  comparison: "M3 5h18v14H3zM12 5v14M3 12h18",
  gallery: "M3 5h18v14H3zM8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM21 15l-5-5L5 19",
  howto: "M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01",
  reviews: "M12 2l3 7 7 .6-5.3 4.7 1.6 7.2L12 17.8 5.7 21.5l1.6-7.2L2 9.6 9 9z",
  faq: "M12 22a10 10 0 100-20 10 10 0 000 20zM9.1 9a3 3 0 115.8 1c0 2-3 2.5-3 4M12 17h.01",
  cta: "M5 12h14M13 6l6 6-6 6",
  video: "M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2zM10 9l5 3-5 3z",
  features: "M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z",
  beforeafter: "M8 5L3 12l5 7M16 5l5 7-5 7M12 3v18",
  countdown: "M12 8v4l3 2M12 22a9 9 0 100-18 9 9 0 000 18zM9 2h6",
  order: "M6 6h15l-1.5 9h-12zM6 6L5 3H2M9 20h.01M18 20h.01",
};
function SecIcon({ type, size = 18 }: { type: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={ICON_PATHS[type] ?? ICON_PATHS.hero} /></svg>
  );
}

const secTitle = (s: Sec) => {
  const d = s.data;
  const t = typeof d.title === "string" && d.title ? d.title : typeof d.titleLine1 === "string" ? d.titleLine1 : "";
  return t;
};

export function ThemeEditor({ page, pages, initialSite, initialSections, products }: { page: PageInfo; pages: { id: number; title: string; isHome: boolean }[]; initialSite: Obj; initialSections: Sec[]; products: Product[] }) {
  const [site, setSite] = useState<Obj>(initialSite);
  const [pageSettings, setPageSettings] = useState<Obj>(page.settings);
  const [meta, setMeta] = useState<Obj>({ title: page.title, slug: page.slug, template: page.template });
  // Effective settings for this page: defaults < site-wide < page overrides (same order the live site uses).
  const settings = useMemo<Obj>(() => ({ ...DEFAULT_SETTINGS, ...site, ...pageSettings }), [site, pageSettings]);
  const [sections, setSections] = useState<Sec[]>(initialSections);
  const [saved, setSaved] = useState(() => JSON.stringify({ site: initialSite, pageSettings: page.settings, meta: { title: page.title, slug: page.slug, template: page.template }, sections: initialSections }));
  const [view, setView] = useState<View>({ kind: "home" });
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const previewRef = useRef<HTMLDivElement>(null);

  const dirty = useMemo(() => JSON.stringify({ site, pageSettings, meta, sections }) !== saved, [site, pageSettings, meta, sections, saved]);

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const touch = () => setMsg("");
  const patchSection = (id: number, f: (s: Sec) => Sec) => { setSections((all) => all.map((s) => (s.id === id ? f(s) : s))); touch(); };
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= sections.length) return;
    const next = [...sections];
    [next[i], next[j]] = [next[j], next[i]];
    setSections(next); touch();
  };

  function focusSection(id: number) {
    setView({ kind: "section", id });
    requestAnimationFrame(() => document.getElementById(`pv-sec-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function onSave() {
    start(async () => {
      try {
        await saveEditor({
          pageId: page.id,
          site,
          page: { title: String(meta.title ?? ""), slug: String(meta.slug ?? ""), template: String(meta.template ?? "classic"), settings: pageSettings },
          sections: sections.map(({ id, data, enabled }) => ({ id, data, enabled })),
        });
        setSaved(JSON.stringify({ site, pageSettings, meta, sections }));
        setMsg("Published — live on the site.");
      } catch {
        setMsg("Could not save. Check your connection and try again.");
      }
    });
  }

  async function onAdd(type: SectionType) {
    try {
      const row = await addSectionRow(page.id, type);
      setSections((all) => [...all, { ...row, enabled: true }]);
      setSaved((s) => { const p = JSON.parse(s); p.sections.push(row); return JSON.stringify(p); });
      setView({ kind: "section", id: row.id });
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not add section.");
    }
  }

  async function onDuplicate(id: number) {
    try {
      const row = await duplicateSectionRow(id);
      setSections((all) => {
        const i = all.findIndex((x) => x.id === id);
        const next = [...all];
        next.splice(i + 1, 0, { ...row, enabled: true });
        return next;
      });
      setSaved((s) => { const p = JSON.parse(s); p.sections.push(row); return JSON.stringify(p); });
      focusSection(row.id);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not duplicate.");
    }
  }

  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  function dropOn(to: number) {
    if (dragFrom === null || dragFrom === to) return;
    const next = [...sections];
    const [it] = next.splice(dragFrom, 1);
    next.splice(to, 0, it);
    setSections(next); touch();
  }

  async function onDelete(id: number) {
    if (!confirm("Delete this section permanently?")) return;
    await removeSectionRow(id);
    setSections((all) => all.filter((s) => s.id !== id));
    setSaved((s) => { const p = JSON.parse(s); p.sections = p.sections.filter((x: Sec) => x.id !== id); return JSON.stringify(p); });
    setView({ kind: "home" });
  }

  const existingSingles = new Set(sections.filter((s) => SECTION_DEFS[s.type as SectionType]?.single).map((s) => s.type));
  const current = view.kind === "section" ? sections.find((s) => s.id === view.id) : undefined;
  const font = fontHref(settings);
  const ctx = { settings: settings as never, products, pageId: page.id };
  const selId = view.kind === "section" ? view.id : null;

  return (
    <div className="admin-root fixed inset-0 flex flex-col">
      <header className="flex items-center gap-3 border-b border-[#e7e5df] bg-white px-4 py-2.5">
        <Link href="/admin" className="admin-btn-ghost min-h-0 px-3 py-1.5 no-underline">← Admin</Link>
        <label className="sr-only" htmlFor="page-switch">Page</label>
        <select
          id="page-switch" value={page.id} className="admin-input w-auto max-w-[220px] !py-1.5 font-bold"
          onChange={(e) => { if (e.target.value === "new") window.location.href = "/admin/pages"; else if (!dirty || confirm("Discard unsaved changes?")) window.location.href = `/admin/editor?page=${e.target.value}`; }}
        >
          {pages.map((p) => <option key={p.id} value={p.id}>{p.title}{p.isHome ? " (home)" : ""}</option>)}
          <option value="new">+ New page…</option>
        </select>
        <span role="status" className="ml-2 hidden text-sm text-[#6f6e76] sm:inline">{dirty ? "Unsaved changes" : msg}</span>
        <a href={page.isHome ? "/" : `/${String(meta.slug)}`} target="_blank" rel="noreferrer" className="ml-auto text-sm">View live ↗</a>
        <button type="button" className="admin-btn" onClick={onSave} disabled={pending || !dirty}>{pending ? "Saving…" : "Save & publish"}</button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {/* ---------- left panel ---------- */}
        <aside className="flex max-h-[45vh] w-full flex-none flex-col overflow-y-auto border-b border-[#e7e5df] bg-white md:max-h-none md:w-[360px] md:border-r md:border-b-0">
          {view.kind === "home" && (
            <div className="flex flex-col gap-5 p-4">
              <div className="flex flex-col gap-2">
                <div className="admin-eyebrow">Theme</div>
                <NavRow title="Design" sub="Colours, font, corners, spacing — this page" onClick={() => setView({ kind: "theme" })} />
                <NavRow title="Page settings" sub="Name, URL, template, SEO, pixel, thank-you" onClick={() => setView({ kind: "page" })} />
                <NavRow title="Header, footer & contact" sub="Shared by every page" onClick={() => setView({ kind: "global" })} />
              </div>
              <div className="flex flex-col gap-2">
                <div>
                  <div className="admin-eyebrow">Page layout</div>
                  <p className="m-0 mt-1 text-xs text-[#6f6e76]">Sections show top to bottom. Click one to edit it, drag <span aria-hidden>⠿</span> to reorder.</p>
                </div>
                <ol className="m-0 flex list-none flex-col gap-1.5 p-0" onDragLeave={() => setDragOver(null)}>
                  {sections.map((s, i) => {
                    const def = SECTION_DEFS[s.type as SectionType];
                    const active = selId === s.id;
                    return (
                      <li
                        key={s.id}
                        draggable
                        onDragStart={() => setDragFrom(i)}
                        onDragEnd={() => { setDragFrom(null); setDragOver(null); }}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(i); }}
                        onDrop={(e) => { e.preventDefault(); dropOn(i); setDragFrom(null); setDragOver(null); }}
                        className={`group/row relative flex items-center gap-1 rounded-xl border p-1.5 transition ${active ? "border-[#2457d6] bg-[#f3f7ff]" : s.enabled ? "border-[#e7e5df] bg-white hover:border-[#bdbab0]" : "border-dashed border-[#cfccc3] bg-[#faf9f6]"} ${dragOver === i && dragFrom !== null && dragFrom !== i ? "shadow-[0_-3px_0_0_#2457d6]" : ""} ${dragFrom === i ? "opacity-40" : ""}`}
                      >
                        <span aria-hidden title="Drag to reorder" className="cursor-grab px-1 text-[#9a9aa4] select-none">⠿</span>
                        <button type="button" onClick={() => focusSection(s.id)} className={`flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1 text-left ${s.enabled ? "" : "opacity-55"}`}>
                          <span className={`grid h-9 w-9 flex-none place-items-center rounded-lg ${active ? "bg-[#2457d6] text-white" : "bg-[#f3f2ee] text-[#121214]"}`}><SecIcon type={s.type} /></span>
                          <span className="min-w-0">
                            <span className="block text-sm font-bold">{def?.label ?? s.type}{!s.enabled && <span className="ml-1.5 rounded bg-[#efefec] px-1.5 py-0.5 text-[10px] font-bold text-[#666] uppercase">Hidden</span>}</span>
                            <span className="block truncate text-xs text-[#6f6e76]">{secTitle(s) || def?.description}</span>
                          </span>
                        </button>
                        <IconBtn label={s.enabled ? "Hide section" : "Show section"} onClick={() => patchSection(s.id, (x) => ({ ...x, enabled: !x.enabled }))}>{s.enabled ? "👁" : "⊘"}</IconBtn>
                        <details className="relative">
                          <summary aria-label="More actions" className="grid h-8 w-8 cursor-pointer list-none place-items-center rounded-lg text-lg hover:bg-[#f3f2ee]">⋯</summary>
                          <div className="absolute right-0 z-20 mt-1 flex w-40 flex-col rounded-xl border border-[#e7e5df] bg-white p-1 shadow-[0_20px_50px_-20px_rgba(18,18,20,.35)]">
                            <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-[#f3f2ee] disabled:opacity-35">Move up</button>
                            <button type="button" disabled={i === sections.length - 1} onClick={() => move(i, 1)} className="cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-[#f3f2ee] disabled:opacity-35">Move down</button>
                            {!def?.single && <button type="button" onClick={() => onDuplicate(s.id)} className="cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-[#f3f2ee]">Duplicate</button>}
                            <button type="button" onClick={() => onDelete(s.id)} className="cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#b42318] hover:bg-[#fdecea]">Delete</button>
                          </div>
                        </details>
                      </li>
                    );
                  })}
                </ol>
                <button type="button" onClick={() => setView({ kind: "add" })} className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#cfccc3] text-sm font-bold text-[#121214] transition hover:border-[#121214] hover:bg-[#faf9f6]">
                  <span aria-hidden className="text-lg leading-none">+</span> Add section
                </button>
              </div>
            </div>
          )}

          {view.kind === "add" && (
            <Panel title="Add a section" subtitle="Pick a building block. It is added at the bottom of the page — drag it where you want it." onBack={() => setView({ kind: "home" })}>
              <div className="grid gap-2">
                {SECTION_TYPES.map((t) => {
                  const def = SECTION_DEFS[t];
                  const used = def.single && existingSingles.has(t);
                  return (
                    <button
                      key={t} type="button" disabled={used} onClick={() => onAdd(t)}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#e7e5df] p-3 text-left transition hover:border-[#121214] disabled:cursor-default disabled:opacity-50 disabled:hover:border-[#e7e5df]"
                    >
                      <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-[#f3f2ee]"><SecIcon type={t} size={22} /></span>
                      <span className="min-w-0">
                        <span className="block text-sm font-extrabold">{def.label}{used && <span className="ml-1.5 text-xs font-semibold text-[#6f6e76]">· already on this page</span>}</span>
                        <span className="block text-xs leading-snug text-[#6f6e76]">{def.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </Panel>
          )}

          {view.kind === "theme" && (
            <Panel title="Design" onBack={() => setView({ kind: "home" })}>
              <FieldsEditor fields={DESIGN_FIELDS} value={settings} onChange={(v) => { setPageSettings((p) => ({ ...p, ...changedKeys(v, settings, PAGE_KEYS) })); touch(); }} idPrefix="design" />
            </Panel>
          )}
          {view.kind === "global" && (
            <Panel title="Header, footer & contact" onBack={() => setView({ kind: "home" })}>
              <FieldsEditor fields={GLOBAL_FIELDS} value={site} onChange={(v) => { setSite(v); touch(); }} idPrefix="global" />
            </Panel>
          )}
          {view.kind === "page" && (
            <Panel title="Page settings" onBack={() => setView({ kind: "home" })}>
              <div className="flex flex-col gap-4">
                <FieldsEditor
                  fields={[
                    { key: "title", label: "Page name (admin only)", type: "text" },
                    ...(page.isHome ? [] : [{ key: "slug", label: "URL slug", type: "text" as const, help: `yourdomain.com/${String(meta.slug)}` }]),
                    { key: "template", label: "Template (layout)", type: "choice", options: TEMPLATE_LIST.map((t) => ({ value: t.key, label: t.label })), help: "Changes the layout code only; your content stays." },
                  ]}
                  value={meta}
                  onChange={(v) => { setMeta(v); touch(); }}
                  idPrefix="meta"
                />
                <FieldsEditor fields={PAGE_FIELDS} value={settings} onChange={(v) => { setPageSettings((p) => ({ ...p, ...changedKeys(v, settings, PAGE_KEYS) })); touch(); }} idPrefix="pagefields" />
              </div>
            </Panel>
          )}
          {view.kind === "section" && current && (
            <Panel
              title={SECTION_DEFS[current.type as SectionType]?.label ?? current.type}
              subtitle={SECTION_DEFS[current.type as SectionType]?.description}
              onBack={() => setView({ kind: "home" })}
              actions={
                <>
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                    <input type="checkbox" className="h-4 w-4" checked={current.enabled} onChange={(e) => patchSection(current.id, (x) => ({ ...x, enabled: e.target.checked }))} />
                    Visible on site
                  </label>
                  <button type="button" className="admin-btn-ghost admin-btn-danger ml-auto min-h-0 px-3 py-1.5" onClick={() => onDelete(current.id)}>Delete</button>
                </>
              }
            >
              <FieldsEditor
                key={current.id}
                fields={SECTION_DEFS[current.type as SectionType].fields}
                value={current.data}
                onChange={(v) => patchSection(current.id, (x) => ({ ...x, data: v }))}
                idPrefix={`sec${current.id}`}
              />
            </Panel>
          )}
        </aside>

        {/* ---------- live preview ---------- */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-[#e9e7e1] p-4 md:p-8" ref={previewRef}>
          {font && <link rel="stylesheet" href={font} />}
          <div
            style={designVars(settings)}
            className="bg-ground text-fg relative mx-auto w-full max-w-[480px] overflow-hidden rounded-[28px] leading-normal shadow-[0_30px_80px_-30px_rgba(18,18,20,.45)]"
            onClickCapture={(e) => {
              const t = (e.target as HTMLElement).closest("[data-pv]") as HTMLElement | null;
              e.preventDefault();
              if (!t) return;
              const v = t.dataset.pv!;
              if (v === "global") setView({ kind: "global" });
              else setView({ kind: "section", id: Number(v) });
            }}
          >
            <Pv id="global" label="Header" selected={view.kind === "global"}>
              <Announcement s={settings} />
              {!getTemplate(String(meta.template)).hideHeader && <Header s={settings} />}
            </Pv>
            <main>
              {sections.filter((s) => s.enabled).map((s) => (
                <Pv key={s.id} id={String(s.id)} domId={`pv-sec-${s.id}`} label={SECTION_DEFS[s.type as SectionType]?.label ?? s.type} selected={selId === s.id}>
                  <SectionRenderer template={String(meta.template)} type={s.type} data={s.data} ctx={ctx} />
                </Pv>
              ))}
            </main>
            <Footer s={settings} />
            <StickyBar s={settings} price={products[0]?.price} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Pv({ id, domId, label, selected, children }: { id: string; domId?: string; label: string; selected: boolean; children: React.ReactNode }) {
  return (
    <div id={domId} data-pv={id} className={`group/pv relative cursor-pointer outline-2 -outline-offset-2 transition-[outline-color] ${selected ? "outline outline-[#2457d6]" : "outline outline-transparent hover:outline-[#2457d6]/50"}`}>
      <span className={`pointer-events-none absolute top-1 left-1 z-10 rounded bg-[#2457d6] px-2 py-0.5 text-[11px] font-bold text-white ${selected ? "" : "opacity-0 group-hover/pv:opacity-100"}`}>{label}</span>
      {children}
    </div>
  );
}

function NavRow({ title, sub, onClick }: { title: string; sub: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#e7e5df] px-3 py-2.5 text-left transition hover:border-[#121214]">
      <span><span className="block text-sm font-bold">{title}</span><span className="block text-xs text-[#6f6e76]">{sub}</span></span>
      <span aria-hidden>›</span>
    </button>
  );
}

function IconBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick} className="grid h-8 w-8 flex-none cursor-pointer place-items-center rounded-lg text-sm hover:bg-[#f3f2ee] disabled:cursor-default disabled:opacity-30">{children}</button>
  );
}

function Panel({ title, subtitle, onBack, actions, children }: { title: string; subtitle?: string; onBack: () => void; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 flex flex-col gap-2 border-b border-[#e7e5df] bg-white p-4">
        <button type="button" onClick={onBack} className="self-start cursor-pointer text-sm font-semibold text-[#6f6e76] hover:text-[#121214]">← Back to page</button>
        <h2 className="m-0 text-xl font-extrabold tracking-tight">{title}</h2>
        {subtitle && <p className="m-0 text-sm text-[#6f6e76]">{subtitle}</p>}
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
