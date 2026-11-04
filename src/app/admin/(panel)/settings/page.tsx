import { getSettings } from "@/lib/data";
import { SETTINGS_FIELDS } from "@/lib/sections";
import { SettingsEditor } from "@/components/admin/SettingsEditor";

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="m-0 text-2xl font-bold">Settings</h1>
        <p className="m-0 text-sm text-[#666]">Logo, brand colour, contact details, delivery charges, SEO and Facebook Pixel.</p>
      </div>
      <SettingsEditor fields={SETTINGS_FIELDS} initial={settings} />
    </div>
  );
}
