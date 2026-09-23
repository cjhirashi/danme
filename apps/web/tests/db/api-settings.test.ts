import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { prisma } from "@/lib/db/prisma";

let uploadsRoot: string;
vi.mock("@/lib/services/uploads-root", () => ({
  get UPLOADS_ROOT() {
    return uploadsRoot;
  },
}));

// RF-112, RF-113, RF-119 — requiere danme_test
describe("app/api/admin/settings", () => {
  beforeEach(async () => {
    uploadsRoot = await fs.mkdtemp(path.join(os.tmpdir(), "danme-uploads-"));
    await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: {},
      create: {
        id: "default",
        brandName: "DanMe",
        tagline: "t",
        whatsappNumber: "+521",
      },
    });
  });

  afterEach(async () => {
    await prisma.siteSettings.deleteMany();
    await fs.rm(uploadsRoot, { recursive: true, force: true });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("PATCH edita marca/tagline/WhatsApp/redes (RF-112)", async () => {
    const { PATCH } = await import("@/app/api/admin/settings/route");
    const req = new Request("http://localhost/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagline: "Nuevo tagline", instagramUrl: "https://instagram.com/danme" }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(200);

    const updated = await prisma.siteSettings.findUniqueOrThrow({ where: { id: "default" } });
    expect(updated.tagline).toBe("Nuevo tagline");
    expect(updated.instagramUrl).toBe("https://instagram.com/danme");
  });

  it("PATCH edita el contenido de 'Sobre <marca>' (RF-112, extensión)", async () => {
    const { PATCH } = await import("@/app/api/admin/settings/route");
    const req = new Request("http://localhost/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aboutText: "Nuevo contenido de la sección Sobre nosotros." }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(200);

    const updated = await prisma.siteSettings.findUniqueOrThrow({ where: { id: "default" } });
    expect(updated.aboutText).toBe("Nuevo contenido de la sección Sobre nosotros.");
  });

  it("POST /logo sube el logo y actualiza logoUrl (RF-113)", async () => {
    const { POST } = await import("@/app/api/admin/settings/logo/route");
    const form = new FormData();
    form.set("file", new File([new Uint8Array(1024)], "logo.webp", { type: "image/webp" }));
    const res = await POST(new Request("http://localhost/api/admin/settings/logo", { method: "POST", body: form }));
    expect(res.status).toBe(200);

    const updated = await prisma.siteSettings.findUniqueOrThrow({ where: { id: "default" } });
    expect(updated.logoUrl).toMatch(/^\/uploads\/settings\/.+\.webp$/);
  });

  it("DELETE /logo limpia logoUrl (RF-113)", async () => {
    const { POST, DELETE } = await import("@/app/api/admin/settings/logo/route");
    const form = new FormData();
    form.set("file", new File([new Uint8Array(1024)], "logo.webp", { type: "image/webp" }));
    await POST(new Request("http://localhost/api/admin/settings/logo", { method: "POST", body: form }));

    const res = await DELETE();
    expect(res.status).toBe(200);

    const updated = await prisma.siteSettings.findUniqueOrThrow({ where: { id: "default" } });
    expect(updated.logoUrl).toBeNull();
  });
});
