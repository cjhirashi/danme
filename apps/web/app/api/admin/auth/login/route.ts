import { login } from "@/lib/services/auth.service";
import { problemResponse } from "@/lib/http/problem-details";
import { buildSessionCookie } from "@/lib/http/session-cookie";

// RF-101, RF-102, RF-103
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

  const result = await login(body.email, body.password);
  if (!result.ok) {
    return problemResponse(401, "No autorizado", result.error);
  }

  return new Response(JSON.stringify({ email: result.admin.email }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": buildSessionCookie(result.token),
    },
  });
}
