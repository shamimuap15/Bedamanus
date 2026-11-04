"use client";

import type { FieldDef } from "@/lib/sections";
import { saveSettings } from "@/app/admin/actions";
import { JsonFormEditor } from "./SectionEditor";

export function SettingsEditor({ fields, initial }: { fields: FieldDef[]; initial: Record<string, unknown> }) {
  return <JsonFormEditor fields={fields} initial={initial} save={saveSettings} />;
}
