import { getSiteSettingsAdmin } from "@/lib/services/site-settings-admin.service";
import SettingsForm from "@/components/admin/SettingsForm";

// RF-112, RF-113
export default async function AdminSettingsPage() {
  const settings = await getSiteSettingsAdmin();
  if (!settings) {
    return <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">
      ⚠️ SiteSettings no está sembrado. Corre el seed primero.
    </div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-verde-oscuro">Configuración del sitio</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
