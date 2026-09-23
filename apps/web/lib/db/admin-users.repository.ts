import type { AdminUser, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

// RF-101
export function findByEmail(email: string): Promise<AdminUser | null> {
  return prisma.adminUser.findUnique({ where: { email } });
}

// RF-105, RF-118
export function findById(id: string): Promise<AdminUser | null> {
  return prisma.adminUser.findUnique({ where: { id } });
}

// RF-114
export function findAll(): Promise<AdminUser[]> {
  return prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });
}

// RF-114
export function create(data: Prisma.AdminUserCreateInput): Promise<AdminUser> {
  return prisma.adminUser.create({ data });
}

// RF-101 (lockout), RF-116 (active), RF-117 (password)
export function updateById(
  id: string,
  data: Prisma.AdminUserUpdateInput,
): Promise<AdminUser> {
  return prisma.adminUser.update({ where: { id }, data });
}
