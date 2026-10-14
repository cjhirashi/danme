import { readUpload } from "@/lib/services/uploads.service";
import { problemResponse } from "@/lib/http/problem-details";

// RF-124 — imágenes subidas desde el panel, visibles sin reiniciar el servicio.
// Las presentes al arrancar las sirve Next como estáticas antes de llegar aquí.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path } = await params;
  const file = await readUpload(path);
  if (!file) return problemResponse(404, "Imagen no encontrada");

  return new Response(new Uint8Array(file.body), {
    status: 200,
    headers: {
      "Content-Type": file.contentType,
      // Nombres UUID: un archivo nunca se reescribe con otro contenido.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
