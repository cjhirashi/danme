import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { findAvailableProducts } from "@/lib/db/products.repository";

// RF-002, RF-007 — requiere DATABASE_URL apuntando a danme_test (ver .env.test / npm run test:db)
describe("products.repository", () => {
  beforeAll(async () => {
    await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: {},
      create: {
        id: "default",
        brandName: "DanMe",
        tagline: "Producto artesanal — by Daniel",
        whatsappNumber: "+527226499807",
      },
    });
  });

  afterEach(async () => {
    await prisma.product.deleteMany();
  });

  afterAll(async () => {
    await prisma.siteSettings.deleteMany();
    await prisma.$disconnect();
  });

  it("findAvailableProducts devuelve solo productos con available=true", async () => {
    await prisma.product.createMany({
      data: [
        {
          name: "Chicharrón de chile habanero",
          flavorSlug: "habanero",
          description: "desc",
          priceCents: 15000,
          presentation: "190g",
          available: true,
          nomExcesoCalorias: true,
          nomExcesoSodio: true,
        },
        {
          name: "Chicharrón descontinuado",
          flavorSlug: "descontinuado",
          description: "desc",
          priceCents: 10000,
          presentation: "190g",
          available: false,
          nomExcesoCalorias: true,
          nomExcesoSodio: true,
        },
      ],
    });

    const result = await findAvailableProducts();

    expect(result).toHaveLength(1);
    expect(result[0].flavorSlug).toBe("habanero");
  });

  it("findAvailableProducts devuelve arreglo vacío si no hay productos disponibles", async () => {
    const result = await findAvailableProducts();
    expect(result).toEqual([]);
  });
});
