"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@prisma/client";
import ImageUploadField from "@/components/admin/ImageUploadField";
import Notice from "@/components/admin/Notice";
import { mutate } from "@/lib/admin/mutate";
import { setFlash, type Flash } from "@/lib/admin/flash";

// RF-106, RF-107, RF-109, RF-110, RF-121, RF-122, RF-123
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
  const [notice, setNotice] = useState<Flash | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name || !flavorSlug || !description || !presentation) {
      setError("Completa todos los campos requeridos");
      return;
    }
    setError(null);
    setNotice(null);
    setSaving(true);

    const payload = { name, flavorSlug, description, priceCents, presentation, nomExcesoCalorias, nomExcesoSodio };
    const saved = await mutate<{ id: string }>(
      isEdit ? `/api/admin/products/${product!.id}` : "/api/admin/products",
      {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (!saved.ok) {
      setError(saved.error);
      setSaving(false);
      return;
    }

    const savedLabel = isEdit ? "Producto actualizado" : "Producto creado";
    let flash: Flash = { variant: "success", message: savedLabel };

    if (imageFile) {
      // Un 2xx sin cuerpo JSON trae data null — en edición el id ya se conoce.
      const productId = saved.data?.id ?? product?.id;
      const upload = productId
        ? await mutate(`/api/admin/products/${productId}/image`, { method: "POST", body: imageForm(imageFile) })
        : ({ ok: false, error: "el servidor no devolvió el id del producto" } as const);
      flash = upload.ok
        ? { variant: "success", message: `${savedLabel} y la imagen se subió correctamente` }
        : { variant: "warning", message: `Producto guardado, pero la imagen no se pudo subir: ${upload.error}` };
    }

    // RF-123 — el aviso viaja a la lista y se queda ahí hasta que se cierra.
    setFlash(flash);
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

      <ImageUploadField
        label="Imagen del producto"
        currentUrl={product?.imageUrl ?? null}
        onFileSelected={setImageFile}
        onRemoveCurrent={
          isEdit
            ? async () => {
                const removed = await mutate(`/api/admin/products/${product!.id}/image`, { method: "DELETE" });
                setNotice(
                  removed.ok
                    ? { variant: "success", message: "Imagen eliminada" }
                    : { variant: "error", message: `No se pudo quitar la imagen: ${removed.error}` },
                );
                if (removed.ok) router.refresh();
              }
            : undefined
        }
      />

      {notice && <Notice variant={notice.variant} message={notice.message} onClose={() => setNotice(null)} />}
      {error && <Notice variant="error" message={error} onClose={() => setError(null)} />}

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

function imageForm(file: File): FormData {
  const form = new FormData();
  form.set("file", file);
  return form;
}
