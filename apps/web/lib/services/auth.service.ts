import { randomBytes, scryptSync, timingSafeEqual, createHmac } from "node:crypto";
import { findByEmail, findById, updateById } from "@/lib/db/admin-users.repository";
import type { AdminUser } from "@prisma/client";

const SCRYPT_KEYLEN = 64;
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 días
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

// RF-101
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, SCRYPT_KEYLEN);
  return `${salt}:${derivedKey.toString("hex")}`;
}

// RF-101
export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hashHex] = storedHash.split(":");
  if (!salt || !hashHex) return false;
  const derivedKey = scryptSync(password, salt, SCRYPT_KEYLEN);
  const storedKey = Buffer.from(hashHex, "hex");
  if (storedKey.length !== derivedKey.length) return false;
  return timingSafeEqual(storedKey, derivedKey);
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET no está configurado");
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

// RF-101, RF-105 — token: <payload_base64url>.<firma_base64url>
export function signSession(adminId: string, expiresInSeconds = SESSION_TTL_SECONDS): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload = Buffer.from(JSON.stringify({ sub: adminId, exp })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string): { sub: string; exp: number } | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    if (typeof decoded.sub !== "string" || typeof decoded.exp !== "number") return null;
    if (decoded.exp < Math.floor(Date.now() / 1000)) return null;
    return decoded;
  } catch {
    return null;
  }
}

export const GENERIC_LOGIN_ERROR = "Credenciales inválidas";

type LoginResult =
  | { ok: true; token: string; admin: AdminUser }
  | { ok: false; error: string };

// RF-101, RF-102, RF-103
export async function login(email: string, password: string): Promise<LoginResult> {
  const admin = await findByEmail(email);
  if (!admin) return { ok: false, error: GENERIC_LOGIN_ERROR };

  if (admin.lockedUntil && admin.lockedUntil.getTime() > Date.now()) {
    return { ok: false, error: GENERIC_LOGIN_ERROR };
  }

  if (!admin.active || !verifyPassword(password, admin.passwordHash)) {
    const failedLoginAttempts = admin.failedLoginAttempts + 1;
    const lockedUntil =
      failedLoginAttempts >= MAX_FAILED_ATTEMPTS
        ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
        : null;
    await updateById(admin.id, { failedLoginAttempts, lockedUntil });
    return { ok: false, error: GENERIC_LOGIN_ERROR };
  }

  await updateById(admin.id, { failedLoginAttempts: 0, lockedUntil: null });
  return { ok: true, token: signSession(admin.id), admin };
}

// RF-105, RF-118
export async function getSessionAdmin(token: string | undefined): Promise<AdminUser | null> {
  if (!token) return null;
  const payload = verifySessionToken(token);
  if (!payload) return null;

  const admin = await findById(payload.sub);
  if (!admin || !admin.active) return null;
  return admin;
}
