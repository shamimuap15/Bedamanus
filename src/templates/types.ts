import type { ComponentType } from "react";
import type { SectionType } from "@/lib/sections";
import type { Ctx, D } from "@/components/landing/Sections";

export type SectionComponent = ComponentType<{ d: D; ctx: Ctx }>;

/**
 * A template = layout code + a design preset + starter sections.
 * To add one: create src/templates/<key>.tsx exporting a Template, then register it in index.tsx.
 * It only needs to override the sections whose layout differs; everything else falls back to "classic".
 */
export type Template = {
  key: string;
  label: string;
  description: string;
  /** Design settings applied when a page is created from this template. */
  design: Record<string, unknown>;
  /** Sections created for a new page (content comes from SECTION_DEFS defaults unless given). */
  starter: { type: SectionType; data?: Record<string, unknown> }[];
  /** Hide the standard header (e.g. when the hero carries the logo). */
  hideHeader?: boolean;
  /** Products created with a new page. */
  starterProducts?: { name: string; subtitle?: string; price: number; comparePrice?: number | null; image?: string }[];
  /** Layout overrides per section type. */
  components: Partial<Record<SectionType, SectionComponent>>;
};
