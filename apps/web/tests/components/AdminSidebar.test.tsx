import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/admin/products",
}));

const { default: AdminSidebar } = await import("@/components/admin/AdminSidebar");

describe("AdminSidebar (responsive, drawer en mobile/tablet)", () => {
  it("el backdrop está cerrado por defecto", () => {
    render(<AdminSidebar />);
    expect(screen.queryByTestId("sidebar-backdrop")).not.toBeInTheDocument();
  });

  it("el botón de menú abre el panel (backdrop visible, aria-expanded=true)", () => {
    render(<AdminSidebar />);
    const menuButton = screen.getByRole("button", { name: /abrir menú/i });

    fireEvent.click(menuButton);

    expect(screen.getByTestId("sidebar-backdrop")).toBeInTheDocument();
    expect(menuButton).toHaveAttribute("aria-expanded", "true");
  });

  it("clickear el backdrop cierra el panel", () => {
    render(<AdminSidebar />);
    fireEvent.click(screen.getByRole("button", { name: /abrir menú/i }));
    fireEvent.click(screen.getByTestId("sidebar-backdrop"));

    expect(screen.queryByTestId("sidebar-backdrop")).not.toBeInTheDocument();
  });

  it("clickear un link de navegación cierra el panel", () => {
    render(<AdminSidebar />);
    fireEvent.click(screen.getByRole("button", { name: /abrir menú/i }));
    fireEvent.click(screen.getByRole("link", { name: "Configuración" }));

    expect(screen.queryByTestId("sidebar-backdrop")).not.toBeInTheDocument();
  });

  it("resalta el link de la ruta activa", () => {
    render(<AdminSidebar />);
    expect(screen.getByRole("link", { name: "Productos" }).className).toMatch(/bg-verde-danme/);
    expect(screen.getByRole("link", { name: "Usuarios" }).className).not.toMatch(/bg-verde-danme\/60/);
  });
});
