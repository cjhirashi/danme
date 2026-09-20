import { defineConfig } from "vitest/config";
import path from "node:path";

// Tests de repositorio contra Postgres real (danme_test) — un solo proceso: los
// archivos comparten tablas y no deben correr en paralelo entre sí (RF-002, RF-004, RF-008).
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/db/**/*.test.ts"],
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
