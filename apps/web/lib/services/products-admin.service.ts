import type { Prisma, Product } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { deleteUpload } from "@/lib/services/uploads.service";

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

// RF-126 — borrado físico: la fila y su archivo de imagen. null = no existía.
// El archivo se borra después de la fila: si `rm` falla queda un archivo huérfano
// (se registra), nunca una fila apuntando a nada — la operación sí ocurrió.
export async function deleteProduct(id: string): Promise<Product | null> {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return null;
  try {
    await prisma.product.delete({ where: { id } });
  } catch (error) {
    // P2025: otra petición lo borró entre la lectura y el delete
    if ((error as { code?: string }).code === "P2025") return null;
    throw error;
  }
  try {
    await deleteUpload(product.imageUrl);
  } catch (error) {
    console.error(`Producto ${id} borrado, pero su imagen quedó huérfana: ${product.imageUrl}`, error);
  }
  return product;
}
