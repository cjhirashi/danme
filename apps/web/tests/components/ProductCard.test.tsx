import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductCard } from "@/components/landing/ProductCard";
import type { Product } from "@prisma/client";

const baseProduct: Product = {
  id: "1",
  name: "Chicharrón de chile habanero",
  flavorSlug: "habanero",
  description: "Hecho con chiles habaneros seleccionados.",
  priceCents: 15000,
  presentation: "190g",
  imageUrl: null,
  available: true,
  nomExcesoCalorias: true,
  nomExcesoSodio: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("ProductCard", () => {
  // RF-002
  it("muestra nombre, precio formateado y presentación", () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText("Chicharrón de chile habanero")).toBeInTheDocument();
    expect(screen.getByText("$150.00")).toBeInTheDocument();
    expect(screen.getByText("190g")).toBeInTheDocument();
  });

  // RF-006
  it("muestra un placeholder visual si imageUrl es null", () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByTestId("product-image-placeholder")).toBeInTheDocument();
  });

  it("muestra la imagen real cuando imageUrl está definido", () => {
    render(<ProductCard product={{ ...baseProduct, imageUrl: "/jar.jpg" }} />);
    expect(screen.queryByTestId("product-image-placeholder")).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: baseProduct.name })).toBeInTheDocument();
  });

  it("muestra los sellos NOM-051 cuando aplican", () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText(/exceso calorías/i)).toBeInTheDocument();
    expect(screen.getByText(/exceso sodio/i)).toBeInTheDocument();
  });
});
