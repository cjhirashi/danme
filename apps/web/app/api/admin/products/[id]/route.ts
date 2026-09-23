import { updateProduct } from "@/lib/services/products-admin.service";
import { problemResponse } from "@/lib/http/problem-details";

// RF-107, RF-108
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return problemResponse(400, "Cuerpo inválido", "Se esperaba JSON");
  }

  try {
    const product = await updateProduct(id, body);
    return new Response(JSON.stringify(product), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return problemResponse(404, "Producto no encontrado", `No existe un producto con id ${id}`);
  }
}
