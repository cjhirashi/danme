import type { Prisma, SiteSettings } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

// RF-112, RF-113
export function updateSiteSettings(data: Prisma.SiteSettingsUpdateInput): Promise<SiteSettings> {
  return prisma.siteSettings.update({ where: { id: "default" }, data });
}

// RF-113 — lectura simple usada antes de subir/borrar el logo
export function getSiteSettingsAdmin(): Promise<SiteSettings | null> {
  return prisma.siteSettings.findUnique({ where: { id: "default" } });
}
