import { createAdmin, listAdmins } from "@/lib/services/admin-users.service";
import { problemResponse } from "@/lib/http/problem-details";

// RF-114, RF-115
export async function POST(request: Request): Promise<Response> {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return problemResponse(400, "Cuerpo inválido", "Se esperaba JSON");
  }

  if (typeof body.email !== "string" || typeof body.password !== "string") {
    return problemResponse(400, "Datos incompletos", "email y password son requeridos");
  }

  const result = await createAdmin(body.email, body.password);
  if (!result.ok) {
    const status = result.error.includes("email") ? 409 : 400;
    return problemResponse(status, "No se pudo crear la cuenta", result.error);
  }

  return new Response(JSON.stringify({ id: result.value.id, email: result.value.email }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}

// RF-114 (listado, para la pantalla de Usuarios)
export async function GET(): Promise<Response> {
  const admins = await listAdmins();
  const safe = admins.map(({ id, email, active, createdAt }) => ({ id, email, active, createdAt }));
  return new Response(JSON.stringify(safe), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
