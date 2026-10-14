"use client";

import { useEffect, useState } from "react";
import Notice from "@/components/admin/Notice";
import { consumeFlash, FLASH_EVENT, type Flash } from "@/lib/admin/flash";

// RF-123 — muestra el aviso dejado por la página anterior (o emitido en esta misma
// página por un toggle) y lo mantiene hasta que el usuario lo cierra.
export default function FlashNotice() {
  const [flash, setFlash] = useState<Flash | null>(null);

  useEffect(() => {
    const pending = consumeFlash();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage solo existe en el cliente; leerlo tras montar evita mismatch de hidratación
    if (pending) setFlash(pending);

    function onFlash() {
      const next = consumeFlash();
      if (next) setFlash(next);
    }
    window.addEventListener(FLASH_EVENT, onFlash);
    return () => window.removeEventListener(FLASH_EVENT, onFlash);
  }, []);

  if (!flash) return null;
  return (
    <div className="mb-4">
      <Notice variant={flash.variant} message={flash.message} onClose={() => setFlash(null)} />
    </div>
  );
}
