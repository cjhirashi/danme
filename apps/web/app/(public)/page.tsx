import { Hero } from "@/components/landing/Hero";
import { Catalog } from "@/components/landing/Catalog";
import { About } from "@/components/landing/About";
import { Contact } from "@/components/landing/Contact";
import { Footer } from "@/components/landing/Footer";
import { getCatalog, getSiteSettings } from "@/lib/services/content.service";

// Contenido viene de Postgres y lo editará el panel admin (Feature 002) sin
// rebuild — debe leerse en cada request, no hornearse en build time.
export const dynamic = "force-dynamic";

// RF-001
export default async function LandingPage() {
  const [products, settings] = await Promise.all([getCatalog(), getSiteSettings()]);

  return (
    <>
      <Hero settings={settings} />
      <Catalog products={products} />
      <About />
      <Contact settings={settings} />
      <Footer settings={settings} />
    </>
  );
}
