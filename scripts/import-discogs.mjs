// Imports new releases from a Discogs collection into src/content/records.
// Existing records (matched by discogsId) are never overwritten.
// Usage: npm run import:discogs [-- --backfill]   (requires DISCOGS_TOKEN in .env)
// --backfill fills in a missing "variant"/"descriptions" on existing records
// without touching any other field.
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const USERNAME = process.env.DISCOGS_USERNAME || "jacobproffer";
const TOKEN = process.env.DISCOGS_TOKEN;
if (!TOKEN) {
  console.error("Missing DISCOGS_TOKEN. Add it to .env (see README).");
  process.exit(1);
}

const BACKFILL = process.argv.includes("--backfill");
const RECORDS_DIR = "src/content/records";
const COVERS_DIR = "src/assets/covers";
const headers = {
  Authorization: `Discogs token=${TOKEN}`,
  "User-Agent": "astro-vinyl-collection/1.0",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, { headers });
    if (res.status === 429) {
      await sleep(5000);
      continue;
    }
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
    return res;
  }
  throw new Error(`Rate limited too many times: ${url}`);
}

// "Nirvana (2)" -> "Nirvana"
const cleanName = (name) => name.replace(/\s\(\d+\)$/, "").trim();

const titleCase = (s) =>
  s.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());

const slugify = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

async function existingRecords() {
  await mkdir(RECORDS_DIR, { recursive: true });
  const ids = new Map();
  for (const file of await readdir(RECORDS_DIR)) {
    if (!file.endsWith(".json")) continue;
    const data = JSON.parse(await readFile(path.join(RECORDS_DIR, file), "utf8"));
    if (data.discogsId) ids.set(data.discogsId, { file, data });
  }
  return ids;
}

async function downloadCover(url, slug) {
  if (!url) return undefined;
  try {
    const res = await get(url);
    const ext = (res.headers.get("content-type") || "").includes("png") ? "png" : "jpg";
    await mkdir(COVERS_DIR, { recursive: true });
    await writeFile(path.join(COVERS_DIR, `${slug}.${ext}`), Buffer.from(await res.arrayBuffer()));
    return `../../assets/covers/${slug}.${ext}`;
  } catch (err) {
    console.warn(`  cover failed for ${slug}: ${err.message}`);
    return undefined;
  }
}

const known = await existingRecords();
let page = 1;
let pages = 1;
let added = 0;
let updated = 0;

const getVariant = (info) => info.formats?.[0]?.text?.trim() || undefined;
const getDescriptions = (info) => info.formats?.[0]?.descriptions || [];

while (page <= pages) {
  const res = await get(
    `https://api.discogs.com/users/${USERNAME}/collection/folders/0/releases?per_page=100&page=${page}`,
  );
  const json = await res.json();
  pages = json.pagination.pages;

  for (const item of json.releases) {
    const info = item.basic_information;
    const existing = known.get(info.id);
    if (existing) {
      if (!BACKFILL) continue;
      const { file, data } = existing;
      const variant = getVariant(info);
      const descriptions = getDescriptions(info);
      let changed = false;
      if (!data.variant && variant) {
        data.variant = variant;
        changed = true;
      }
      if (!data.descriptions?.length && descriptions.length) {
        data.descriptions = descriptions;
        changed = true;
      }
      if (changed) {
        await writeFile(path.join(RECORDS_DIR, file), JSON.stringify(data, null, 2) + "\n");
        updated++;
        console.log(`~ ${data.artist} - ${data.title}`);
      }
      continue;
    }

    const artist = info.artists.map((a) => cleanName(a.name)).join(", ");
    const slug = `${slugify(artist)}-${slugify(info.title)}-${info.id}`;
    console.log(`+ ${artist} - ${info.title}`);

    const cover = await downloadCover(info.cover_image || info.thumb, slug);
    const record = {
      artist,
      title: info.title,
      year: info.year || undefined,
      label: info.labels?.[0] ? cleanName(info.labels[0].name) : undefined,
      genres: (info.genres || []).map(titleCase),
      styles: (info.styles || []).map(titleCase),
      format: info.formats?.[0]?.name,
      variant: getVariant(info),
      descriptions: getDescriptions(info),
      cover,
      discogsId: info.id,
    };
    const file = `${slug}.json`;
    await writeFile(
      path.join(RECORDS_DIR, file),
      JSON.stringify(record, null, 2) + "\n",
    );
    known.set(info.id, { file, data: record });
    added++;
    await sleep(1000);
  }
  page++;
}

console.log(`Done. Added ${added} new, updated ${updated} existing record(s).`);
