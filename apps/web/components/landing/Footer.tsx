import type { SiteSettings } from "@prisma/client";
import { buildWhatsAppLink } from "@/lib/services/content.service";
import { WhatsAppIcon, InstagramIcon, FacebookIcon } from "@/components/landing/SocialIcons";

const iconButtonClass =
  "flex h-10 w-10 items-center justify-center rounded-full bg-crema/10 text-crema transition hover:bg-crema/20";

export function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();
  const whatsappLink = buildWhatsAppLink(
    settings.whatsappNumber,
    `Hola, quiero pedir chicharrón ${settings.brandName}`,
  );

  return (
    <footer className="bg-verde-oscuro px-4 py-8 text-center text-sm text-crema/80 sm:px-8">
      <p className="font-semibold text-crema">{settings.brandName}</p>

      <div className="mt-4 flex justify-center gap-3">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          className={iconButtonClass}
        >
          <WhatsAppIcon className="h-5 w-5" />
        </a>
        {settings.instagramUrl && (
          <a
            href={settings.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className={iconButtonClass}
          >
            <InstagramIcon className="h-5 w-5" />
          </a>
        )}
        {settings.facebookUrl && (
          <a
            href={settings.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className={iconButtonClass}
          >
            <FacebookIcon className="h-5 w-5" />
          </a>
        )}
      </div>

      <p className="mt-4">
        © {year} {settings.brandName}. Producto artesanal hecho en México.
      </p>
    </footer>
  );
}
