import type { SiteSettings } from "@prisma/client";

export function Hero({ settings }: { settings: SiteSettings }) {
  return (
    <section className="flex flex-col items-center justify-center gap-4 bg-verde-oscuro px-4 py-24 text-center text-crema sm:px-8">
      <span className="rounded-full bg-ambar px-4 py-1 text-sm font-semibold uppercase text-verde-oscuro">
        100% caseros
      </span>
      <h1 className="text-4xl font-bold sm:text-6xl">{settings.brandName}</h1>
      <p className="max-w-xl text-lg text-crema/90 sm:text-xl">{settings.tagline}</p>
      <a
        href="#catalogo"
        className="mt-4 rounded-full bg-naranja-quemado px-6 py-3 font-semibold text-white transition hover:opacity-90"
      >
        Ver catálogo
      </a>
    </section>
  );
}
