import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword, signSession } from "@/lib/services/auth.service";
import { SESSION_COOKIE_NAME } from "@/lib/http/session-cookie";

// RF-105, RF-118 — requiere danme_test (npm run test:db)
describe("proxy", () => {
  beforeAll(() => {
    process.env.SESSION_SECRET = "test-secret-not-for-prod";
  });

  afterEach(async () => {
    await prisma.adminUser.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("responde 401 RFC 9457 en /api/admin/** sin cookie de sesión (RF-105)", async () => {
    const { proxy } = await import("@/proxy");
    const req = new NextRequest("http://localhost/api/admin/products");
    const res = await proxy(req);
    expect(res?.status).toBe(401);
    expect(res?.headers.get("content-type")).toBe("application/problem+json");
  });

  it("deja pasar /api/admin/** con cookie de sesión válida", async () => {
    const admin = await prisma.adminUser.create({
      data: { email: "carlos@example.com", passwordHash: hashPassword("x"), active: true },
    });
    const token = signSession(admin.id);

    const { proxy } = await import("@/proxy");
    const req = new NextRequest("http://localhost/api/admin/products", {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` },
    });
    const res = await proxy(req);
    // NextResponse.next() no trae status de error propio
    expect(res?.status).not.toBe(401);
  });

  it("responde 401 si la cuenta fue desactivada después de emitir el token (RF-118)", async () => {
    const admin = await prisma.adminUser.create({
      data: { email: "carlos@example.com", passwordHash: hashPassword("x"), active: true },
    });
    const token = signSession(admin.id);
    await prisma.adminUser.update({ where: { id: admin.id }, data: { active: false } });

    const { proxy } = await import("@/proxy");
    const req = new NextRequest("http://localhost/api/admin/products", {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` },
    });
    const res = await proxy(req);
    expect(res?.status).toBe(401);
  });

  it("no protege /api/admin/auth/login", async () => {
    const { proxy } = await import("@/proxy");
    const req = new NextRequest("http://localhost/api/admin/auth/login", { method: "POST" });
    const res = await proxy(req);
    expect(res?.status).not.toBe(401);
  });
});
