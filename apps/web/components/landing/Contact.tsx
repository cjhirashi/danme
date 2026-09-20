import type { SiteSettings } from "@prisma/client";
import { buildWhatsAppLink } from "@/lib/services/content.service";

export function Contact({ settings }: { settings: SiteSettings }) {
  const whatsappLink = buildWhatsAppLink(
    settings.whatsappNumber,
    `Hola, quiero pedir chicharrón ${settings.brandName}`,
  );

  return (
    <section id="contacto" className="bg-verde-danme px-4 py-16 text-center text-white sm:px-8">
      <h2 className="text-3xl font-bold">¿Se te antojó?</h2>
      <p className="mt-2 text-white/90">Haz tu pedido directo por WhatsApp.</p>

      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-verde-danme transition hover:opacity-90"
      >
        Pedir por WhatsApp
      </a>

      <div className="mt-6 flex justify-center gap-4 text-sm">
        {settings.instagramUrl && (
          <a href={settings.instagramUrl} className="underline">
            Instagram
          </a>
        )}
        {settings.facebookUrl && (
          <a href={settings.facebookUrl} className="underline">
            Facebook
          </a>
        )}
      </div>
    </section>
  );
}
