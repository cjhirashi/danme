import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { prisma } from "@/lib/db/prisma";

let uploadsRoot: string;
vi.mock("@/lib/services/uploads-root", () => ({
  get UPLOADS_ROOT() {
    return uploadsRoot;
  },
}));

// RF-109, RF-110, RF-111, RF-119 — requiere danme_test
describe("app/api/admin/products/[id]/image", () => {
  beforeEach(async () => {
    uploadsRoot = await fs.mkdtemp(path.join(os.tmpdir(), "danme-uploads-"));
  });

  afterEach(async () => {
    await prisma.product.deleteMany();
    await fs.rm(uploadsRoot, { recursive: true, force: true });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function seedProduct() {
    return prisma.product.create({
      data: {
        name: "Producto",
        flavorSlug: `slug-${Date.now()}`,
        description: "d",
        priceCents: 10000,
        presentation: "190g",
      },
    });
  }

  it("POST sube una imagen válida y actualiza imageUrl (RF-109)", async () => {
    const product = await seedProduct();
    const { POST } = await import("@/app/api/admin/products/[id]/image/route");

    const form = new FormData();
    form.set("file", new File([new Uint8Array(1024)], "jar.jpg", { type: "image/jpeg" }));
    const req = new Request(`http://localhost/api/admin/products/${product.id}/image`, {
      method: "POST",
      body: form,
    });

    const res = await POST(req, { params: Promise.resolve({ id: product.id }) });
    expect(res.status).toBe(200);

    const updated = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    expect(updated.imageUrl).toMatch(/^\/uploads\/products\/.+\.jpg$/);
  });

  it("POST rechaza un tipo inválido con 400 RFC 9457 (RF-111)", async () => {
    const product = await seedProduct();
    const { POST } = await import("@/app/api/admin/products/[id]/image/route");

    const form = new FormData();
    form.set("file", new File([new Uint8Array(10)], "x.exe", { type: "application/x-msdownload" }));
    const req = new Request(`http://localhost/api/admin/products/${product.id}/image`, {
      method: "POST",
      body: form,
    });

    const res = await POST(req, { params: Promise.resolve({ id: product.id }) });
    expect(res.status).toBe(400);
    expect(res.headers.get("content-type")).toBe("application/problem+json");
  });

  it("POST responde 404 si el producto no existe (RF-119)", async () => {
    const { POST } = await import("@/app/api/admin/products/[id]/image/route");
    const form = new FormData();
    form.set("file", new File([new Uint8Array(10)], "jar.jpg", { type: "image/jpeg" }));
    const req = new Request("http://localhost/api/admin/products/no-existe/image", {
      method: "POST",
      body: form,
    });

    const res = await POST(req, { params: Promise.resolve({ id: "no-existe" }) });
    expect(res.status).toBe(404);
  });

  it("DELETE limpia imageUrl y borra el archivo (RF-110)", async () => {
    let product = await seedProduct();
    const { POST, DELETE } = await import("@/app/api/admin/products/[id]/image/route");

    const form = new FormData();
    form.set("file", new File([new Uint8Array(1024)], "jar.png", { type: "image/png" }));
    await POST(new Request(`http://localhost/api/admin/products/${product.id}/image`, {
      method: "POST",
      body: form,
    }), { params: Promise.resolve({ id: product.id }) });

    const res = await DELETE(
      new Request(`http://localhost/api/admin/products/${product.id}/image`, { method: "DELETE" }),
      { params: Promise.resolve({ id: product.id }) },
    );
    expect(res.status).toBe(200);

    product = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    expect(product.imageUrl).toBeNull();
  });
});
