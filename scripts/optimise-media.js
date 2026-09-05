/**
 * Down-samples the migrated WordPress media library in place.
 *
 * The export arrives with originals up to 5354px and 246MB in total, which is
 * far more than any layout here asks for, slow for Next's image optimiser to
 * chew through, and too heavy to deploy. Nothing on the site renders wider than
 * about 1600 CSS pixels, so 2000px is a generous ceiling that still covers 2x
 * on the largest slot.
 *
 * Originals remain on the live WordPress site and in the local backup, so this
 * is safe to run in place. Re-running is a no-op for already-small files.
 *
 *   node scripts/optimise-media.js [--dry]
 */

const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..", "public", "media");
const MAX_EDGE = 2000;
const JPEG_QUALITY = 82;
const DRY = process.argv.includes("--dry");

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const mb = (n) => (n / 1024 / 1024).toFixed(1);

async function main() {
  const files = walk(ROOT).filter((f) => /\.(jpe?g|png)$/i.test(f));
  let before = 0;
  let after = 0;
  let touched = 0;
  let skipped = 0;

  for (const file of files) {
    // Read to a buffer rather than letting sharp open the path: on Windows it
    // keeps the handle open and the in-place write then fails with EUNKNOWN.
    const input = fs.readFileSync(file);
    const originalSize = input.length;
    before += originalSize;

    let meta;
    try {
      meta = await sharp(input).metadata();
    } catch {
      after += originalSize;
      skipped += 1;
      continue;
    }

    const longest = Math.max(meta.width || 0, meta.height || 0);
    const isPng = /\.png$/i.test(file);

    // Leave small files alone unless they are unusually heavy for their size.
    if (longest <= MAX_EDGE && originalSize < 400_000) {
      after += originalSize;
      skipped += 1;
      continue;
    }

    let pipeline = sharp(input).rotate();
    if (longest > MAX_EDGE) {
      pipeline = pipeline.resize(MAX_EDGE, MAX_EDGE, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    pipeline = isPng
      ? pipeline.png({ compressionLevel: 9, palette: true })
      : pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });

    const buf = await pipeline.toBuffer();

    // Only rewrite when we actually saved something.
    if (buf.length >= originalSize) {
      after += originalSize;
      skipped += 1;
      continue;
    }

    if (!DRY) fs.writeFileSync(file, buf);
    after += buf.length;
    touched += 1;
  }

  console.log(
    `${DRY ? "[dry run] " : ""}${files.length} images — rewrote ${touched}, left ${skipped}`,
  );
  console.log(`  ${mb(before)}MB -> ${mb(after)}MB (saved ${mb(before - after)}MB)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
