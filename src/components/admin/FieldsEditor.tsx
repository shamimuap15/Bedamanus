"use client";

import { ICONS, type FieldDef } from "@/lib/sections";
import { Icon } from "@/components/Icon";
import { MediaInput } from "./MediaInput";

type Obj = Record<string, unknown>;

export function FieldsEditor({ fields, value, onChange, idPrefix = "f" }: { fields: FieldDef[]; value: Obj; onChange: (v: Obj) => void; idPrefix?: string }) {
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v });
  return (
    <div className="flex flex-col gap-4">
      {fields.map((f) => (
        <Field key={f.key} def={f} id={`${idPrefix}-${f.key}`} value={value[f.key]} onChange={(v) => set(f.key, v)} />
      ))}
    </div>
  );
}

function Field({ def, id, value, onChange }: { def: FieldDef; id: string; value: unknown; onChange: (v: unknown) => void }) {
  const label = (
    <label htmlFor={id} className="text-sm font-semibold">
      {def.label}
      {def.help && <span className="ml-1 font-normal text-[#777]">— {def.help}</span>}
    </label>
  );
  const s = typeof value === "string" ? value : value == null ? "" : String(value);

  switch (def.type) {
    case "text":
      return <div className="flex flex-col gap-1">{label}<input id={id} value={s} onChange={(e) => onChange(e.target.value)} placeholder={def.placeholder} className="admin-input" /></div>;
    case "textarea":
      return <div className="flex flex-col gap-1">{label}<textarea id={id} value={s} onChange={(e) => onChange(e.target.value)} rows={3} className="admin-input" /></div>;
    case "number":
      return <div className="flex flex-col gap-1">{label}<input id={id} type="number" value={s} onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))} className="admin-input max-w-[200px]" /></div>;
    case "boolean":
      return (
        <label htmlFor={id} className="flex min-h-[32px] cursor-pointer items-center gap-2 text-sm font-semibold">
          <input id={id} type="checkbox" checked={value !== false && value != null && value !== ""} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4" />
          {def.label}
        </label>
      );
    case "color":
      return (
        <div className="flex flex-col gap-1">
          {label}
          <div className="flex items-center gap-2">
            <input aria-label={`${def.label} picker`} type="color" value={/^#[0-9a-f]{6}$/i.test(s) ? s : "#000000"} onChange={(e) => onChange(e.target.value.toUpperCase())} className="h-10 w-14 cursor-pointer rounded border border-[#d4d4d0]" />
            <input id={id} value={s} onChange={(e) => onChange(e.target.value)} className="admin-input max-w-[140px]" />
          </div>
        </div>
      );
    case "image":
    case "video":
      return <div className="flex flex-col gap-1">{label}<MediaInput id={id} kind={def.type} value={s} onChange={onChange} /></div>;
    case "icon":
      return (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold" id={id}>{def.label}</span>
          <div role="radiogroup" aria-labelledby={id} className="flex flex-wrap gap-1.5">
            {ICONS.map((name) => (
              <button
                type="button"
                key={name}
                role="radio"
                aria-checked={s === name}
                aria-label={name}
                title={name}
                onClick={() => onChange(name)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border ${s === name ? "border-[#1f1f1f] bg-[#1f1f1f] text-white" : "border-[#d4d4d0] bg-white text-[#1f1f1f]"}`}
              >
                <Icon name={name} size={20} />
              </button>
            ))}
          </div>
        </div>
      );
    case "list":
      return <ListField def={def} id={id} value={Array.isArray(value) ? (value as Obj[]) : []} onChange={onChange} />;
  }
}

function emptyItem(fields: FieldDef[]): Obj {
  const o: Obj = {};
  for (const f of fields) o[f.key] = f.type === "boolean" ? false : f.type === "list" ? [] : f.type === "number" ? 0 : f.type === "icon" ? "check" : "";
  return o;
}

function ListField({ def, id, value, onChange }: { def: Extract<FieldDef, { type: "list" }>; id: string; value: Obj[]; onChange: (v: Obj[]) => void }) {
  const update = (i: number, v: Obj) => onChange(value.map((it, j) => (j === i ? v : it)));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <fieldset className="m-0 flex flex-col gap-2 rounded-xl border border-[#e4e4e0] p-3">
      <legend className="px-1 text-sm font-bold">{def.label} <span className="font-normal text-[#777]">({value.length})</span></legend>
      {value.map((item, i) => (
        <details key={i} className="rounded-lg border border-[#e4e4e0] bg-[#fafaf8]" open={value.length <= 4}>
          <summary className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm font-semibold">
            <span className="flex-1 truncate">{def.itemLabel} {i + 1}{summaryText(item) ? ` — ${summaryText(item)}` : ""}</span>
            <button type="button" aria-label="Move up" className="admin-btn-ghost min-h-0 px-2 py-1" disabled={i === 0} onClick={(e) => { e.preventDefault(); move(i, -1); }}>↑</button>
            <button type="button" aria-label="Move down" className="admin-btn-ghost min-h-0 px-2 py-1" disabled={i === value.length - 1} onClick={(e) => { e.preventDefault(); move(i, 1); }}>↓</button>
            <button type="button" aria-label={`Delete ${def.itemLabel} ${i + 1}`} className="admin-btn-ghost admin-btn-danger min-h-0 px-2 py-1" onClick={(e) => { e.preventDefault(); onChange(value.filter((_, j) => j !== i)); }}>✕</button>
          </summary>
          <div className="border-t border-[#e4e4e0] p-3">
            <FieldsEditor fields={def.fields} value={item} onChange={(v) => update(i, v)} idPrefix={`${id}-${i}`} />
          </div>
        </details>
      ))}
      <button type="button" className="admin-btn-ghost self-start" onClick={() => onChange([...value, emptyItem(def.fields)])}>+ Add {def.itemLabel.toLowerCase()}</button>
    </fieldset>
  );
}

function summaryText(item: Obj) {
  for (const k of ["label", "name", "q", "caption", "title"]) if (typeof item[k] === "string" && item[k]) return item[k] as string;
  return "";
}
