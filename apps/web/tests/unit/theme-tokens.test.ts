import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

// RF-005 — exige el color de marca, no una notación: acepta hex o rgb() equivalente.
function toHex(value: string): string | null {
  const v = value.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(v)) return v;
  const rgb = v.match(/^rgb\(\s*(\d{1,3})\s*,?\s*(\d{1,3})\s*,?\s*(\d{1,3})\s*\)$/);
  if (!rgb) return null;
  const channels = rgb.slice(1).map(Number);
  if (channels.some((c) => c > 255)) return null;
  return "#" + channels.map((c) => c.toString(16).padStart(2, "0")).join("");
}

describe("paleta de marca DanMe (app/globals.css)", () => {
  const css = fs.readFileSync(
    path.resolve(__dirname, "../../app/globals.css"),
    "utf-8",
  );

  const expectedTokens: Record<string, string> = {
    "--color-verde-danme": "#416e51",
    "--color-verde-oscuro": "#123322",
    "--color-ambar": "#febd59",
    "--color-naranja-quemado": "#df6c2b",
    "--color-crema": "#e3c392",
  };

  it.each(Object.entries(expectedTokens))(
    "expone el token %s con el valor %s",
    (token, hex) => {
      // la definición literal (no la referencia `var(--token)` del bloque @theme)
      const values = [...css.matchAll(new RegExp(`${token}:\\s*([^;]+);`, "gi"))]
        .map((m) => m[1])
        .filter((v) => !v.trim().startsWith("var("));
      expect(values.length).toBeGreaterThan(0);
      for (const value of values) expect(toHex(value)).toBe(hex);
    },
  );

  it("toHex: hex y rgb() equivalentes; rechaza lo inválido", () => {
    expect(toHex("#416E51")).toBe("#416e51");
    expect(toHex("rgb(65, 110, 81)")).toBe("#416e51");
    expect(toHex("rgb(65 110 81)")).toBe("#416e51");
    expect(toHex("rgb(65, 110, 82)")).not.toBe("#416e51");
    expect(toHex("rgb(300, 0, 0)")).toBeNull();
    expect(toHex("oklch(0.5 0.1 150)")).toBeNull();
  });
});
