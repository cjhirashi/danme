import { describe, expect, it, vi } from "vitest";
import type { Product, SiteSettings } from "@prisma/client";

const findAvailableProducts = vi.fn();
const getSiteSettingsRepo = vi.fn();

vi.mock("@/lib/db/products.repository", () => ({
  findAvailableProducts: (...args: unknown[]) => findAvailableProducts(...args),
}));
vi.mock("@/lib/db/site-settings.repository", () => ({
  getSiteSettings: (...args: unknown[]) => getSiteSettingsRepo(...args),
}));

const { getCatalog, getSiteSettings, buildWhatsAppLink, formatPrice } = await import(
  "@/lib/services/content.service"
);

const baseProduct: Product = {
  id: "1",
  name: "Chicharrón de chile habanero",
  flavorSlug: "habanero",
  description: "desc",
  priceCents: 15000,
  presentation: "190g",
  imageUrl: null,
  available: true,
  nomExcesoCalorias: true,
  nomExcesoSodio: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const baseSettings: SiteSettings = {
  id: "default",
  brandName: "DanMe",
  tagline: "Producto artesanal — by Daniel",
  aboutText: "Producto artesanal hecho en México, sin conservadores.",
  whatsappNumber: "+527226499807",
  instagramUrl: null,
  facebookUrl: null,
  logoUrl: null,
  updatedAt: new Date(),
};

describe("content.service", () => {
  // RF-002, RF-007
  it("getCatalog delega en el repositorio de productos disponibles", async () => {
    findAvailableProducts.mockResolvedValueOnce([baseProduct]);
    const result = await getCatalog();
    expect(findAvailableProducts).toHaveBeenCalledOnce();
    expect(result).toEqual([baseProduct]);
  });

  // RF-004
  it("getSiteSettings delega en el repositorio de configuración", async () => {
    getSiteSettingsRepo.mockResolvedValueOnce(baseSettings);
    const result = await getSiteSettings();
    expect(result).toEqual(baseSettings);
  });

  // RF-003
  it("buildWhatsAppLink arma una URL wa.me con el mensaje codificado", () => {
    const link = buildWhatsAppLink("+527226499807", "Hola, quiero pedir chicharrón");
    expect(link).toBe(
      "https://wa.me/527226499807?text=Hola%2C%20quiero%20pedir%20chicharr%C3%B3n",
    );
  });

  it("buildWhatsAppLink limpia caracteres no numéricos del teléfono", () => {
    const link = buildWhatsAppLink("+52 722 649 9807", "hola");
    expect(link).toBe("https://wa.me/527226499807?text=hola");
  });

  // RF-002
  it("formatPrice formatea centavos a pesos mexicanos", () => {
    expect(formatPrice(15000)).toBe("$150.00");
    expect(formatPrice(0)).toBe("$0.00");
  });
});
