import { designVars } from "@/lib/design";
import type { Template } from "@/templates/types";

/** Tiny stylised preview of a template's look (colours, corners, button shape). */
export function TemplateMock({ t }: { t: Template }) {
  return (
    <div style={designVars(t.design)} className="bg-ground text-fg border-line r-md pointer-events-none flex aspect-[4/5] w-full flex-col gap-1.5 overflow-hidden border p-2" aria-hidden>
      <div className="bg-accent h-1.5 rounded-full" />
      <div className="bg-tile r-sm h-[38%] w-full" />
      <div className="bg-fg h-1.5 w-4/5 rounded-full" />
      <div className="bg-muted h-1 w-3/5 rounded-full opacity-60" />
      <div className="bg-accent btn-shape mt-auto h-4 w-full" />
      <div className="grid grid-cols-3 gap-1">
        {[0, 1, 2].map((i) => <div key={i} className="bg-card r-sm h-5" />)}
      </div>
    </div>
  );
}
