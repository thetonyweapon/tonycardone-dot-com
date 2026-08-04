import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { config } from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const envLocalPath = resolve(root, '.env.local');
if (existsSync(envLocalPath)) {
  config({ path: envLocalPath });
}

const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME || 'thetonyweapon';

if (!apiKey || !apiSecret) {
  console.warn('Skipping Cloudinary fetch: CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET not set. Keeping existing src/data/photos.json.');
  const existing = resolve(root, 'src', 'data', 'photos.json');
  if (existsSync(existing)) {
    console.log(`Using cached photo manifest → src/data/photos.json`);
  } else {
    writeFileSync(existing, JSON.stringify({ photos: [], updatedAt: new Date().toISOString() }, null, 2));
    console.log('No cached manifest found; wrote empty src/data/photos.json');
  }
  process.exit(0);
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

const galleryConfigPath = resolve(root, 'src', 'data', 'gallery.config.js');
let folders = [];
try {
  const mod = await import(pathToFileURL(galleryConfigPath));
  folders = mod.galleryFolders || [];
} catch {
  console.warn('No gallery.config.js found, showing all photos');
}

async function fetchFolderImages(folder) {
  const prefix = folder ? `${folder}/` : '';
  let resources = [];
  let nextCursor = null;

  do {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix,
      max_results: 500,
      next_cursor: nextCursor,
    });
    resources = resources.concat(result.resources);
    nextCursor = result.next_cursor;
  } while (nextCursor);

  return resources;
}

async function fetchAllImages() {
  let allResources = [];

  if (folders.length === 0) {
    allResources = await fetchFolderImages('');
  } else {
    const results = await Promise.all(folders.map(fetchFolderImages));
    const seen = new Set();
    for (const batch of results) {
      for (const r of batch) {
        if (!seen.has(r.public_id)) {
          seen.add(r.public_id);
          allResources.push(r);
        }
      }
    }
  }

  const photos = allResources.map((r) => ({
    publicId: r.public_id,
    format: r.format,
    width: r.width,
    height: r.height,
    createdAt: r.created_at,
    tags: r.tags || [],
  }));

  photos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const outPath = resolve(root, 'src', 'data', 'photos.json');
  writeFileSync(outPath, JSON.stringify({ photos, updatedAt: new Date().toISOString() }, null, 2));
  console.log(`Fetched ${photos.length} photos → src/data/photos.json`);

  return photos;
}

fetchAllImages().catch((err) => {
  console.error('Failed to fetch Cloudinary images:', err.message);
  process.exit(1);
});
