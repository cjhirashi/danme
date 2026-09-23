import type { SiteSettings } from "@prisma/client";

// SPEC-002 RF-112 (extensión) — aboutText editable desde /admin/settings
export function About({ settings }: { settings: SiteSettings }) {
  return (
    <section id="sobre-danme" className="px-4 py-16 sm:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold text-verde-oscuro">Sobre {settings.brandName}</h2>
        <p className="mt-4 text-verde-oscuro/80">{settings.aboutText}</p>
      </div>
    </section>
  );
}
