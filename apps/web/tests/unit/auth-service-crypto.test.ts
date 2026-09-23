import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

// RF-101, RF-105
describe("auth.service — hashing y firma", () => {
  beforeEach(() => {
    vi.stubEnv("SESSION_SECRET", "test-secret-not-for-prod");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("hashPassword produce hashes distintos para la misma password (sal aleatoria)", async () => {
    const { hashPassword } = await import("@/lib/services/auth.service");
    const a = hashPassword("correcthorsebattery");
    const b = hashPassword("correcthorsebattery");
    expect(a).not.toBe(b);
  });

  it("verifyPassword acepta la password correcta y rechaza la incorrecta", async () => {
    const { hashPassword, verifyPassword } = await import("@/lib/services/auth.service");
    const hash = hashPassword("correcthorsebattery");
    expect(verifyPassword("correcthorsebattery", hash)).toBe(true);
    expect(verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("signSession produce un token que verifySessionToken puede validar", async () => {
    const { signSession, verifySessionToken } = await import("@/lib/services/auth.service");
    const token = signSession("admin-id-1");
    const payload = verifySessionToken(token);
    expect(payload?.sub).toBe("admin-id-1");
  });

  it("verifySessionToken rechaza un token con firma alterada", async () => {
    const { signSession, verifySessionToken } = await import("@/lib/services/auth.service");
    const token = signSession("admin-id-1");
    const tampered = token.slice(0, -2) + "xx";
    expect(verifySessionToken(tampered)).toBeNull();
  });

  it("verifySessionToken rechaza un token expirado", async () => {
    const { signSession, verifySessionToken } = await import("@/lib/services/auth.service");
    const token = signSession("admin-id-1", -1); // expira hace 1 segundo
    expect(verifySessionToken(token)).toBeNull();
  });
});
