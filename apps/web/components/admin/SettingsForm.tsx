"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettings } from "@prisma/client";
import ImageUploadField from "@/components/admin/ImageUploadField";
import Notice from "@/components/admin/Notice";
import { mutate } from "@/lib/admin/mutate";
import type { Flash } from "@/lib/admin/flash";

// RF-112, RF-113, RF-121, RF-122
export default function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [brandName, setBrandName] = useState(settings.brandName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [aboutText, setAboutText] = useState(settings.aboutText);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [instagramUrl, setInstagramUrl] = useState(settings.instagramUrl ?? "");
  const [facebookUrl, setFacebookUrl] = useState(settings.facebookUrl ?? "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Flash | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setNotice(null);

    const saved = await mutate("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brandName,
        tagline,
        aboutText,
        whatsappNumber,
        instagramUrl: instagramUrl || null,
        facebookUrl: facebookUrl || null,
      }),
    });

    if (!saved.ok) {
      setSaving(false);
      setNotice({ variant: "error", message: `No se pudieron guardar los cambios: ${saved.error}` });
      return;
    }

    let next: Flash = { variant: "success", message: "Los cambios se guardaron y ya se ven en la landing." };
    if (logoFile) {
      const form = new FormData();
      form.set("file", logoFile);
      const upload = await mutate("/api/admin/settings/logo", { method: "POST", body: form });
      next = upload.ok
        ? { variant: "success", message: "Los cambios y el logo se guardaron y ya se ven en la landing." }
        : { variant: "warning", message: `Los cambios se guardaron, pero el logo no se pudo subir: ${upload.error}` };
    }

    setSaving(false);
    setNotice(next);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium text-verde-oscuro">
        Marca
        <input className="rounded border px-3 py-2" value={brandName} onChange={(e) => setBrandName(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-verde-oscuro">
        Tagline
        <input className="rounded border px-3 py-2" value={tagline} onChange={(e) => setTagline(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-verde-oscuro">
        Sobre {brandName || "el negocio"} (sección de la landing)
        <textarea
          rows={4}
          className="rounded border px-3 py-2"
          value={aboutText}
          onChange={(e) => setAboutText(e.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-verde-oscuro">
        WhatsApp
        <input
          className="rounded border px-3 py-2"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-verde-oscuro">
        Instagram
        <input
          className="rounded border px-3 py-2"
          value={instagramUrl}
          onChange={(e) => setInstagramUrl(e.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-verde-oscuro">
        Facebook
        <input
          className="rounded border px-3 py-2"
          value={facebookUrl}
          onChange={(e) => setFacebookUrl(e.target.value)}
        />
      </label>
      <ImageUploadField
        label="Logo"
        currentUrl={settings.logoUrl}
        onFileSelected={setLogoFile}
        onRemoveCurrent={async () => {
          const removed = await mutate("/api/admin/settings/logo", { method: "DELETE" });
          setNotice(
            removed.ok
              ? { variant: "success", message: "Logo eliminado" }
              : { variant: "error", message: `No se pudo quitar el logo: ${removed.error}` },
          );
          if (removed.ok) router.refresh();
        }}
      />

      {notice && <Notice variant={notice.variant} message={notice.message} onClose={() => setNotice(null)} />}

      <button
        type="submit"
        disabled={saving}
        className="rounded bg-verde-danme py-2 font-semibold text-white disabled:opacity-60"
      >
        {saving ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}
