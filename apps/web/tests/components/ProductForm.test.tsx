import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

const { default: ProductForm } = await import("@/components/admin/ProductForm");

// RF-106
describe("ProductForm", () => {
  it("no envía la request si faltan campos requeridos", async () => {
    render(<ProductForm />);
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /^(crear producto|actualizar)$/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/completa todos los campos/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("envía POST con los datos cuando el formulario es válido", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "1" }),
    });

    render(<ProductForm />);
    fireEvent.change(screen.getByLabelText(/^nombre/i), { target: { value: "Habanero" } });
    fireEvent.change(screen.getByLabelText(/sabor/i), { target: { value: "habanero" } });
    fireEvent.change(screen.getByLabelText(/descripción/i), { target: { value: "desc" } });
    fireEvent.change(screen.getByLabelText(/presentación/i), { target: { value: "190g" } });
    fireEvent.click(screen.getByRole("button", { name: /^(crear producto|actualizar)$/i }));

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/products",
      expect.objectContaining({ method: "POST" }),
    ));
  });
});
