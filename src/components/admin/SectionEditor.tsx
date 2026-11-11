"use client";

import { useEffect, useState, useTransition } from "react";
import type { FieldDef } from "@/lib/sections";
import { FieldsEditor } from "./FieldsEditor";

type Obj = Record<string, unknown>;

/** Generic editor + save bar. `save` is a server action returning { ok }. */
export type FieldGroup = { title: string; description?: string; keys: string[] };

export function JsonFormEditor({ fields, initial, save, onData, groups }: { fields: FieldDef[]; initial: Obj; save: (data: Obj) => Promise<{ ok: boolean; savedAt: string }>; onData?: (d: Obj) => void; groups?: FieldGroup[] }) {
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
      {groups ? (
        groups.map((g) => (
          <section key={g.title} className="rounded-xl border border-[#e7e5df] bg-white p-5">
            <h2 className="m-0 text-lg font-extrabold">{g.title}</h2>
            {g.description && <p className="m-0 mt-0.5 mb-4 text-sm text-[#6f6e76]">{g.description}</p>}
            <div className={g.description ? "" : "mt-4"}>
              <FieldsEditor fields={fields.filter((f) => g.keys.includes(f.key))} value={data} idPrefix={`g-${g.title}`} onChange={(v) => { setData(v); onData?.(v); setDirty(true); setMsg(""); }} />
            </div>
          </section>
        ))
      ) : (
        <div className="rounded-xl border border-[#e7e5df] bg-white p-5">
          <FieldsEditor fields={fields} value={data} onChange={(v) => { setData(v); onData?.(v); setDirty(true); setMsg(""); }} />
        </div>
      )}
      <div className="sticky bottom-0 z-10 -mx-4 flex items-center gap-3 border-t border-[#e7e5df] bg-white/90 px-4 py-3 backdrop-blur">
        <button type="button" className="admin-btn" onClick={onSave} disabled={pending || !dirty}>{pending ? "Saving…" : "Save changes"}</button>
        <span role="status" className="text-sm text-[#555]">{dirty ? "You have unsaved changes." : msg}</span>
        <a href="/" target="_blank" rel="noreferrer" className="ml-auto text-sm">Preview site ↗</a>
      </div>
    </div>
  );
}
