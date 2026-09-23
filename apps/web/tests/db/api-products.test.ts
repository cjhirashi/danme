import { afterAll, afterEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db/prisma";

// RF-106, RF-107, RF-108, RF-109, RF-110, RF-111 — requiere danme_test
describe("app/api/admin/products", () => {
  afterEach(async () => {
    await prisma.product.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("POST crea un producto (RF-106)", async () => {
    const { POST } = await import("@/app/api/admin/products/route");
    const req = new Request("http://localhost/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Chicharrón de chile de árbol",
        flavorSlug: "arbol",
        description: "desc",
        priceCents: 15000,
        presentation: "190g",
        nomExcesoCalorias: true,
        nomExcesoSodio: true,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const created = await prisma.product.findUnique({ where: { flavorSlug: "arbol" } });
    expect(created?.name).toBe("Chicharrón de chile de árbol");
  });

  it("PATCH edita campos y alterna available (RF-107, RF-108)", async () => {
    const product = await prisma.product.create({
      data: {
        name: "Original",
        flavorSlug: "original",
        description: "d",
        priceCents: 10000,
        presentation: "190g",
      },
    });

    const { PATCH } = await import("@/app/api/admin/products/[id]/route");
    const req = new Request(`http://localhost/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Editado", available: false }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: product.id }) });
    expect(res.status).toBe(200);

    const updated = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    expect(updated.name).toBe("Editado");
    expect(updated.available).toBe(false);
  });

  it("PATCH responde 404 RFC 9457 si el producto no existe (RF-119)", async () => {
    const { PATCH } = await import("@/app/api/admin/products/[id]/route");
    const req = new Request("http://localhost/api/admin/products/no-existe", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "x" }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: "no-existe" }) });
    expect(res.status).toBe(404);
    expect(res.headers.get("content-type")).toBe("application/problem+json");
  });
});
