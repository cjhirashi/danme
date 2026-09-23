import { getSiteSettingsAdmin } from "@/lib/services/site-settings-admin.service";
import SettingsForm from "@/components/admin/SettingsForm";

// RF-112, RF-113
export default async function AdminSettingsPage() {
  const settings = await getSiteSettingsAdmin();
  if (!settings) {
    return <p className="text-red-600">SiteSettings no está sembrado. Corre el seed primero.</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-verde-oscuro">Configuración del sitio</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
