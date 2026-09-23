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

  // Nunca borrar fuera de UPLOADS_ROOT.
  if (!target.startsWith(UPLOADS_ROOT)) return;

  await fs.rm(target, { force: true });
}
