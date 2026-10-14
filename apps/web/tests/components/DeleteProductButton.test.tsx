import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { consumeFlash } from "@/lib/admin/flash";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh }) }));

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  refresh.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => sessionStorage.clear());

const { default: DeleteProductButton } = await import("@/components/admin/DeleteProductButton");

const problem = (status: number, detail: string) =>
  new Response(JSON.stringify({ title: "Error", status, detail }), { status });

function open() {
  render(<DeleteProductButton productId="p1" productName="Habanero" />);
  fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));
  return screen.getByRole("dialog");
}

// RF-125
describe("DeleteProductButton — confirmación", () => {
  it("no muestra el diálogo hasta pulsar Eliminar", () => {
    render(<DeleteProductButton productId="p1" productName="Habanero" />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("el diálogo nombra el producto y advierte que no se puede deshacer", () => {
    const dialog = open();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveTextContent("¿Eliminar definitivamente «Habanero»? Esta acción no se puede deshacer.");
  });

  it("Tab no saca el foco del diálogo (aria-modal)", () => {
    const dialog = open();
    const [cancel, confirm] = within(dialog).getAllByRole("button");
    confirm.focus();
    fireEvent.keyDown(confirm, { key: "Tab" });
    expect(cancel).toHaveFocus();
    fireEvent.keyDown(cancel, { key: "Tab", shiftKey: true });
    expect(confirm).toHaveFocus();
  });

  it("Cancelar cierra sin enviar nada", () => {
    open();
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("Escape cierra sin enviar nada", () => {
    const dialog = open();
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("clic en el fondo cierra sin enviar nada", () => {
    open();
    fireEvent.click(screen.getByTestId("dialog-backdrop"));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

// RF-126, RF-127, RF-128
describe("DeleteProductButton — resultado", () => {
  it("confirmar con éxito → DELETE, aviso de éxito y refresh de la lista", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    const dialog = open();
    fireEvent.click(within(dialog).getByRole("button", { name: "Eliminar" }));
    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith("/api/admin/products/p1", expect.objectContaining({ method: "DELETE" }));
    expect(consumeFlash()).toEqual({ variant: "success", message: "Producto «Habanero» eliminado" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("error del servidor → aviso con el motivo y sin refresh", async () => {
    fetchMock.mockResolvedValueOnce(problem(404, "No existe un producto con id p1"));
    const dialog = open();
    fireEvent.click(within(dialog).getByRole("button", { name: "Eliminar" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(consumeFlash()).toEqual({
      variant: "error",
      message: "No se pudo eliminar «Habanero»: No existe un producto con id p1",
    });
    expect(refresh).not.toHaveBeenCalled();
  });

  it("error de red → aviso 'no se pudo conectar'", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    const dialog = open();
    fireEvent.click(within(dialog).getByRole("button", { name: "Eliminar" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(consumeFlash()?.message).toBe("No se pudo eliminar «Habanero»: No se pudo conectar con el servidor");
  });

  it("mientras borra, el botón dice 'Eliminando…' y no permite doble envío", async () => {
    let resolve!: (r: Response) => void;
    fetchMock.mockReturnValueOnce(new Promise<Response>((r) => (resolve = r)));
    const dialog = open();
    fireEvent.click(within(dialog).getByRole("button", { name: "Eliminar" }));
    const busy = await within(dialog).findByRole("button", { name: "Eliminando…" });
    expect(busy).toBeDisabled();
    fireEvent.click(busy);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    resolve(new Response(null, { status: 204 }));
    await waitFor(() => expect(refresh).toHaveBeenCalled());
  });
});
