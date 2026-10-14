import type { SiteSettings } from "@prisma/client";
import { buildWhatsAppLink } from "@/lib/services/content.service";

export function Contact({ settings }: { settings: SiteSettings }) {
  const whatsappLink = buildWhatsAppLink(
    settings.whatsappNumber,
    `Hola, quiero pedir chicharrón ${settings.brandName}`,
  );

  return (
    <>
      <style>{`
        .cta-button {
          transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cta-button:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
          transform: scale(1.05);
        }
      `}</style>
      <section id="contacto" className="bg-verde-danme px-4 py-16 text-center text-white sm:px-8">
        <h2 className="text-3xl font-bold">¿Se te antojó?</h2>
        <p className="mt-2 text-white/90">Haz tu pedido directo por WhatsApp.</p>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="cta-button mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-verde-danme"
        >
          Pedir por WhatsApp
        </a>
      </section>
    </>
  );
}
