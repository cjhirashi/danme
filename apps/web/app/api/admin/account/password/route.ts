import { changeOwnPassword } from "@/lib/services/admin-users.service";
import { getSessionAdmin } from "@/lib/services/auth.service";
import { readSessionToken } from "@/lib/http/session-cookie";
import { problemResponse } from "@/lib/http/problem-details";

// RF-117, RF-120
export async function PATCH(request: Request): Promise<Response> {
  const admin = await getSessionAdmin(readSessionToken(request));
  if (!admin) return problemResponse(401, "No autorizado", "Sesión inválida o expirada");

  let body: { currentPassword?: unknown; newPassword?: unknown };
  try {
    body = await request.json();
  } catch {
    return problemResponse(400, "Cuerpo inválido", "Se esperaba JSON");
  }

  if (typeof body.currentPassword !== "string" || typeof body.newPassword !== "string") {
    return problemResponse(400, "Datos incompletos", "currentPassword y newPassword son requeridos");
  }

  const result = await changeOwnPassword(admin.id, body.currentPassword, body.newPassword);
  if (!result.ok) {
    return problemResponse(400, "No se pudo cambiar la contraseña", result.error);
  }

  return new Response(null, { status: 200 });
}
