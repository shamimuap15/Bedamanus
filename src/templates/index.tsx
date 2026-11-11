import { classicComponents, type Ctx, type D } from "@/components/landing/Sections";
import type { SectionType } from "@/lib/sections";
import { classic } from "./classic";
import { showcase } from "./showcase";
import { shaver } from "./shaver";
import type { Template } from "./types";

export const TEMPLATES: Record<string, Template> = { classic, showcase, shaver };
export const TEMPLATE_LIST = Object.values(TEMPLATES);

export function getTemplate(key: string): Template {
  return TEMPLATES[key] ?? classic;
}

export function SectionRenderer({ template, type, data, ctx }: { template: string; type: string; data: D; ctx: Ctx }) {
  const t = getTemplate(template);
  const Comp = t.components[type as SectionType] ?? classicComponents[type as keyof typeof classicComponents];
  return Comp ? <Comp d={data} ctx={ctx} /> : null;
}
