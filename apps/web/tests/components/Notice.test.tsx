import { describe, expect, it, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Notice from "@/components/admin/Notice";
import FlashNotice from "@/components/admin/FlashNotice";
import { setFlash } from "@/lib/admin/flash";

afterEach(() => sessionStorage.clear());

// RF-121
describe("Notice", () => {
  it("éxito se anuncia como status", () => {
    render(<Notice variant="success" message="Producto creado" />);
    expect(screen.getByRole("status")).toHaveTextContent("Producto creado");
  });

  it("error y éxito parcial se anuncian como alert", () => {
    const { rerender } = render(<Notice variant="error" message="No se pudo guardar" />);
    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo guardar");
    rerender(<Notice variant="warning" message="Guardado, pero la imagen falló" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Guardado, pero la imagen falló");
  });

  it("el botón Cerrar llama a onClose", () => {
    let closed = false;
    render(<Notice variant="success" message="ok" onClose={() => (closed = true)} />);
    fireEvent.click(screen.getByRole("button", { name: /cerrar/i }));
    expect(closed).toBe(true);
  });
});

// RF-123
describe("FlashNotice", () => {
  it("muestra el aviso dejado antes de navegar y lo consume", () => {
    setFlash({ variant: "success", message: "Producto actualizado" });
    render(<FlashNotice />);
    expect(screen.getByRole("status")).toHaveTextContent("Producto actualizado");
    expect(sessionStorage.getItem("danme:flash")).toBeNull();
  });

  it("muestra un aviso emitido en la misma página", () => {
    render(<FlashNotice />);
    expect(screen.queryByRole("alert")).toBeNull();
    act(() => setFlash({ variant: "error", message: "No se pudo desactivar" }));
    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo desactivar");
  });

  it("permanece hasta que se cierra", () => {
    setFlash({ variant: "warning", message: "Producto guardado, pero la imagen no se pudo subir" });
    render(<FlashNotice />);
    fireEvent.click(screen.getByRole("button", { name: /cerrar/i }));
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
