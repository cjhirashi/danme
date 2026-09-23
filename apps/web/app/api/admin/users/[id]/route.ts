import { setActive } from "@/lib/services/admin-users.service";
import { problemResponse } from "@/lib/http/problem-details";

// RF-116
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;

  let body: { active?: unknown };
  try {
    body = await request.json();
  } catch {
    return problemResponse(400, "Cuerpo inválido", "Se esperaba JSON");
  }

  if (typeof body.active !== "boolean") {
    return problemResponse(400, "Datos incompletos", "'active' (boolean) es requerido");
  }

  try {
    const admin = await setActive(id, body.active);
    return new Response(JSON.stringify({ id: admin.id, email: admin.email, active: admin.active }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return problemResponse(404, "Cuenta no encontrada", `No existe una cuenta admin con id ${id}`);
  }
}
