import { getProductById, updateProduct } from "@/lib/services/products-admin.service";
import { saveUpload, deleteUpload } from "@/lib/services/uploads.service";
import { problemResponse } from "@/lib/http/problem-details";

// RF-109, RF-111
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return problemResponse(404, "Producto no encontrado", `No existe un producto con id ${id}`);

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return problemResponse(400, "Archivo requerido", "Falta el campo 'file'");
  }

  const result = await saveUpload(file, "products");
  if (!result.ok) {
    return problemResponse(400, "Imagen inválida", result.error);
  }

  await deleteUpload(product.imageUrl);
  const updated = await updateProduct(id, { imageUrl: result.url });

  return new Response(JSON.stringify(updated), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// RF-110
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return problemResponse(404, "Producto no encontrado", `No existe un producto con id ${id}`);

  await deleteUpload(product.imageUrl);
  const updated = await updateProduct(id, { imageUrl: null });

  return new Response(JSON.stringify(updated), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
