import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { SiteSettings } from "@prisma/client";
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
  URL.createObjectURL = vi.fn(() => "blob:preview");
});
afterEach(() => sessionStorage.clear());

const { default: SettingsForm } = await import("@/components/admin/SettingsForm");
const { default: ProductAvailabilityToggle } = await import("@/components/admin/ProductAvailabilityToggle");
const { default: UserActiveToggle } = await import("@/components/admin/UserActiveToggle");
const { default: NewAdminUserPage } = await import("@/app/admin/(protected)/users/new/page");

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });
const problem = (status: number, detail: string) => json(status, { title: "Error", status, detail });

const settings = {
  id: "s",
  brandName: "DanMe",
  tagline: "t",
  aboutText: "a",
  whatsappNumber: "521",
  instagramUrl: null,
  facebookUrl: null,
  logoUrl: "/uploads/settings/logo.png",
} as unknown as SiteSettings;

function pickLogo(container: HTMLElement) {
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [new File(["x"], "logo.png", { type: "image/png" })] } });
}

// RF-121, RF-122
describe("SettingsForm", () => {
  const save = () => fireEvent.click(screen.getByRole("button", { name: /guardar/i }));

  it("guardar con éxito → mensaje de éxito", async () => {
    fetchMock.mockResolvedValueOnce(json(200, settings));
    render(<SettingsForm settings={settings} />);
    save();
    expect(await screen.findByRole("status")).toHaveTextContent(/se guardaron/i);
  });

  it("guardar falla → error con el motivo y no sube el logo", async () => {
    fetchMock.mockResolvedValueOnce(problem(400, "WhatsApp inválido"));
    const { container } = render(<SettingsForm settings={settings} />);
    pickLogo(container);
    save();
    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudieron guardar los cambios: WhatsApp inválido");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("cambios ok + logo ok → lo dice", async () => {
    fetchMock.mockResolvedValueOnce(json(200, settings)).mockResolvedValueOnce(json(200, settings));
    const { container } = render(<SettingsForm settings={settings} />);
    pickLogo(container);
    save();
    expect(await screen.findByRole("status")).toHaveTextContent(/cambios y el logo se guardaron/i);
  });

  it("cambios ok pero logo falla → aviso parcial con el motivo", async () => {
    fetchMock
      .mockResolvedValueOnce(json(200, settings))
      .mockResolvedValueOnce(problem(400, "El archivo supera el máximo de 5MB"));
    const { container } = render(<SettingsForm settings={settings} />);
    pickLogo(container);
    save();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Los cambios se guardaron, pero el logo no se pudo subir: El archivo supera el máximo de 5MB",
    );
  });

  it("quitar logo: éxito y error", async () => {
    fetchMock.mockResolvedValueOnce(json(200, settings));
    const { unmount } = render(<SettingsForm settings={settings} />);
    fireEvent.click(screen.getByRole("button", { name: /quitar imagen/i }));
    expect(await screen.findByRole("status")).toHaveTextContent("Logo eliminado");
    unmount();

    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    render(<SettingsForm settings={settings} />);
    fireEvent.click(screen.getByRole("button", { name: /quitar imagen/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/no se pudo quitar el logo: no se pudo conectar/i);
  });
});

// RF-121, RF-122
describe("toggles de activar/desactivar", () => {
  it("producto: éxito → aviso con el nombre", async () => {
    fetchMock.mockResolvedValueOnce(json(200, {}));
    render(<ProductAvailabilityToggle productId="p1" productName="Habanero" available />);
    fireEvent.click(screen.getByRole("button", { name: /desactivar/i }));
    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(consumeFlash()).toEqual({ variant: "success", message: "Producto «Habanero» desactivado" });
  });

  it("producto: falla → error con el motivo, sin refrescar", async () => {
    fetchMock.mockResolvedValueOnce(problem(404, "No existe un producto con id p1"));
    render(<ProductAvailabilityToggle productId="p1" productName="Habanero" available={false} />);
    fireEvent.click(screen.getByRole("button", { name: /activar/i }));
    await waitFor(() =>
      expect(consumeFlash()).toEqual({
        variant: "error",
        message: "No se pudo activar «Habanero»: No existe un producto con id p1",
      }),
    );
    expect(refresh).not.toHaveBeenCalled();
  });

  it("usuario: éxito y error", async () => {
    fetchMock.mockResolvedValueOnce(json(200, {}));
    const { unmount } = render(<UserActiveToggle userId="u1" email="daniel@x.com" active={false} />);
    fireEvent.click(screen.getByRole("button", { name: /activar/i }));
    await waitFor(() => expect(consumeFlash()).toEqual({ variant: "success", message: "Cuenta daniel@x.com activada" }));
    unmount();

    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    render(<UserActiveToggle userId="u1" email="daniel@x.com" active />);
    fireEvent.click(screen.getByRole("button", { name: /desactivar/i }));
    await waitFor(() =>
      expect(consumeFlash()).toEqual({
        variant: "error",
        message: "No se pudo desactivar la cuenta daniel@x.com: No se pudo conectar con el servidor",
      }),
    );
  });
});

// RF-121, RF-122
describe("nueva cuenta admin", () => {
  function fillAndSubmit() {
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "nuevo@x.com" } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: "12345678" } });
    fireEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));
  }

  it("éxito → vuelve a la lista con 'Cuenta creada'", async () => {
    fetchMock.mockResolvedValueOnce(json(201, { id: "u9", email: "nuevo@x.com" }));
    render(<NewAdminUserPage />);
    fillAndSubmit();
    await waitFor(() => expect(push).toHaveBeenCalledWith("/admin/users"));
    expect(consumeFlash()).toEqual({ variant: "success", message: "Cuenta nuevo@x.com creada" });
  });

  it("falla → error con el motivo", async () => {
    fetchMock.mockResolvedValueOnce(problem(409, "Ya existe una cuenta con ese email"));
    render(<NewAdminUserPage />);
    fillAndSubmit();
    expect(await screen.findByRole("alert")).toHaveTextContent("Ya existe una cuenta con ese email");
    expect(push).not.toHaveBeenCalled();
  });
});
