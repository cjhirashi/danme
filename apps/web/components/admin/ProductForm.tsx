"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@prisma/client";

// RF-106, RF-107, RF-109, RF-110
export default function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [name, setName] = useState(product?.name ?? "");
  const [flavorSlug, setFlavorSlug] = useState(product?.flavorSlug ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [priceCents, setPriceCents] = useState(product?.priceCents ?? 0);
  const [presentation, setPresentation] = useState(product?.presentation ?? "190g");
  const [nomExcesoCalorias, setNomExcesoCalorias] = useState(product?.nomExcesoCalorias ?? false);
  const [nomExcesoSodio, setNomExcesoSodio] = useState(product?.nomExcesoSodio ?? false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name || !flavorSlug || !description || !presentation) {
      setError("Completa todos los campos requeridos");
      return;
    }
    setError(null);
    setSaving(true);

    const payload = { name, flavorSlug, description, priceCents, presentation, nomExcesoCalorias, nomExcesoSodio };
    const res = await fetch(
      isEdit ? `/api/admin/products/${product!.id}` : "/api/admin/products",
      {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.detail ?? "No se pudo guardar el producto");
      setSaving(false);
      return;
    }

    const saved = await res.json();

    if (imageFile) {
      const form = new FormData();
      form.set("file", imageFile);
      await fetch(`/api/admin/products/${saved.id}/image`, { method: "POST", body: form });
    }

    setSaving(false);
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium text-verde-oscuro">
        Nombre
        <input className="rounded border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-verde-oscuro">
        Sabor (slug único)
        <input
          className="rounded border px-3 py-2"
          value={flavorSlug}
          onChange={(e) => setFlavorSlug(e.target.value)}
          disabled={isEdit}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-verde-oscuro">
        Descripción
        <textarea
          className="rounded border px-3 py-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-verde-oscuro">
        Precio (centavos MXN)
        <input
          type="number"
          className="rounded border px-3 py-2"
          value={priceCents}
          onChange={(e) => setPriceCents(Number(e.target.value))}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-verde-oscuro">
        Presentación
        <input
          className="rounded border px-3 py-2"
          value={presentation}
          onChange={(e) => setPresentation(e.target.value)}
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-verde-oscuro">
        <input
          type="checkbox"
          checked={nomExcesoCalorias}
          onChange={(e) => setNomExcesoCalorias(e.target.checked)}
        />
        Exceso calorías
      </label>
      <label className="flex items-center gap-2 text-sm text-verde-oscuro">
        <input
          type="checkbox"
          checked={nomExcesoSodio}
          onChange={(e) => setNomExcesoSodio(e.target.checked)}
        />
        Exceso sodio
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-verde-oscuro">
        Imagen (JPG/PNG/WebP, máx 5MB)
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
        />
      </label>

      {isEdit && product?.imageUrl && (
        <button
          type="button"
          className="self-start text-sm text-red-600 underline"
          onClick={async () => {
            await fetch(`/api/admin/products/${product.id}/image`, { method: "DELETE" });
            router.refresh();
          }}
        >
          Quitar imagen actual
        </button>
      )}

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

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
