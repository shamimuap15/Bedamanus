import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { SECTION_DEFS, type SectionType } from "@/lib/sections";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteSection, toggleSection } from "../../../actions";

export default async function EditSection({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const section = await db.query.sections.findFirst({ where: eq(schema.sections.id, Number(id)) });
  if (!section) notFound();
  const def = SECTION_DEFS[section.type as SectionType];
  if (!def) notFound();

  return (
    <div className="flex flex-col gap-4">
      <Link href="/admin/sections" className="text-sm">← All sections</Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="m-0 text-2xl font-bold">{def.label}</h1>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${section.enabled ? "bg-[#e2f6e6] text-[#1f6b33]" : "bg-[#efefec] text-[#666]"}`}>{section.enabled ? "Visible on site" : "Hidden"}</span>
        <form action={toggleSection}><input type="hidden" name="id" value={section.id} /><button className="admin-btn-ghost">{section.enabled ? "Hide from site" : "Show on site"}</button></form>
      </div>
      <p className="m-0 text-sm text-[#666]">{def.description}</p>

      <SectionEditor id={section.id} fields={def.fields} initial={section.data} />

      <form action={deleteSection} className="border-t border-[#e4e4e0] pt-4">
        <input type="hidden" name="id" value={section.id} />
        <ConfirmButton message="Delete this section? This cannot be undone." className="admin-btn-ghost admin-btn-danger">Delete section</ConfirmButton>
      </form>
    </div>
  );
}
