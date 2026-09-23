import { createProduct } from "@/lib/services/products-admin.service";
import { problemResponse } from "@/lib/http/problem-details";

// RF-106
export async function POST(request: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return problemResponse(400, "Cuerpo inválido", "Se esperaba JSON");
  }

  const { name, flavorSlug, description, priceCents, presentation } = body;
  if (
    typeof name !== "string" ||
    typeof flavorSlug !== "string" ||
    typeof description !== "string" ||
    typeof priceCents !== "number" ||
    typeof presentation !== "string"
  ) {
    return problemResponse(400, "Datos incompletos", "Faltan campos requeridos del producto");
  }

  try {
    const product = await createProduct({
      name,
      flavorSlug,
      description,
      priceCents,
      presentation,
      nomExcesoCalorias: Boolean(body.nomExcesoCalorias),
      nomExcesoSodio: Boolean(body.nomExcesoSodio),
    });
    return new Response(JSON.stringify(product), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return problemResponse(409, "No se pudo crear el producto", "El sabor (flavorSlug) ya existe");
  }
}
