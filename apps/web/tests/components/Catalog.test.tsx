import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Catalog } from "@/components/landing/Catalog";
import type { Product } from "@prisma/client";

const product: Product = {
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

describe("Catalog", () => {
  // RF-002, RF-007
  it("renderiza una ficha por cada producto", () => {
    render(<Catalog products={[product, { ...product, id: "2", flavorSlug: "serrano", name: "Chicharrón de chiles serranos" }]} />);
    expect(screen.getByText("Chicharrón de chile habanero")).toBeInTheDocument();
    expect(screen.getByText("Chicharrón de chiles serranos")).toBeInTheDocument();
  });

  // RF-009
  it("muestra un estado vacío explícito si no hay productos disponibles", () => {
    render(<Catalog products={[]} />);
    expect(screen.getByText(/pronto disponible/i)).toBeInTheDocument();
  });
});
