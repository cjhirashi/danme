import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { hashPassword, signSession } from "@/lib/services/auth.service";
import { SESSION_COOKIE_NAME } from "@/lib/http/session-cookie";

// RF-114, RF-115, RF-116, RF-117, RF-120 — requiere danme_test
describe("app/api/admin/users y account/password", () => {
  beforeAll(() => {
    process.env.SESSION_SECRET = "test-secret-not-for-prod";
  });

  afterEach(async () => {
    await prisma.adminUser.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("POST /api/admin/users crea una cuenta nueva (RF-114)", async () => {
    const { POST } = await import("@/app/api/admin/users/route");
    const req = new Request("http://localhost/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "danieljime444@gmail.com", password: "admin1234" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(await prisma.adminUser.findUnique({ where: { email: "danieljime444@gmail.com" } })).not.toBeNull();
  });

  it("POST /api/admin/users responde 409 si el email ya existe (RF-115)", async () => {
    await prisma.adminUser.create({ data: { email: "a@example.com", passwordHash: "x" } });
    const { POST } = await import("@/app/api/admin/users/route");
    const req = new Request("http://localhost/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "a@example.com", password: "password123" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(409);
    expect(res.headers.get("content-type")).toBe("application/problem+json");
  });

  it("PATCH /api/admin/users/[id] activa/desactiva (RF-116)", async () => {
    const admin = await prisma.adminUser.create({
      data: { email: "a@example.com", passwordHash: "x", active: true },
    });

    const { PATCH } = await import("@/app/api/admin/users/[id]/route");
    const req = new Request(`http://localhost/api/admin/users/${admin.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: false }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: admin.id }) });
    expect(res.status).toBe(200);
    expect((await prisma.adminUser.findUniqueOrThrow({ where: { id: admin.id } })).active).toBe(false);
  });

  it("PATCH /api/admin/account/password cambia la password propia (RF-117)", async () => {
    const admin = await prisma.adminUser.create({
      data: { email: "a@example.com", passwordHash: hashPassword("current-pass"), active: true },
    });
    const token = signSession(admin.id);

    const { PATCH } = await import("@/app/api/admin/account/password/route");
    const req = new Request("http://localhost/api/admin/account/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie: `${SESSION_COOKIE_NAME}=${token}` },
      body: JSON.stringify({ currentPassword: "current-pass", newPassword: "newpassword123" }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(200);
  });

  it("PATCH /api/admin/account/password responde 400 si la password nueva es débil (RF-120)", async () => {
    const admin = await prisma.adminUser.create({
      data: { email: "a@example.com", passwordHash: hashPassword("current-pass"), active: true },
    });
    const token = signSession(admin.id);

    const { PATCH } = await import("@/app/api/admin/account/password/route");
    const req = new Request("http://localhost/api/admin/account/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie: `${SESSION_COOKIE_NAME}=${token}` },
      body: JSON.stringify({ currentPassword: "current-pass", newPassword: "short" }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(400);
  });
});
