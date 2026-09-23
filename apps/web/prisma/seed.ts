import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "@/lib/services/auth.service";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Segunda cuenta admin (propietario del negocio) — su email no es secreto, la
// contraseña temporal sí viene de env (ADMIN_PASSWORD, compartida con la primera
// cuenta hasta que cada quien la cambie desde /admin/account — RF-117).
const SECOND_ADMIN_EMAIL = "danieljime444@gmail.com";

async function main() {
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      brandName: "DanMe",
      tagline: "Producto artesanal — by Daniel",
      // Dato mockup: se reemplaza/edita desde el panel admin (Feature 002).
      whatsappNumber: "+527226499807",
      instagramUrl: null,
      facebookUrl: null,
      logoUrl: null,
    },
  });

  await prisma.product.upsert({
    where: { flavorSlug: "habanero" },
    update: {},
    create: {
      name: "Chicharrón de chile habanero",
      flavorSlug: "habanero",
      description:
        "Hecho con chiles habaneros seleccionados. 100% caseros, crujiente, picosito y delicioso. Sin conservadores.",
      // Dato mockup: precio se editará desde el panel admin (Feature 002).
      priceCents: 15000,
      presentation: "190g",
      imageUrl: null,
      available: true,
      nomExcesoCalorias: true,
      nomExcesoSodio: true,
    },
  });

  await prisma.product.upsert({
    where: { flavorSlug: "serrano" },
    update: {},
    create: {
      name: "Chicharrón de chiles serranos",
      flavorSlug: "serrano",
      description:
        "100% caseros, crujiente, picosito y delicioso. Sin conservadores. Producto artesanal hecho en México.",
      priceCents: 15000,
      presentation: "190g",
      imageUrl: null,
      available: true,
      nomExcesoCalorias: true,
      nomExcesoSodio: true,
    },
  });

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL y ADMIN_PASSWORD son requeridos para sembrar las cuentas admin (SPEC-002)");
  }
  const passwordHash = hashPassword(adminPassword);

  for (const email of [adminEmail, SECOND_ADMIN_EMAIL]) {
    await prisma.adminUser.upsert({
      where: { email },
      update: {},
      create: { email, passwordHash, active: true },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
