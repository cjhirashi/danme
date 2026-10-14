// RF-121, RF-122 — toda escritura del panel pasa por aquí: nunca se ignora la
// respuesta, y el error siempre trae un motivo legible para mostrarlo al usuario.
export const NETWORK_ERROR = "No se pudo conectar con el servidor";

export type MutateResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function mutate<T = unknown>(url: string, init: RequestInit): Promise<MutateResult<T>> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    return { ok: false, error: NETWORK_ERROR };
  }

  const body = await res.json().catch(() => null);
  if (res.ok) return { ok: true, data: body as T };

  // Cuerpo RFC 9457 (lib/http/problem-details.ts): `detail` es el motivo concreto.
  const error = body?.detail ?? body?.title ?? `Error del servidor (${res.status})`;
  return { ok: false, error };
}
