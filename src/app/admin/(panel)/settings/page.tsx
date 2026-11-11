import { getSettings } from "@/lib/data";
import { SETTINGS_FIELDS } from "@/lib/sections";
import { SettingsEditor } from "@/components/admin/SettingsEditor";

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="admin-eyebrow mb-2">Site-wide</div>
        <h1 className="m-0 text-4xl">Settings</h1>
        <p className="m-0 mt-1 text-[15px] text-[#6f6e76]">Contact details, delivery charges, SEO and tracking. Colours and fonts live in the theme editor, per page.</p>
      </div>
      <SettingsEditor fields={SETTINGS_FIELDS} initial={settings} />
    </div>
  );
}
