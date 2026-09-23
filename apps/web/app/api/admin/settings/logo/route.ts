import { getSiteSettingsAdmin, updateSiteSettings } from "@/lib/services/site-settings-admin.service";
import { saveUpload, deleteUpload } from "@/lib/services/uploads.service";
import { problemResponse } from "@/lib/http/problem-details";

// RF-113
export async function POST(request: Request): Promise<Response> {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return problemResponse(400, "Archivo requerido", "Falta el campo 'file'");
  }

  const result = await saveUpload(file, "settings");
  if (!result.ok) {
    return problemResponse(400, "Imagen inválida", result.error);
  }

  const current = await getSiteSettingsAdmin();
  await deleteUpload(current?.logoUrl);
  const updated = await updateSiteSettings({ logoUrl: result.url });

  return new Response(JSON.stringify(updated), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// RF-113
export async function DELETE(): Promise<Response> {
  const current = await getSiteSettingsAdmin();
  await deleteUpload(current?.logoUrl);
  const updated = await updateSiteSettings({ logoUrl: null });

  return new Response(JSON.stringify(updated), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
