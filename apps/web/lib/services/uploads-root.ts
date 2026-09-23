import path from "node:path";

// Aislado en su propio módulo para poder mockearlo en tests (escribir a un dir
// temporal en vez de al `public/uploads` real).
export const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");
