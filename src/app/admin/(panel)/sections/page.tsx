import Link from "next/link";
import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { SECTION_DEFS, SECTION_TYPES, type SectionType } from "@/lib/sections";
import { createSection, duplicateSection, moveSection, toggleSection } from "../../actions";

export default async function SectionsPage() {
  const rows = await db.select().from(schema.sections).orderBy(asc(schema.sections.position), asc(schema.sections.id));
  const existingSingles = new Set(rows.filter((r) => SECTION_DEFS[r.type as SectionType]?.single).map((r) => r.type));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="m-0 text-2xl font-bold">Page sections</h1>
        <p className="m-0 text-sm text-[#666]">The landing page shows these sections from top to bottom. Reorder, hide, edit or add new ones. Changes go live as soon as you save.</p>
      </div>

      <ol className="m-0 flex list-none flex-col gap-2 p-0">
        {rows.map((s, i) => {
          const def = SECTION_DEFS[s.type as SectionType];
          const title = typeof s.data.title === "string" && s.data.title ? s.data.title : typeof s.data.titleLine1 === "string" ? s.data.titleLine1 : "";
          return (
            <li key={s.id} className={`flex flex-wrap items-center gap-3 rounded-xl border bg-white p-3 ${s.enabled ? "border-[#e4e4e0]" : "border-dashed border-[#cfcfca] opacity-70"}`}>
              <span className="w-6 text-center text-sm font-bold text-[#888]">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="font-bold">{def?.label ?? s.type} {!s.enabled && <span className="ml-1 rounded bg-[#efefec] px-1.5 py-0.5 text-xs font-semibold text-[#666]">Hidden</span>}</div>
                <div className="truncate text-sm text-[#666]">{title}</div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <form action={moveSection}><input type="hidden" name="id" value={s.id} /><input type="hidden" name="dir" value="up" /><button className="admin-btn-ghost px-2.5" aria-label="Move up" disabled={i === 0}>↑</button></form>
                <form action={moveSection}><input type="hidden" name="id" value={s.id} /><input type="hidden" name="dir" value="down" /><button className="admin-btn-ghost px-2.5" aria-label="Move down" disabled={i === rows.length - 1}>↓</button></form>
                <form action={toggleSection}><input type="hidden" name="id" value={s.id} /><button className="admin-btn-ghost">{s.enabled ? "Hide" : "Show"}</button></form>
                {!def?.single && (
                  <form action={duplicateSection}><input type="hidden" name="id" value={s.id} /><button className="admin-btn-ghost">Duplicate</button></form>
                )}
                <Link href={`/admin/sections/${s.id}`} className="admin-btn no-underline">Edit</Link>
              </div>
            </li>
          );
        })}
      </ol>

      <form action={createSection} className="flex flex-wrap items-end gap-2 rounded-xl border border-[#e4e4e0] bg-white p-4">
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Add a new section
          <select name="type" className="admin-input w-auto">
            {SECTION_TYPES.filter((t) => !(SECTION_DEFS[t].single && existingSingles.has(t))).map((t) => (
              <option key={t} value={t}>{SECTION_DEFS[t].label} — {SECTION_DEFS[t].description}</option>
            ))}
          </select>
        </label>
        <button className="admin-btn">Add section</button>
        <p className="m-0 w-full text-xs text-[#777]">New sections start hidden so you can fill them in before they appear on the site.</p>
      </form>
    </div>
  );
}
