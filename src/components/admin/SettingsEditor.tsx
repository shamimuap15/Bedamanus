"use client";

import type { FieldDef } from "@/lib/sections";
import { saveSettings } from "@/app/admin/actions";
import { JsonFormEditor, type FieldGroup } from "./SectionEditor";

const GROUPS: FieldGroup[] = [
  { title: "Brand & contact", description: "Shown in the header, footer and call buttons on every page.", keys: ["logo", "announcement", "phone", "phoneLink", "whatsapp", "facebookUrl", "address"] },
  { title: "Delivery", description: "Charges applied at checkout on every page.", keys: ["deliveryInside", "deliveryOutside", "insideLabel", "outsideLabel"] },
  { title: "Sticky order bar", keys: ["stickyBar", "stickyText"] },
  { title: "SEO & sharing", description: "Defaults; each page can override these in the theme editor.", keys: ["siteTitle", "metaDescription", "ogImage"] },
  { title: "Thank-you page & tracking", keys: ["thankYouTitle", "thankYouText", "pixelId"] },
];

export function SettingsEditor({ fields, initial }: { fields: FieldDef[]; initial: Record<string, unknown> }) {
  return <JsonFormEditor fields={fields} initial={initial} save={saveSettings} groups={GROUPS} />;
}
