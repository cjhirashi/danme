"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettings } from "@prisma/client";

// RF-112, RF-113
export default function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [brandName, setBrandName] = useState(settings.brandName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [instagramUrl, setInstagramUrl] = useState(settings.instagramUrl ?? "");
  const [facebookUrl, setFacebookUrl] = useState(settings.facebookUrl ?? "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brandName,
        tagline,
        whatsappNumber,
        instagramUrl: instagramUrl || null,
        facebookUrl: facebookUrl || null,
      }),
    });

    if (logoFile) {
      const form = new FormData();
      form.set("file", logoFile);
      await fetch("/api/admin/settings/logo", { method: "POST", body: form });
    }

    setSaving(false);
    setMessage("Guardado.");
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
      <label className="flex flex-col gap-1 text-sm font-medium text-verde-oscuro">
        Logo (JPG/PNG/WebP, máx 5MB)
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
        />
      </label>

      {settings.logoUrl && (
        <button
          type="button"
          className="self-start text-sm text-red-600 underline"
          onClick={async () => {
            await fetch("/api/admin/settings/logo", { method: "DELETE" });
            router.refresh();
          }}
        >
          Quitar logo actual
        </button>
      )}

      {message && <p className="text-sm text-verde-danme">{message}</p>}

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
