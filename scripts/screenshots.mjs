import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const errors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});

await page.goto("http://localhost:4321", { waitUntil: "networkidle" });
await new Promise((r) => setTimeout(r, 2000));

console.log("Errors:", errors.length);

const info = await page.evaluate(() => {
  const c = document.querySelector(".card");
  const cs = getComputedStyle(c);
  const h = document.querySelector(".hero");
  const hs = h ? getComputedStyle(h) : null;
  const s = document.querySelector(".status");
  const ss = s ? getComputedStyle(s) : null;
  const b = document.querySelector(".bracket");
  const bs = b ? getComputedStyle(b) : null;
  const body = getComputedStyle(document.body);
  return {
    heroDisplay: hs ? hs.display : "none",
    cardBg: cs.backgroundColor,
    cardBorder: cs.border,
    statusSize: ss ? ss.width + "x" + ss.height : "none",
    statusBg: ss ? ss.backgroundColor : "none",
    bracketColor: bs ? bs.color : "none",
    bodyFontSize: body.fontSize,
    bodyColor: body.color,
  };
});

for (const [k, v] of Object.entries(info)) console.log(`  ${k}: ${v}`);

await page.screenshot({ path: "screenshots/after-1440.png", fullPage: true });
console.log("✓ after-1440.png");

await page.setViewportSize({ width: 1440, height: 500 });
await new Promise((r) => setTimeout(r, 500));
await page.screenshot({ path: "screenshots/after-hero-only.png" });
console.log("✓ after-hero-only.png");

await browser.close();
