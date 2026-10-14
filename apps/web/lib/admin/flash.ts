// RF-123 — aviso que sobrevive a un cambio de página (guardar producto → lista).
// Vive en sessionStorage, no en la URL: un link no puede fabricar un aviso falso.
export type NoticeVariant = "success" | "error" | "warning";
export type Flash = { variant: NoticeVariant; message: string };

const KEY = "danme:flash";
export const FLASH_EVENT = "danme:flash";

export function setFlash(flash: Flash): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(flash));
  } catch {
    // Sin storage el aviso se pierde, pero la operación ya terminó — no se rompe.
  }
  window.dispatchEvent(new CustomEvent<Flash>(FLASH_EVENT, { detail: flash }));
}

export function consumeFlash(): Flash | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    sessionStorage.removeItem(KEY);
    return JSON.parse(raw) as Flash;
  } catch {
    return null;
  }
}
