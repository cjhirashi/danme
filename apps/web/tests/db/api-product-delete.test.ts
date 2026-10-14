import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";

let uploadsRoot: string;
vi.mock("@/lib/services/uploads-root", () => ({
  get UPLOADS_ROOT() {
    return uploadsRoot;
  },
}));

const { DELETE } = await import("@/app/api/admin/products/[id]/route");

function del(id: string) {
  return DELETE(new Request(`http://localhost/api/admin/products/${id}`, { method: "DELETE" }), {
    params: Promise.resolve({ id }),
  });
}

// RF-126 — requiere danme_test
describe("DELETE /api/admin/products/[id]", () => {
  beforeEach(async () => {
    uploadsRoot = await fs.mkdtemp(path.join(os.tmpdir(), "danme-uploads-"));
    await fs.mkdir(path.join(uploadsRoot, "products"));
  });

  afterEach(async () => {
    await prisma.product.deleteMany();
    await fs.rm(uploadsRoot, { recursive: true, force: true });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  function seed(imageUrl: string | null) {
    return prisma.product.create({
      data: { name: "Borrable", flavorSlug: `slug-${Date.now()}`, description: "d", priceCents: 1, presentation: "190g", imageUrl },
    });
  }

  it("responde 204 y borra la fila y su archivo de imagen", async () => {
    await fs.writeFile(path.join(uploadsRoot, "products", "a.jpg"), "x");
    const product = await seed("/uploads/products/a.jpg");

    const res = await del(product.id);

    expect(res.status).toBe(204);
    expect(await prisma.product.findUnique({ where: { id: product.id } })).toBeNull();
    await expect(fs.stat(path.join(uploadsRoot, "products", "a.jpg"))).rejects.toThrow();
  });

  it("borra un producto sin imagen", async () => {
    const product = await seed(null);
    expect((await del(product.id)).status).toBe(204);
    expect(await prisma.product.count()).toBe(0);
  });

  it("responde 404 RFC 9457 si no existe y no toca otros productos", async () => {
    const other = await seed(null);
    const res = await del("no-existe");
    expect(res.status).toBe(404);
    expect(res.headers.get("Content-Type")).toBe("application/problem+json");
    expect(await prisma.product.findUnique({ where: { id: other.id } })).not.toBeNull();
  });

  // Revisor: solo "no existe" es 404; lo demás no se enmascara.
  it("si el archivo no se puede borrar, la fila ya no existe → 204 (queda huérfano el archivo)", async () => {
    // un directorio no vacío con el nombre del archivo hace fallar `rm` sin `recursive`
    await fs.mkdir(path.join(uploadsRoot, "products", "b.jpg"));
    await fs.writeFile(path.join(uploadsRoot, "products", "b.jpg", "x"), "x");
    const product = await seed("/uploads/products/b.jpg");
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await del(product.id);

    expect(res.status).toBe(204);
    expect(await prisma.product.findUnique({ where: { id: product.id } })).toBeNull();
    expect(errorLog).toHaveBeenCalled();
    errorLog.mockRestore();
  });

  it("error inesperado de la base → 500 RFC 9457, no 404", async () => {
    const product = await seed(null);
    const spy = vi.spyOn(prisma.product, "delete").mockRejectedValueOnce(new Error("db caída"));
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await del(product.id);

    expect(res.status).toBe(500);
    expect(res.headers.get("Content-Type")).toBe("application/problem+json");
    spy.mockRestore();
    errorLog.mockRestore();
  });

  it("sin sesión, el proxy rechaza el DELETE con 401", async () => {
    const { proxy } = await import("@/proxy");
    const res = await proxy(new NextRequest("http://localhost/api/admin/products/x", { method: "DELETE" }));
    expect(res?.status).toBe(401);
  });
});
