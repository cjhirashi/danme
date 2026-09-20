import type { Product, SiteSettings } from "@prisma/client";
import { findAvailableProducts } from "@/lib/db/products.repository";
import { getSiteSettings as getSiteSettingsRepo } from "@/lib/db/site-settings.repository";

// RF-002, RF-007
export function getCatalog(): Promise<Product[]> {
  return findAvailableProducts();
}

// RF-004
export function getSiteSettings(): Promise<SiteSettings> {
  return getSiteSettingsRepo();
}

// RF-003
export function buildWhatsAppLink(phone: string, message: string): string {
  const digitsOnly = phone.replace(/\D/g, "");
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}

// RF-002
export function formatPrice(priceCents: number): string {
  return `$${(priceCents / 100).toFixed(2)}`;
}
