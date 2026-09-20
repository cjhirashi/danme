import type { SiteSettings } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

// RF-004, RF-008 — SiteSettings es singleton (id fijo "default"); su ausencia es un
// error de despliegue (seed no corrido), no un estado válido en runtime.
export async function getSiteSettings(): Promise<SiteSettings> {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });

  if (!settings) {
    throw new Error(
      "SiteSettings no está sembrado (falta 'prisma db seed'). Ver SPEC-001 RF-008.",
    );
  }

  return settings;
}
