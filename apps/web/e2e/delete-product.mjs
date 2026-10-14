// SPEC-002 RF-125..RF-128 — e2e de "eliminar producto" (T-084). Verificación manual,
// NO corre en `npm test`. Solo contra un build local apuntando a danme_test
// (nunca a la base de .env: es producción). Receta:
//   docker build -t danme-web:verify .   (en apps/web)
//   docker run -d --rm --name danme-web-verify --network host -e PORT=3100 \
//     -e DATABASE_URL=<danme_test> -e SESSION_SECRET=verify-secret danme-web:verify
//   ADMIN_EMAIL=verify@local.test ADMIN_PASSWORD=verifypass123 npx tsx prisma/seed.ts  (con .env.test)
//   docker run --rm --network host -v $PWD/e2e:/e2e:ro -v <dir con frasco.jpg>:/img -w /tmp \
//     mcr.microsoft.com/playwright:v1.56.0-jammy sh -c "cp /e2e/delete-product.mjs . && \
//     npm i -s playwright@1.56.0 >/dev/null 2>&1; IMAGE=/img/frasco.jpg node delete-product.mjs"
// Todas las líneas deben imprimir el valor esperado (true / 0 / 1 / false según el paso).
import { chromium } from "playwright";
const B = process.env.BASE_URL ?? "http://localhost:3100";
const IMAGE = process.env.IMAGE ?? IMAGE;
const SHOTS = process.env.SHOTS; // opcional: carpeta para capturas
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
const log = (...a) => console.log(...a);
const reqs = [];
page.on("request", (r) => r.method() === "DELETE" && reqs.push(r.url()));
await page.goto(`${B}/admin/login`);
await page.getByLabel(/email/i).fill(process.env.ADMIN_EMAIL ?? "verify@local.test");
await page.getByLabel(/contraseña/i).fill(process.env.ADMIN_PASSWORD ?? "verifypass123");
await page.getByRole("button").click();
await page.waitForURL(/\/admin(?!\/login)/);
// crear producto con imagen
await page.goto(`${B}/admin/products/new`);
const name = "Borrar E2E " + (Date.now() % 10000);
await page.getByLabel(/^nombre/i).fill(name);
for (const [re, v] of [[/sabor|slug/i, "borrar-e2e-" + (Date.now() % 10000)], [/descripci/i, "desc"], [/precio/i, "99"], [/presentaci/i, "190g"]]) {
  await page.getByLabel(re).first().fill(v).catch(() => {});
}
await page.locator('input[type=file]').setInputFiles(IMAGE);
await page.getByRole("button", { name: /^crear producto$/i }).click();
await page.waitForURL(/\/admin\/products$/);
const table = () => page.locator("table").innerText();
log("1 creado en lista:", (await table()).includes(name));
const row = page.locator("tr", { hasText: name });
// abrir y cancelar
await row.getByRole("button", { name: "Eliminar" }).click();
const dlg = page.getByRole("dialog");
log("2 diálogo:", await dlg.innerText());
if (SHOTS) await page.screenshot({ path: `${SHOTS}/delete-dialog.png` });
await dlg.getByRole("button", { name: "Cancelar" }).click();
log("3 cancelar → cerrado:", (await dlg.count()) === 0, "| DELETEs:", reqs.length);
await row.getByRole("button", { name: "Eliminar" }).click();
await page.keyboard.press("Escape");
log("4 escape → cerrado:", (await dlg.count()) === 0, "| DELETEs:", reqs.length);
await row.getByRole("button", { name: "Eliminar" }).click();
await page.mouse.click(10, 10);
log("5 fondo → cerrado:", (await dlg.count()) === 0, "| DELETEs:", reqs.length);
// confirmar
await row.getByRole("button", { name: "Eliminar" }).click();
await dlg.getByRole("button", { name: "Eliminar" }).click();
await page.waitForTimeout(1500);
log("6 DELETEs:", reqs.length, "| sigue en lista:", (await table()).includes(name));
log("7 aviso:", await page.locator('[role=status],[role=alert]').first().innerText().catch(() => "—"));
if (SHOTS) await page.screenshot({ path: `${SHOTS}/delete-done.png` });
const landing = await (await page.request.get(`${B}/`)).text();
log("8 en landing:", landing.includes(name));
await browser.close();
