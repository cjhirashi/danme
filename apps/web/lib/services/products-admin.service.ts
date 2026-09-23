import type { Prisma, Product } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

// RF-106
export function createProduct(data: Prisma.ProductCreateInput): Promise<Product> {
  return prisma.product.create({ data });
}

// RF-107
export function updateProduct(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
  return prisma.product.update({ where: { id }, data });
}

// RF-108
export function setAvailable(id: string, available: boolean): Promise<Product> {
  return prisma.product.update({ where: { id }, data: { available } });
}

// RF-109, RF-110 — lectura simple usada antes de subir/borrar la imagen
export function getProductById(id: string): Promise<Product | null> {
  return prisma.product.findUnique({ where: { id } });
}

// RF-106..108 — listado completo (incluye no disponibles) para la UI admin
export function listAllProducts(): Promise<Product[]> {
  return prisma.product.findMany({ orderBy: { createdAt: "asc" } });
}
