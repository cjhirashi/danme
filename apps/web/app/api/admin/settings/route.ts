import { updateSiteSettings } from "@/lib/services/site-settings-admin.service";
import { problemResponse } from "@/lib/http/problem-details";

// RF-112
export async function PATCH(request: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return problemResponse(400, "Cuerpo inválido", "Se esperaba JSON");
  }

  const updated = await updateSiteSettings(body);
  return new Response(JSON.stringify(updated), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
