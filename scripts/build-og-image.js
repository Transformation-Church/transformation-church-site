/**
 * Generates the default Open Graph card at public/brand/og-default.png.
 *
 *   node scripts/build-og-image.js
 *
 * Baked once and committed rather than rendered per-request: the card is the
 * same on every page that doesn't supply its own image (sermons and blog posts
 * already pass their own artwork), so there's nothing to compute at runtime.
 */

const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const W = 1200;
const H = 630;
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "public", "brand", "og-default.png");

const INK_DEEP = "#0b1132";
const PAPER = "#f7f4ee";
const ACCENT = "#c5462f";

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function main() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${INK_DEEP}" stop-opacity="1"/>
      <stop offset="70%" stop-color="${INK_DEEP}" stop-opacity="0.92"/>
      <stop offset="100%" stop-color="${INK_DEEP}" stop-opacity="0.62"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="${INK_DEEP}"/>
  <rect width="${W}" height="${H}" fill="url(#fade)"/>

  <!-- accent rule, mirrors the section eyebrows on the site -->
  <rect x="72" y="118" width="52" height="2" fill="${ACCENT}"/>
  <text x="140" y="126" fill="${PAPER}" fill-opacity="0.55"
        font-family="Segoe UI, Helvetica, Arial, sans-serif"
        font-size="20" letter-spacing="3.4">ROWLEY REGIS, BIRMINGHAM</text>

  <text x="72" y="286" fill="${PAPER}"
        font-family="Georgia, 'Iowan Old Style', serif"
        font-size="92" letter-spacing="-1.5">${esc("Transformed,")}</text>
  <text x="72" y="392" fill="${PAPER}"
        font-family="Georgia, 'Iowan Old Style', serif"
        font-size="92" letter-spacing="-1.5">${esc("to transform.")}</text>

  <rect x="72" y="470" width="${W - 144}" height="1" fill="${PAPER}" fill-opacity="0.16"/>

  <text x="72" y="524" fill="${PAPER}" fill-opacity="0.9"
        font-family="Segoe UI, Helvetica, Arial, sans-serif"
        font-size="27">Transformation Church</text>
  <text x="72" y="566" fill="${PAPER}" fill-opacity="0.5"
        font-family="Segoe UI, Helvetica, Arial, sans-serif"
        font-size="23">Sundays 10:00am English &#183; 12:00pm Malayalam</text>
</svg>`;

  const base = await sharp(Buffer.from(svg)).png().toBuffer();

  // Overlay the wordmark, sized to sit in the lower right without crowding.
  const logoPath = path.join(ROOT, "public", "brand", "logo-dark.png");
  const composites = [];
  if (fs.existsSync(logoPath)) {
    const logo = await sharp(fs.readFileSync(logoPath))
      .resize({ width: 300 })
      .png()
      .toBuffer();
    const meta = await sharp(logo).metadata();
    composites.push({
      input: logo,
      left: W - 300 - 72,
      top: H - (meta.height || 100) - 66,
    });
  }

  await sharp(base).composite(composites).png({ compressionLevel: 9 }).toFile(OUT);

  const { size } = fs.statSync(OUT);
  console.log(`wrote ${path.relative(ROOT, OUT)} — ${W}x${H}, ${(size / 1024).toFixed(0)}KB`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
