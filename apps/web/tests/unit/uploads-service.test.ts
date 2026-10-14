import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

let uploadsRoot: string;

vi.mock("@/lib/services/uploads-root", () => ({
  get UPLOADS_ROOT() {
    return uploadsRoot;
  },
}));

const { saveUpload, deleteUpload, INVALID_TYPE_ERROR, FILE_TOO_LARGE_ERROR } = await import(
  "@/lib/services/uploads.service"
);

function makeFile(name: string, type: string, sizeBytes: number): File {
  const bytes = new Uint8Array(sizeBytes);
  return new File([bytes], name, { type });
}

describe("uploads.service", () => {
  beforeEach(async () => {
    uploadsRoot = await fs.mkdtemp(path.join(os.tmpdir(), "danme-uploads-"));
  });

  afterEach(async () => {
    await fs.rm(uploadsRoot, { recursive: true, force: true });
  });

  // RF-111
  it("rechaza un tipo de archivo no permitido", async () => {
    const file = makeFile("virus.exe", "application/x-msdownload", 1024);
    const result = await saveUpload(file, "products");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe(INVALID_TYPE_ERROR);
  });

  // RF-111
  it("rechaza un archivo mayor a 5MB", async () => {
    const file = makeFile("big.jpg", "image/jpeg", 6 * 1024 * 1024);
    const result = await saveUpload(file, "products");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe(FILE_TOO_LARGE_ERROR);
  });

  // RF-109
  it("guarda un archivo válido y devuelve una URL pública bajo /uploads", async () => {
    const file = makeFile("jar.jpg", "image/jpeg", 1024);
    const result = await saveUpload(file, "products");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.url).toMatch(/^\/uploads\/products\/.+\.jpg$/);
      const savedPath = path.join(uploadsRoot, result.url.replace("/uploads/", ""));
      await expect(fs.stat(savedPath)).resolves.toBeTruthy();
    }
  });

  // RF-110
  it("deleteUpload borra el archivo referenciado por su URL", async () => {
    const file = makeFile("jar.png", "image/png", 1024);
    const saved = await saveUpload(file, "products");
    if (!saved.ok) throw new Error("setup falló");

    await deleteUpload(saved.url);

    const savedPath = path.join(uploadsRoot, saved.url.replace("/uploads/", ""));
    await expect(fs.stat(savedPath)).rejects.toThrow();
  });

  it("deleteUpload no falla si la URL es null o el archivo no existe", async () => {
    await expect(deleteUpload(null)).resolves.not.toThrow();
    await expect(deleteUpload("/uploads/products/no-existe.jpg")).resolves.not.toThrow();
  });

  it("deleteUpload no borra en una carpeta hermana con el mismo prefijo", async () => {
    const sibling = `${uploadsRoot}-evil`;
    await fs.mkdir(sibling);
    await fs.writeFile(path.join(sibling, "x.jpg"), "x");
    try {
      await deleteUpload(`/uploads/../${path.basename(uploadsRoot)}-evil/x.jpg`);
      await expect(fs.stat(path.join(sibling, "x.jpg"))).resolves.toBeTruthy();
    } finally {
      await fs.rm(sibling, { recursive: true, force: true });
    }
  });
});
