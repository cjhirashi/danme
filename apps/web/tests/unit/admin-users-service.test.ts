import { describe, expect, it, vi, beforeEach } from "vitest";

const findByEmail = vi.fn();
const create = vi.fn();
const findAll = vi.fn();
const findById = vi.fn();
const updateById = vi.fn();

vi.mock("@/lib/db/admin-users.repository", () => ({
  findByEmail: (...a: unknown[]) => findByEmail(...a),
  create: (...a: unknown[]) => create(...a),
  findAll: (...a: unknown[]) => findAll(...a),
  findById: (...a: unknown[]) => findById(...a),
  updateById: (...a: unknown[]) => updateById(...a),
}));

const {
  createAdmin,
  setActive,
  changeOwnPassword,
  EMAIL_TAKEN_ERROR,
  WEAK_PASSWORD_ERROR,
  WRONG_CURRENT_PASSWORD_ERROR,
} = await import("@/lib/services/admin-users.service");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("admin-users.service", () => {
  // RF-115
  it("createAdmin rechaza email ya existente", async () => {
    findByEmail.mockResolvedValueOnce({ id: "1", email: "a@example.com" });
    const result = await createAdmin("a@example.com", "password123");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe(EMAIL_TAKEN_ERROR);
    expect(create).not.toHaveBeenCalled();
  });

  // RF-120
  it("createAdmin rechaza password de menos de 8 caracteres", async () => {
    findByEmail.mockResolvedValueOnce(null);
    const result = await createAdmin("a@example.com", "short");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe(WEAK_PASSWORD_ERROR);
    expect(create).not.toHaveBeenCalled();
  });

  // RF-114
  it("createAdmin crea la cuenta con password hasheado", async () => {
    findByEmail.mockResolvedValueOnce(null);
    create.mockResolvedValueOnce({ id: "1", email: "a@example.com" });
    const result = await createAdmin("a@example.com", "password123");
    expect(result.ok).toBe(true);
    const callArg = create.mock.calls[0][0];
    expect(callArg.passwordHash).not.toBe("password123");
  });

  // RF-116
  it("setActive actualiza el flag active", async () => {
    updateById.mockResolvedValueOnce({ id: "1", active: false });
    await setActive("1", false);
    expect(updateById).toHaveBeenCalledWith("1", { active: false });
  });

  // RF-117
  it("changeOwnPassword rechaza si la password actual no coincide", async () => {
    const { hashPassword } = await import("@/lib/services/auth.service");
    findById.mockResolvedValueOnce({ id: "1", passwordHash: hashPassword("current-pass") });
    const result = await changeOwnPassword("1", "wrong-current", "newpassword123");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe(WRONG_CURRENT_PASSWORD_ERROR);
    expect(updateById).not.toHaveBeenCalled();
  });

  // RF-117, RF-120
  it("changeOwnPassword rechaza password nueva débil", async () => {
    const { hashPassword } = await import("@/lib/services/auth.service");
    findById.mockResolvedValueOnce({ id: "1", passwordHash: hashPassword("current-pass") });
    const result = await changeOwnPassword("1", "current-pass", "short");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe(WEAK_PASSWORD_ERROR);
  });

  it("changeOwnPassword actualiza el hash cuando todo es válido", async () => {
    const { hashPassword } = await import("@/lib/services/auth.service");
    findById.mockResolvedValueOnce({ id: "1", passwordHash: hashPassword("current-pass") });
    updateById.mockResolvedValueOnce({});
    const result = await changeOwnPassword("1", "current-pass", "newpassword123");
    expect(result.ok).toBe(true);
    expect(updateById).toHaveBeenCalledOnce();
  });
});
