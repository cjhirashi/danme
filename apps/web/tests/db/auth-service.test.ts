import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db/prisma";
import {
  hashPassword,
  login,
  getSessionAdmin,
  signSession,
  GENERIC_LOGIN_ERROR,
} from "@/lib/services/auth.service";

// RF-101, RF-102, RF-103, RF-105, RF-118 — requiere danme_test (npm run test:db)
describe("auth.service — login / getSessionAdmin", () => {
  beforeAll(() => {
    process.env.SESSION_SECRET = "test-secret-not-for-prod";
  });

  afterEach(async () => {
    await prisma.adminUser.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function seedAdmin(overrides: Partial<{ active: boolean; password: string }> = {}) {
    return prisma.adminUser.create({
      data: {
        email: "carlos@example.com",
        passwordHash: hashPassword(overrides.password ?? "correcthorsebattery"),
        active: overrides.active ?? true,
      },
    });
  }

  it("login exitoso con credenciales válidas y cuenta activa (RF-101)", async () => {
    await seedAdmin();
    const result = await login("carlos@example.com", "correcthorsebattery");
    expect(result.ok).toBe(true);
    if (result.ok) expect(typeof result.token).toBe("string");
  });

  it("login rechaza password incorrecto con mensaje genérico (RF-102)", async () => {
    await seedAdmin();
    const result = await login("carlos@example.com", "wrong-password");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe(GENERIC_LOGIN_ERROR);
  });

  it("login rechaza cuenta inactiva con el mismo mensaje genérico (RF-102)", async () => {
    await seedAdmin({ active: false });
    const result = await login("carlos@example.com", "correcthorsebattery");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe(GENERIC_LOGIN_ERROR);
  });

  it("login bloquea tras 5 intentos fallidos seguidos (RF-103)", async () => {
    await seedAdmin();
    for (let i = 0; i < 5; i++) {
      await login("carlos@example.com", "wrong-password");
    }
    const admin = await prisma.adminUser.findUniqueOrThrow({
      where: { email: "carlos@example.com" },
    });
    expect(admin.lockedUntil).not.toBeNull();

    // ni siquiera con la password correcta debe dejar pasar mientras esté bloqueado
    const result = await login("carlos@example.com", "correcthorsebattery");
    expect(result.ok).toBe(false);
  });

  it("getSessionAdmin devuelve null si la cuenta se desactivó después de emitir el token (RF-118)", async () => {
    const admin = await seedAdmin();
    const token = signSession(admin.id);
    expect(await getSessionAdmin(token)).not.toBeNull();

    await prisma.adminUser.update({ where: { id: admin.id }, data: { active: false } });
    expect(await getSessionAdmin(token)).toBeNull();
  });

  it("getSessionAdmin devuelve null sin token", async () => {
    expect(await getSessionAdmin(undefined)).toBeNull();
  });
});
