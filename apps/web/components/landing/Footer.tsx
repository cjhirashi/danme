import type { SiteSettings } from "@prisma/client";

export function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-verde-oscuro px-4 py-8 text-center text-sm text-crema/80 sm:px-8">
      <p className="font-semibold text-crema">{settings.brandName}</p>
      <div className="mt-2 flex justify-center gap-4">
        {settings.instagramUrl && (
          <a href={settings.instagramUrl} className="hover:text-crema">
            Instagram
          </a>
        )}
        {settings.facebookUrl && (
          <a href={settings.facebookUrl} className="hover:text-crema">
            Facebook
          </a>
        )}
      </div>
      <p className="mt-4">
        © {year} {settings.brandName}. Producto artesanal hecho en México.
      </p>
    </footer>
  );
}
