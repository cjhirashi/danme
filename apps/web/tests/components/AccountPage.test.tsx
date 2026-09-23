import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

const { default: AccountPage } = await import("@/app/admin/(protected)/account/page");

// RF-117, RF-120
describe("AccountPage", () => {
  it("no envía la request si la confirmación no coincide con la contraseña nueva", async () => {
    render(<AccountPage />);
    fireEvent.change(screen.getByLabelText(/contraseña actual/i), { target: { value: "current-pass" } });
    fireEvent.change(screen.getByLabelText(/^contraseña nueva/i), { target: { value: "newpassword123" } });
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { target: { value: "otra-cosa" } });
    fireEvent.click(screen.getByRole("button", { name: /cambiar contraseña/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/no coincide/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("no envía la request si la contraseña nueva es menor a 8 caracteres", async () => {
    render(<AccountPage />);
    fireEvent.change(screen.getByLabelText(/contraseña actual/i), { target: { value: "current-pass" } });
    fireEvent.change(screen.getByLabelText(/^contraseña nueva/i), { target: { value: "short" } });
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { target: { value: "short" } });
    fireEvent.click(screen.getByRole("button", { name: /cambiar contraseña/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/al menos 8 caracteres/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("muestra una confirmación visible cuando el cambio es exitoso", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true });

    render(<AccountPage />);
    fireEvent.change(screen.getByLabelText(/contraseña actual/i), { target: { value: "current-pass" } });
    fireEvent.change(screen.getByLabelText(/^contraseña nueva/i), { target: { value: "newpassword123" } });
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { target: { value: "newpassword123" } });
    fireEvent.click(screen.getByRole("button", { name: /cambiar contraseña/i }));

    expect(await screen.findByRole("status")).toHaveTextContent(/actualizada correctamente/i);
  });

  it("muestra el error del servidor si la contraseña actual es incorrecta", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "La contraseña actual no es correcta" }),
    });

    render(<AccountPage />);
    fireEvent.change(screen.getByLabelText(/contraseña actual/i), { target: { value: "wrong" } });
    fireEvent.change(screen.getByLabelText(/^contraseña nueva/i), { target: { value: "newpassword123" } });
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { target: { value: "newpassword123" } });
    fireEvent.click(screen.getByRole("button", { name: /cambiar contraseña/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/no es correcta/i);
  });
});
