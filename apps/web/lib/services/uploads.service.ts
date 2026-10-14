import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { UPLOADS_ROOT } from "@/lib/services/uploads-root";

export const INVALID_TYPE_ERROR = "Formato no permitido (usa JPG, PNG o WebP)";
export const FILE_TOO_LARGE_ERROR = "El archivo supera el máximo de 5MB";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const CONTENT_TYPES: Record<string, string> = Object.fromEntries(
  Object.entries(ALLOWED_TYPES).map(([mime, ext]) => [`.${ext}`, mime]),
);

type SaveResult = { ok: true; url: string } | { ok: false; error: string };

// RF-109, RF-111, RF-113
export async function saveUpload(file: File, subdir: string): Promise<SaveResult> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) return { ok: false, error: INVALID_TYPE_ERROR };
  if (file.size > MAX_BYTES) return { ok: false, error: FILE_TOO_LARGE_ERROR };

  const dir = path.join(UPLOADS_ROOT, subdir);
  await fs.mkdir(dir, { recursive: true });

  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  // subdir es siempre un literal fijo del propio código ("products"/"settings"),
  // no input de usuario — turbopackIgnore evita que el bundler trace todo el
  // proyecto por no poder probarlo estáticamente (ver aviso del build).
  await fs.writeFile(path.join(/* turbopackIgnore: true */ dir, filename), buffer);

  return { ok: true, url: `/uploads/${subdir}/${filename}` };
}

// RF-110
export async function deleteUpload(url: string | null | undefined): Promise<void> {
  if (!url || !url.startsWith("/uploads/")) return;
  const relative = url.replace("/uploads/", "");
  const target = path.join(UPLOADS_ROOT, relative);

  // Nunca borrar fuera de UPLOADS_ROOT (con separador: `uploads-evil` no cuenta).
  if (!target.startsWith(UPLOADS_ROOT + path.sep)) return;

  await fs.rm(target, { force: true });
}

// RF-124 — el server de producción de Next indexa `public/` una sola vez al arrancar,
// así que lo subido después se sirve leyendo el volumen directamente.
export async function readUpload(
  segments: string[],
): Promise<{ body: Buffer; contentType: string } | null> {
  const target = path.resolve(UPLOADS_ROOT, ...segments);
  // Nunca leer fuera de UPLOADS_ROOT (`..`, rutas absolutas).
  if (!target.startsWith(UPLOADS_ROOT + path.sep)) return null;

  const contentType = CONTENT_TYPES[path.extname(target).toLowerCase()];
  if (!contentType) return null;

  try {
    // Un symlink dentro del volumen no puede servir archivos de fuera.
    const [root, real] = await Promise.all([fs.realpath(UPLOADS_ROOT), fs.realpath(target)]);
    if (!real.startsWith(root + path.sep)) return null;
    return { body: await fs.readFile(/* turbopackIgnore: true */ real), contentType };
  } catch {
    return null;
  }
}
