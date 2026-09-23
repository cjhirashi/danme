"use client";

import { useState, type ChangeEvent } from "react";

// RF-109, RF-110, RF-111, RF-113 — control de carga de imagen (antes: <input type=file> desnudo)
export default function ImageUploadField({
  label,
  currentUrl,
  onFileSelected,
  onRemoveCurrent,
}: {
  label: string;
  currentUrl: string | null;
  onFileSelected: (file: File | null) => void;
  onRemoveCurrent?: () => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    onFileSelected(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  const displayUrl = previewUrl ?? currentUrl;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-verde-oscuro">{label}</span>

      <label className="flex cursor-pointer items-center gap-4 rounded border-2 border-dashed border-verde-danme/40 p-4 transition hover:border-verde-danme hover:bg-verde-danme/5">
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- preview de archivo local/remoto, no optimizable con next/image
          <img src={displayUrl} alt="" className="h-16 w-16 rounded object-cover" />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded bg-crema text-xs text-verde-danme/60">
            Sin imagen
          </div>
        )}

        <span className="text-sm">
          <span className="block font-medium text-verde-oscuro">
            {displayUrl ? "Cambiar imagen" : "Subir imagen"}
          </span>
          <span className="block text-xs text-verde-oscuro/60">JPG, PNG o WebP — máx 5MB</span>
        </span>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          className="hidden"
        />
      </label>

      {currentUrl && !previewUrl && onRemoveCurrent && (
        <button
          type="button"
          onClick={onRemoveCurrent}
          className="self-start text-sm text-red-600 underline"
        >
          Quitar imagen actual
        </button>
      )}
    </div>
  );
}
