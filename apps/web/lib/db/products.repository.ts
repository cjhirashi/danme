import type { Product } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

// RF-002, RF-007
export function findAvailableProducts(): Promise<Product[]> {
  return prisma.product.findMany({
    where: { available: true },
    orderBy: { createdAt: "asc" },
  });
}
