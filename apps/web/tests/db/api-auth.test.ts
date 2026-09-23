import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/services/auth.service";

// RF-101, RF-102, RF-103, RF-104 — requiere danme_test (npm run test:db)
describe("app/api/admin/auth", () => {
  beforeAll(() => {
    process.env.SESSION_SECRET = "test-secret-not-for-prod";
  });

  afterEach(async () => {
    await prisma.adminUser.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function seedAdmin() {
    return prisma.adminUser.create({
      data: {
        email: "carlos@example.com",
        passwordHash: hashPassword("correcthorsebattery"),
        active: true,
      },
    });
  }

  it("POST /api/admin/auth/login responde 200 y set-cookie con credenciales válidas (RF-101)", async () => {
    await seedAdmin();
    const { POST } = await import("@/app/api/admin/auth/login/route");
    const req = new Request("http://localhost/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "carlos@example.com", password: "correcthorsebattery" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toMatch(/danme_admin_session=/);
  });

  it("POST /api/admin/auth/login responde 401 RFC 9457 con credenciales inválidas (RF-102)", async () => {
    await seedAdmin();
    const { POST } = await import("@/app/api/admin/auth/login/route");
    const req = new Request("http://localhost/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "carlos@example.com", password: "wrong" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(res.headers.get("content-type")).toBe("application/problem+json");
  });

  it("POST /api/admin/auth/logout responde 200 y borra la cookie (RF-104)", async () => {
    const { POST } = await import("@/app/api/admin/auth/logout/route");
    const res = await POST();
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toMatch(/danme_admin_session=;/);
  });
});
