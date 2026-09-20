import { afterAll, afterEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { getSiteSettings } from "@/lib/db/site-settings.repository";

// RF-004, RF-008 — requiere DATABASE_URL apuntando a danme_test (ver .env.test / npm run test:db)
describe("site-settings.repository", () => {
  afterEach(async () => {
    await prisma.siteSettings.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("getSiteSettings devuelve la fila singleton sembrada", async () => {
    await prisma.siteSettings.create({
      data: {
        id: "default",
        brandName: "DanMe",
        tagline: "Producto artesanal — by Daniel",
        whatsappNumber: "+527226499807",
      },
    });

    const result = await getSiteSettings();

    expect(result.brandName).toBe("DanMe");
    expect(result.whatsappNumber).toBe("+527226499807");
  });

  // RF-008
  it("getSiteSettings falla explícito si no hay seed", async () => {
    await expect(getSiteSettings()).rejects.toThrow(/no está sembrado/);
  });
});
