/**
 * Visual QA helper — captures full-page screenshots of the running site.
 *
 *   node scripts/shots.js [baseUrl] [--width 1440] [--only /path,/other]
 *
 * Writes PNGs to .shots/ (git-ignored). Reveal animations are forced complete
 * so captures are deterministic rather than depending on scroll timing.
 */

const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const args = process.argv.slice(2);
const base = args.find((a) => a.startsWith("http")) || "http://localhost:3100";
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};

const width = Number(flag("width", 1440));
const only = flag("only", null);

const ROUTES = [
  ["home", "/"],
  ["visit", "/visit"],
  ["about", "/about"],
  ["sermons", "/sermons"],
  ["sermon-detail", "/sermons/power-of-the-blood-of-the-lamb"],
  ["series", "/sermons/series/be-an-overcomer"],
  ["gallery", "/gallery"],
  ["blog", "/blog"],
  ["blog-post", "/blog/light-in-darkness"],
  ["foodbank", "/restore-foodbank"],
  ["kids-space", "/kids-space"],
  ["connect", "/connect"],
  ["contact", "/contact"],
  ["history", "/our-history"],
  ["privacy", "/privacy-policy"],
  ["404", "/no-such-page"],
];

(async () => {
  const outDir = path.join(__dirname, "..", ".shots", String(width));
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width, height: 900 },
    deviceScaleFactor: 1,
  });

  const routes = only
    ? ROUTES.filter(([, p]) => only.split(",").includes(p))
    : ROUTES;

  for (const [name, route] of routes) {
    const res = await page.goto(base + route, { waitUntil: "networkidle" });

    // Land every reveal and lazy image so the capture is stable.
    await page.evaluate(async () => {
      for (const el of document.querySelectorAll("[data-reveal]")) {
        el.classList.add("is-visible");
      }
      for (const img of document.images) img.loading = "eager";
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise((r) => setTimeout(r, 400));
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 300));
    });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(500);

    const file = path.join(outDir, `${name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    const { height } = await page.evaluate(() => ({
      height: document.body.scrollHeight,
    }));
    console.log(
      `${String(res?.status() ?? "?").padEnd(4)} ${route.padEnd(42)} ${height}px  -> ${path.relative(process.cwd(), file)}`,
    );
  }

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
