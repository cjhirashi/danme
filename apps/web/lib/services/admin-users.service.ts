import type { AdminUser } from "@prisma/client";
import { findByEmail, create, findAll, findById, updateById } from "@/lib/db/admin-users.repository";
import { hashPassword, verifyPassword } from "@/lib/services/auth.service";

export const EMAIL_TAKEN_ERROR = "Ese email ya tiene una cuenta";
export const WEAK_PASSWORD_ERROR = "La contraseña debe tener al menos 8 caracteres";
export const WRONG_CURRENT_PASSWORD_ERROR = "La contraseña actual no es correcta";

type ServiceResult<T> = { ok: true; value: T } | { ok: false; error: string };

const MIN_PASSWORD_LENGTH = 8;

// RF-114, RF-115, RF-120
export async function createAdmin(email: string, password: string): Promise<ServiceResult<AdminUser>> {
  if (await findByEmail(email)) return { ok: false, error: EMAIL_TAKEN_ERROR };
  if (password.length < MIN_PASSWORD_LENGTH) return { ok: false, error: WEAK_PASSWORD_ERROR };

  const admin = await create({ email, passwordHash: hashPassword(password) });
  return { ok: true, value: admin };
}

// RF-114
export function listAdmins(): Promise<AdminUser[]> {
  return findAll();
}

// RF-116
export function setActive(id: string, active: boolean): Promise<AdminUser> {
  return updateById(id, { active });
}

// RF-117, RF-120
export async function changeOwnPassword(
  adminId: string,
  currentPassword: string,
  newPassword: string,
): Promise<ServiceResult<void>> {
  const admin = await findById(adminId);
  if (!admin || !verifyPassword(currentPassword, admin.passwordHash)) {
    return { ok: false, error: WRONG_CURRENT_PASSWORD_ERROR };
  }
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, error: WEAK_PASSWORD_ERROR };
  }

  await updateById(adminId, { passwordHash: hashPassword(newPassword) });
  return { ok: true, value: undefined };
}
