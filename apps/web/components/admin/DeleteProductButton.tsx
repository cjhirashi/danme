"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AdminButton from "@/components/admin/AdminButton";
import { mutate } from "@/lib/admin/mutate";
import { setFlash } from "@/lib/admin/flash";

// RF-125, RF-126, RF-127, RF-128
export default function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);

  function close() {
    if (!deleting) setOpen(false);
  }

  // Escape cierra desde cualquier foco; el foco entra al diálogo al abrirlo.
  useEffect(() => {
    if (open) dialogRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return close();
      if (e.key !== "Tab" || !dialogRef.current) return;
      // Trampa de foco: Tab / Shift+Tab ciclan dentro del diálogo.
      const buttons = Array.from(dialogRef.current.querySelectorAll("button"));
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === dialogRef.current)) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  async function confirm() {
    if (deleting) return;
    setDeleting(true);
    const result = await mutate(`/api/admin/products/${productId}`, { method: "DELETE" });
    setDeleting(false);
    setOpen(false);
    setFlash(
      result.ok
        ? { variant: "success", message: `Producto «${productName}» eliminado` }
        : { variant: "error", message: `No se pudo eliminar «${productName}»: ${result.error}` },
    );
    if (result.ok) router.refresh();
  }

  return (
    <>
      <AdminButton variant="danger" onClick={() => setOpen(true)}>
        Eliminar
      </AdminButton>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div data-testid="dialog-backdrop" className="absolute inset-0 bg-black/50" onClick={close} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            ref={dialogRef}
            tabIndex={-1}
            className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
          >
            <p id={titleId} className="text-base text-gray-900">
              ¿Eliminar definitivamente «{productName}»? Esta acción no se puede deshacer.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <AdminButton variant="secondary" onClick={close} disabled={deleting}>
                Cancelar
              </AdminButton>
              <AdminButton variant="danger" onClick={confirm} disabled={deleting}>
                {deleting ? "Eliminando…" : "Eliminar"}
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
