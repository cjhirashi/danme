import { describe, expect, it, vi, afterEach } from "vitest";
import { setFlash, consumeFlash, FLASH_EVENT } from "@/lib/admin/flash";

afterEach(() => {
  vi.restoreAllMocks();
  sessionStorage.clear();
});

// RF-123
describe("flash", () => {
  it("setFlash → consumeFlash devuelve el aviso una sola vez", () => {
    setFlash({ variant: "success", message: "Producto creado" });
    expect(consumeFlash()).toEqual({ variant: "success", message: "Producto creado" });
    expect(consumeFlash()).toBeNull();
  });

  it("setFlash emite el evento para avisos en la misma página", () => {
    const listener = vi.fn();
    window.addEventListener(FLASH_EVENT, listener);
    setFlash({ variant: "error", message: "No se pudo" });
    window.removeEventListener(FLASH_EVENT, listener);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("un valor corrupto en storage no rompe: devuelve null", () => {
    sessionStorage.setItem("danme:flash", "{no-json");
    expect(consumeFlash()).toBeNull();
  });

  it("si el storage lanza, no rompe la operación", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => setFlash({ variant: "success", message: "x" })).not.toThrow();
    expect(consumeFlash()).toBeNull();
  });
});
