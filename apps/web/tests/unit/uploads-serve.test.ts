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

const { readUpload } = await import("@/lib/services/uploads.service");
const { GET } = await import("@/app/uploads/[...path]/route");

function get(segments: string[]) {
  return GET(new Request(`http://localhost/uploads/${segments.join("/")}`), {
    params: Promise.resolve({ path: segments }),
  });
}

describe("servir uploads en runtime (RF-124)", () => {
  beforeEach(async () => {
    uploadsRoot = await fs.mkdtemp(path.join(os.tmpdir(), "danme-serve-"));
    await fs.mkdir(path.join(uploadsRoot, "products"));
    await fs.writeFile(path.join(uploadsRoot, "products", "a.jpg"), Buffer.from([0xff, 0xd8, 0xff]));
    await fs.writeFile(path.join(uploadsRoot, "products", "notas.txt"), "secreto");
    await fs.writeFile(path.join(path.dirname(uploadsRoot), "fuera.jpg"), "x");
  });

  afterEach(async () => {
    await fs.rm(uploadsRoot, { recursive: true, force: true });
    await fs.rm(path.join(path.dirname(uploadsRoot), "fuera.jpg"), { force: true });
  });

  it("readUpload lee un archivo subido después de arrancar", async () => {
    const file = await readUpload(["products", "a.jpg"]);
    expect(file?.contentType).toBe("image/jpeg");
    expect(file?.body).toEqual(Buffer.from([0xff, 0xd8, 0xff]));
  });

  it.each([
    [["products", "no-existe.jpg"]],
    [["products", "notas.txt"]],
    [["..", "fuera.jpg"]],
    [["products", "..", "..", "fuera.jpg"]],
    [["/etc", "passwd.png"]],
    [["products"]],
    [["%2e%2e", "fuera.jpg"]],
    [["products", "a.jpg\u0000.png"]],
  ])("readUpload devuelve null para %j", async (segments) => {
    expect(await readUpload(segments)).toBeNull();
  });

  it("GET responde 200 con Content-Type y caché inmutable", async () => {
    const res = await get(["products", "a.jpg"]);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/jpeg");
    expect(res.headers.get("Cache-Control")).toBe("public, max-age=31536000, immutable");
    expect(Buffer.from(await res.arrayBuffer())).toEqual(Buffer.from([0xff, 0xd8, 0xff]));
  });

  it("GET responde 404 RFC 9457 si no existe o sale de la carpeta", async () => {
    for (const segments of [["products", "no-existe.webp"], ["..", "fuera.jpg"]]) {
      const res = await get(segments);
      expect(res.status).toBe(404);
      expect(res.headers.get("Content-Type")).toBe("application/problem+json");
    }
  });

  it("readUpload no sale a una carpeta hermana con el mismo prefijo (uploads-evil)", async () => {
    const sibling = `${uploadsRoot}-evil`;
    await fs.mkdir(sibling);
    await fs.writeFile(path.join(sibling, "x.jpg"), "x");
    try {
      expect(await readUpload(["..", `${path.basename(uploadsRoot)}-evil`, "x.jpg"])).toBeNull();
    } finally {
      await fs.rm(sibling, { recursive: true, force: true });
    }
  });

  it("readUpload no sigue symlinks que apuntan fuera de la carpeta", async () => {
    await fs.symlink(path.join(path.dirname(uploadsRoot), "fuera.jpg"), path.join(uploadsRoot, "products", "link.jpg"));
    expect(await readUpload(["products", "link.jpg"])).toBeNull();
  });
});
