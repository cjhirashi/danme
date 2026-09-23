import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ImageUploadField from "@/components/admin/ImageUploadField";

beforeEach(() => {
  vi.stubGlobal("URL", { ...URL, createObjectURL: vi.fn(() => "blob:preview") });
});

// RF-109, RF-111, RF-113
describe("ImageUploadField", () => {
  it("muestra 'Subir imagen' cuando no hay imagen actual", () => {
    render(<ImageUploadField label="Logo" currentUrl={null} onFileSelected={vi.fn()} />);
    expect(screen.getByText("Subir imagen")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /quitar/i })).not.toBeInTheDocument();
  });

  it("muestra 'Cambiar imagen' y el botón de quitar cuando hay una imagen actual", () => {
    render(
      <ImageUploadField
        label="Logo"
        currentUrl="/uploads/settings/logo.png"
        onFileSelected={vi.fn()}
        onRemoveCurrent={vi.fn()}
      />,
    );
    expect(screen.getByText("Cambiar imagen")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /quitar imagen actual/i })).toBeInTheDocument();
  });

  it("llama a onFileSelected al elegir un archivo", () => {
    const onFileSelected = vi.fn();
    const { container } = render(
      <ImageUploadField label="Logo" currentUrl={null} onFileSelected={onFileSelected} />,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File([new Uint8Array(10)], "logo.png", { type: "image/png" });

    fireEvent.change(input, { target: { files: [file] } });

    expect(onFileSelected).toHaveBeenCalledWith(file);
  });

  it("llama a onRemoveCurrent al hacer click en 'Quitar imagen actual'", () => {
    const onRemoveCurrent = vi.fn();
    render(
      <ImageUploadField
        label="Logo"
        currentUrl="/uploads/settings/logo.png"
        onFileSelected={vi.fn()}
        onRemoveCurrent={onRemoveCurrent}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /quitar imagen actual/i }));
    expect(onRemoveCurrent).toHaveBeenCalledOnce();
  });
});
