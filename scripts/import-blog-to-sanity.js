/**
 * One-off import of the migrated WordPress blog into Sanity.
 *
 *   node scripts/import-blog-to-sanity.js [--dry]
 *
 * Creates published `category`, `author` and `post` documents from
 * src/content/posts.json, uploading each cover image as a Sanity asset.
 *
 * Idempotent: every document gets a deterministic id derived from its slug and
 * is written with createOrReplace, so re-running updates in place rather than
 * duplicating. Images are only uploaded once — an existing asset with the same
 * filename is reused.
 *
 * Auth: SANITY_AUTH_TOKEN, else the token the Sanity CLI already stored in
 * ~/.config/sanity/config.json.
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createClient } = require("@sanity/client");

const ROOT = path.join(__dirname, "..");
const DRY = process.argv.includes("--dry");

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "3y2upgch";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

function authToken() {
  if (process.env.SANITY_AUTH_TOKEN) return process.env.SANITY_AUTH_TOKEN;
  const cfg = path.join(os.homedir(), ".config", "sanity", "config.json");
  if (fs.existsSync(cfg)) {
    const parsed = JSON.parse(fs.readFileSync(cfg, "utf8"));
    if (parsed.authToken) return parsed.authToken;
  }
  throw new Error(
    "No Sanity token. Run `npx sanity login`, or set SANITY_AUTH_TOKEN.",
  );
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-10-01",
  token: authToken(),
  useCdn: false,
});

/** Stable, readable document ids so re-runs replace rather than duplicate. */
const id = (kind, slug) => `${kind}-${slug}`;
const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Plain paragraphs -> portable text blocks. */
function toPortableText(paragraphs) {
  return paragraphs.map((text, i) => ({
    _type: "block",
    _key: `b${i}`,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `s${i}`, text, marks: [] }],
  }));
}

async function uploadCover(localPath) {
  const abs = path.join(ROOT, "public", localPath.replace(/^\//, ""));
  if (!fs.existsSync(abs)) {
    console.warn(`    ! cover image missing on disk: ${localPath}`);
    return null;
  }

  const filename = path.basename(abs);
  const existing = await client.fetch(
    `*[_type == "sanity.imageAsset" && originalFilename == $filename][0]._id`,
    { filename },
  );
  if (existing) return existing;

  if (DRY) return "image-DRYRUN";
  const asset = await client.assets.upload("image", fs.createReadStream(abs), {
    filename,
  });
  return asset._id;
}

async function main() {
  const posts = JSON.parse(
    fs.readFileSync(path.join(ROOT, "src", "content", "posts.json"), "utf8"),
  );

  console.log(
    `${DRY ? "[dry run] " : ""}importing ${posts.length} posts into ${projectId}/${dataset}\n`,
  );

  // ---------------------------------------------------------- categories
  const categories = new Map();
  for (const p of posts) {
    for (const c of p.categories) categories.set(c.slug, c.name);
  }

  const docs = [];
  for (const [slug, name] of categories) {
    docs.push({
      _id: id("category", slug),
      _type: "category",
      title: name,
      slug: { _type: "slug", current: slug },
    });
  }
  console.log(`categories: ${categories.size}`);

  // ------------------------------------------------------------- authors
  const authors = new Map();
  for (const p of posts) {
    if (p.author) authors.set(slugify(p.author), p.author);
  }
  for (const [slug, name] of authors) {
    docs.push({
      _id: id("author", slug),
      _type: "author",
      name,
      slug: { _type: "slug", current: slug },
    });
  }
  console.log(`authors:    ${authors.size} (${[...authors.values()].join(", ")})`);

  // --------------------------------------------------------------- posts
  console.log("posts:");
  for (const p of posts) {
    const assetId = p.image ? await uploadCover(p.image) : null;

    docs.push({
      _id: id("post", p.slug),
      _type: "post",
      title: p.title,
      slug: { _type: "slug", current: p.slug },
      publishedAt: `${p.date}T09:00:00Z`,
      excerpt: p.excerpt || p.body[0]?.slice(0, 200) || "",
      body: toPortableText(p.body),
      ...(p.author
        ? {
            author: {
              _type: "reference",
              _ref: id("author", slugify(p.author)),
            },
          }
        : {}),
      categories: p.categories.map((c) => ({
        _type: "reference",
        _ref: id("category", c.slug),
        _key: c.slug,
      })),
      ...(assetId
        ? {
            coverImage: {
              _type: "image",
              asset: { _type: "reference", _ref: assetId },
              alt: p.title,
            },
          }
        : {}),
    });

    console.log(
      `  ${p.date}  ${p.title}${p.author ? ` — ${p.author}` : ""}${assetId ? "  [+cover]" : ""}`,
    );
  }

  if (DRY) {
    console.log(`\n[dry run] would write ${docs.length} documents`);
    return;
  }

  const tx = client.transaction();
  for (const doc of docs) tx.createOrReplace(doc);
  await tx.commit();

  console.log(`\nwrote ${docs.length} published documents`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
