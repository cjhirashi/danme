import { afterAll, afterEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { create, findByEmail, findById, findAll, updateById } from "@/lib/db/admin-users.repository";

// RF-101, RF-114, RF-116 — requiere danme_test (npm run test:db)
describe("admin-users.repository", () => {
  afterEach(async () => {
    await prisma.adminUser.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("create + findByEmail + findById devuelven la misma cuenta", async () => {
    const created = await create({
      email: "daniel@example.com",
      passwordHash: "salt:hash",
    });

    expect((await findByEmail("daniel@example.com"))?.id).toBe(created.id);
    expect((await findById(created.id))?.email).toBe("daniel@example.com");
  });

  it("findAll devuelve todas las cuentas ordenadas por creación", async () => {
    await create({ email: "a@example.com", passwordHash: "x" });
    await create({ email: "b@example.com", passwordHash: "x" });

    const all = await findAll();
    expect(all.map((a) => a.email)).toEqual(["a@example.com", "b@example.com"]);
  });

  it("updateById actualiza campos (p. ej. active)", async () => {
    const created = await create({ email: "c@example.com", passwordHash: "x" });
    const updated = await updateById(created.id, { active: false });
    expect(updated.active).toBe(false);
  });
});
