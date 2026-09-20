import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

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
