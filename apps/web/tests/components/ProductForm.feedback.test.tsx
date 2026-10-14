import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { Product } from "@prisma/client";
import { consumeFlash } from "@/lib/admin/flash";

const push = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  push.mockReset();
  refresh.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  // jsdom no implementa createObjectURL (lo usa la vista previa de ImageUploadField)
  URL.createObjectURL = vi.fn(() => "blob:preview");
});
afterEach(() => sessionStorage.clear());

const { default: ProductForm } = await import("@/components/admin/ProductForm");

const product = {
  id: "p1",
  name: "Habanero",
  flavorSlug: "habanero",
  description: "desc",
  priceCents: 15000,
  presentation: "190g",
  nomExcesoCalorias: false,
  nomExcesoSodio: false,
  imageUrl: "/uploads/products/old.jpg",
  available: true,
} as unknown as Product;

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });
const problem = (status: number, detail: string) => json(status, { title: "Error", status, detail });

function fillNew() {
  fireEvent.change(screen.getByLabelText(/^nombre/i), { target: { value: "Habanero" } });
  fireEvent.change(screen.getByLabelText(/sabor/i), { target: { value: "habanero" } });
  fireEvent.change(screen.getByLabelText(/descripción/i), { target: { value: "desc" } });
}

function pickImage(container: HTMLElement) {
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [new File(["x"], "jar.jpg", { type: "image/jpeg" })] } });
}

const submit = () => fireEvent.click(screen.getByRole("button", { name: /^(crear producto|actualizar)$/i }));

// RF-121, RF-123
describe("ProductForm — avisos tras guardar", () => {
  it("crear con éxito → vuelve a la lista con 'Producto creado'", async () => {
    fetchMock.mockResolvedValueOnce(json(201, { id: "p9" }));
    render(<ProductForm />);
    fillNew();
    submit();
    await waitFor(() => expect(push).toHaveBeenCalledWith("/admin/products"));
    expect(consumeFlash()).toEqual({ variant: "success", message: "Producto creado" });
    expect(refresh).toHaveBeenCalled(); // RF-128
  });

  it("editar con éxito → 'Producto actualizado'", async () => {
    fetchMock.mockResolvedValueOnce(json(200, { id: "p1" }));
    render(<ProductForm product={product} />);
    submit();
    await waitFor(() => expect(push).toHaveBeenCalledWith("/admin/products"));
    expect(consumeFlash()).toEqual({ variant: "success", message: "Producto actualizado" });
    expect(refresh).toHaveBeenCalled(); // RF-128
  });

  it("registro + imagen con éxito → lo dice explícitamente", async () => {
    fetchMock.mockResolvedValueOnce(json(201, { id: "p9" })).mockResolvedValueOnce(json(200, { id: "p9" }));
    const { container } = render(<ProductForm />);
    fillNew();
    pickImage(container);
    submit();
    await waitFor(() => expect(push).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenLastCalledWith("/api/admin/products/p9/image", expect.objectContaining({ method: "POST" }));
    expect(consumeFlash()).toEqual({ variant: "success", message: "Producto creado y la imagen se subió correctamente" });
  });

  // RF-122, RF-123 — el bug reportado: la imagen fallaba y nadie se enteraba
  it("registro ok pero imagen falla → aviso parcial con el motivo", async () => {
    fetchMock
      .mockResolvedValueOnce(json(200, { id: "p1" }))
      .mockResolvedValueOnce(new Response("Internal Server Error", { status: 500 }));
    const { container } = render(<ProductForm product={product} />);
    pickImage(container);
    submit();
    await waitFor(() => expect(push).toHaveBeenCalledWith("/admin/products"));
    expect(consumeFlash()).toEqual({
      variant: "warning",
      message: "Producto guardado, pero la imagen no se pudo subir: Error del servidor (500)",
    });
    expect(refresh).toHaveBeenCalled(); // RF-128 — el registro sí cambió
  });

  // RF-122
  it("el registro falla → se queda en el formulario con el motivo y no sube la imagen", async () => {
    fetchMock.mockResolvedValueOnce(problem(409, "Ya existe un producto con ese sabor"));
    const { container } = render(<ProductForm />);
    fillNew();
    pickImage(container);
    submit();
    expect(await screen.findByRole("alert")).toHaveTextContent("Ya existe un producto con ese sabor");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(push).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /^(crear producto|actualizar)$/i })).toBeEnabled();
  });

  it("sin red → mensaje de red", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    render(<ProductForm product={product} />);
    submit();
    expect(await screen.findByRole("alert")).toHaveTextContent(/no se pudo conectar con el servidor/i);
  });
});

// RF-121, RF-122
describe("ProductForm — quitar imagen actual", () => {
  it("éxito → 'Imagen eliminada'", async () => {
    fetchMock.mockResolvedValueOnce(json(200, { id: "p1" }));
    render(<ProductForm product={product} />);
    fireEvent.click(screen.getByRole("button", { name: /quitar imagen/i }));
    expect(await screen.findByRole("status")).toHaveTextContent("Imagen eliminada");
    expect(fetchMock).toHaveBeenCalledWith("/api/admin/products/p1/image", { method: "DELETE" });
    expect(refresh).toHaveBeenCalled();
  });

  it("falla → error con el motivo", async () => {
    fetchMock.mockResolvedValueOnce(problem(404, "No existe un producto con id p1"));
    render(<ProductForm product={product} />);
    fireEvent.click(screen.getByRole("button", { name: /quitar imagen/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo quitar la imagen: No existe un producto con id p1");
  });

  // RF-121 — un 2xx sin cuerpo JSON no puede tumbar el flujo en silencio
  it("crear con 2xx sin id + imagen → aviso de imagen no subida, sin excepción", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 201 }));
    const { container } = render(<ProductForm />);
    fillNew();
    pickImage(container);
    submit();
    await waitFor(() => expect(push).toHaveBeenCalledWith("/admin/products"));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(consumeFlash()).toEqual({
      variant: "warning",
      message: "Producto guardado, pero la imagen no se pudo subir: el servidor no devolvió el id del producto",
    });
  });

  it("editar con 2xx sin cuerpo + imagen → sube la imagen al id conocido", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 200 })).mockResolvedValueOnce(json(200, { id: "p1" }));
    const { container } = render(<ProductForm product={product} />);
    pickImage(container);
    submit();
    await waitFor(() => expect(push).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenLastCalledWith("/api/admin/products/p1/image", expect.objectContaining({ method: "POST" }));
    expect(consumeFlash()).toEqual({ variant: "success", message: "Producto actualizado y la imagen se subió correctamente" });
  });
});
