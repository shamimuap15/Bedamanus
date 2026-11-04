"use client";

import { useEffect, useState, useTransition } from "react";
import type { FieldDef } from "@/lib/sections";
import { FieldsEditor } from "./FieldsEditor";
import { saveSection } from "@/app/admin/actions";

type Obj = Record<string, unknown>;

/** Generic editor + save bar. `save` is a server action returning { ok }. */
export function JsonFormEditor({ fields, initial, save }: { fields: FieldDef[]; initial: Obj; save: (data: Obj) => Promise<{ ok: boolean; savedAt: string }> }) {
  const [data, setData] = useState<Obj>(initial);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  function onSave() {
    start(async () => {
      try {
        await save(data);
        setDirty(false);
        setMsg("Saved — live on the site.");
      } catch {
        setMsg("Could not save. Check your connection and try again.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-[#e4e4e0] bg-white p-4">
        <FieldsEditor fields={fields} value={data} onChange={(v) => { setData(v); setDirty(true); setMsg(""); }} />
      </div>
      <div className="sticky bottom-0 z-10 -mx-4 flex items-center gap-3 border-t border-[#e4e4e0] bg-white/95 px-4 py-3 backdrop-blur">
        <button type="button" className="admin-btn" onClick={onSave} disabled={pending || !dirty}>{pending ? "Saving…" : "Save changes"}</button>
        <span role="status" className="text-sm text-[#555]">{dirty ? "You have unsaved changes." : msg}</span>
        <a href="/" target="_blank" rel="noreferrer" className="ml-auto text-sm">Preview site ↗</a>
      </div>
    </div>
  );
}

export function SectionEditor({ id, fields, initial }: { id: number; fields: FieldDef[]; initial: Obj }) {
  return <JsonFormEditor fields={fields} initial={initial} save={(d) => saveSection(id, d)} />;
}
