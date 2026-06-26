import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 2 });
await page.goto("http://localhost:4321/boxes", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const cards = await page.locator(".postcard-card").all();
// RoboAnchor (有 index_img)
let target = null;
for (const c of cards) {
  const id = await c.getAttribute("id");
  if (id && id.startsWith("7b31a060")) { target = c; break; }
}
await target.scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await target.screenshot({ path: "/tmp/opencode/cover-collapsed.png" });
console.log("cover collapsed saved");
await target.locator("label").first().click({ force: true });
await page.waitForTimeout(800);
await target.screenshot({ path: "/tmp/opencode/cover-expanded.png" });
console.log("cover expanded saved, h:", (await target.boundingBox()).height);

// 无封面卡片
let noCover = null;
for (const c of cards) {
  const id = await c.getAttribute("id");
  if (id && id.startsWith("ff4f4611")) { noCover = c; break; }
}
await noCover.scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
await noCover.screenshot({ path: "/tmp/opencode/nocover-collapsed.png" });
await noCover.locator("label").first().click({ force: true });
await page.waitForTimeout(800);
await noCover.screenshot({ path: "/tmp/opencode/nocover-expanded.png" });
console.log("nocover saved");

await browser.close();
