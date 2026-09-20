import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

// RF-005
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
      const regex = new RegExp(`${token}:\\s*${hex}`, "i");
      expect(css).toMatch(regex);
    },
  );
});
