import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
await page.goto("http://localhost:4322/boxes", { waitUntil: "networkidle" });
await page.waitForTimeout(6000);

const badge = page.locator(".status-badge").first();
const card = badge.locator("xpath=ancestor::article");
await card.scrollIntoViewIfNeeded();
await page.waitForTimeout(500);

const dotBox = await badge.locator(".status-dot").first().boundingBox();
const sla = await badge.locator(".status-badge-sla").textContent();
const label = await badge.locator(".status-badge-label").textContent();
const cardBox = await card.boundingBox();
console.log("dot size:", dotBox.width, "x", dotBox.height);
console.log("card size:", cardBox.width, "x", cardBox.height);
console.log("dot/card area ratio:", ((dotBox.width * dotBox.height) / (cardBox.width * cardBox.height) * 100).toFixed(1) + "%");
console.log("label:", label, "sla:", sla);
await card.screenshot({ path: "/tmp/opencode/card-bigbadge.png" });
await browser.close();
