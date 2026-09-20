import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    // tests/db/** son de integración (Postgres real) — se corren aparte con
    // `npm run test:db` (vitest.db.config.ts, requiere DATABASE_URL de danme_test).
    exclude: ["**/node_modules/**", "tests/db/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
