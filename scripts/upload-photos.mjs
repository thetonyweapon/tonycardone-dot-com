import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { resolve, dirname, basename, extname, relative } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { spawnSync } from 'child_process';
import { stdin, stdout, exit, env, argv } from 'process';
import { config } from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import piexif from 'piexifjs';
import * as readline from 'node:readline/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.tif', '.gif']);

const defaults = {
  maxPx: 2560,
  maxBytes: 10 * 1024 * 1024,
  concurrency: 4,
};

const KEY_MAP = {
  source: 'source',
  folder: 'folder',
  'max-px': 'maxPx',
  'max-bytes': 'maxBytes',
  concurrency: 'concurrency',
};
const NUMERIC_KEYS = new Set(['max-px', 'max-bytes', 'concurrency']);

function parseArgs(args) {
  const opts = { ...defaults, source: null, folder: null, register: true };
  for (let i = 2; i < args.length; i++) {
    const a = args[i];
    if (a === '--no-register') { opts.register = false; continue; }
    if (!a.startsWith('--')) continue;
    const hasEq = a.includes('=');
    const [rawKey, inlineVal] = a.replace(/^--/, '').split('=');
    const optKey = KEY_MAP[rawKey];
    if (!optKey) { console.error(`Unknown option: ${a}`); exit(1); }
    const val = hasEq ? inlineVal : args[i + 1];
    if (val === undefined) { console.error(`Missing value for ${a}`); exit(1); }
    if (NUMERIC_KEYS.has(rawKey)) {
      const num = Number(val);
      if (!Number.isFinite(num) || num <= 0) { console.error(`Invalid numeric value for ${a}: ${val}`); exit(1); }
      opts[optKey] = num;
    } else {
      opts[optKey] = val;
    }
    if (!hasEq) i++;
  }
  return opts;
}

function prompt(rl, message, fallback = null) {
  return rl.question(message).then((s) => s.trim() || fallback);
}

async function confirm(rl, message, def = true) {
  const ans = await prompt(rl, `${message} [${def ? 'Y' : 'y'}/n] `);
  if (!ans) return def;
  return ['y', 'yes'].includes(ans.toLowerCase());
}

async function ensureCloudinary() {
  const envLocalPath = resolve(root, '.env.local');
  if (existsSync(envLocalPath)) config({ path: envLocalPath });
  const apiKey = env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET;
  const cloudName = env.VITE_CLOUDINARY_CLOUD_NAME || 'thetonyweapon';
  if (!apiKey || !apiSecret) {
    console.error('Refusing to upload: CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET must be set in .env.local for ADMIN uploads.');
    exit(1);
  }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  return cloudName;
}

function sanitizePublicId(stem) {
  return stem.replace(/[^A-Za-z0-9_-]/g, '_');
}

const EXIF_WHITELIST = {
  '0th': [0x010f, 0x0110, 0x0112, 0x011a, 0x011b, 0x0128, 0x0132],
  Exif: [
    0x829a, 0x829d, 0x8822, 0x8827, 0x9000, 0x9003, 0x9004,
    0x9201, 0x9202, 0x9204, 0x9207, 0x9209, 0x920a,
    0xa001, 0xa002, 0xa003, 0xa403, 0xa405, 0xa432, 0xa433, 0xa434,
  ],
  GPS: [
    0x0000, 0x0001, 0x0002, 0x0003, 0x0004, 0x0005, 0x0006,
    0x0007, 0x0008, 0x000d, 0x0011, 0x0012, 0x001d,
  ],
};

const isJpegFormat = (fmt) => fmt === 'jpeg' || fmt === 'jpg';

function attachWhitelistedExif(jpegBuffer, rawFileBuffer) {
  try {
    const loaded = piexif.load(rawFileBuffer.toString('binary'));
    const clean = { '0th': {}, Exif: {}, GPS: {}, '1st': {} };
    for (const [ifd, tags] of Object.entries(EXIF_WHITELIST)) {
      const src = loaded[ifd] || {};
      for (const tag of tags) {
        if (Object.prototype.hasOwnProperty.call(src, tag)) clean[ifd][tag] = src[tag];
      }
    }
    const exifBytes = piexif.dump(clean);
    return Buffer.from(piexif.insert(exifBytes, jpegBuffer.toString('binary')), 'binary');
  } catch (err) {
    console.warn(`Could not read EXIF; uploading without metadata: ${err.message}`);
    return jpegBuffer;
  }
}

async function listFolderPublicIds(folder) {
  const prefix = `${folder}/`;
  const set = new Set();
  let nextCursor = null;
  do {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix,
      max_results: 500,
      resource_type: 'image',
      ...(nextCursor ? { next_cursor: nextCursor } : {}),
    });
    const resources = result.resources || [];
    for (const r of resources) set.add(r.public_id);
    nextCursor = result.next_cursor;
  } while (nextCursor);
  return set;
}

function registerFolder(galleryConfigPath, folder) {
  folder = sanitizePublicId(String(folder).trim());
  if (!folder) {
    throw new Error('Cannot register an empty Cloudinary folder name.');
  }
  if (!existsSync(galleryConfigPath)) {
    writeFileSync(
      galleryConfigPath,
      `export const galleryFolders = [\n  '${folder}',\n];\n`,
    );
    console.log(`Created ${relative(root, galleryConfigPath)} with folder '${folder}'.`);
    return;
  }
  const original = readFileSync(galleryConfigPath, 'utf8');
  if (original.includes(`'${folder}'`)) return;
  const updated = original.replace(/\];\s*$/, `  '${folder}',\n];\n`);
  writeFileSync(galleryConfigPath, updated);
  console.log(`Registered folder '${folder}' in ${relative(root, galleryConfigPath)}.`);
}

async function processImage(inputPath, { maxPx, maxBytes }) {
  const meta = await sharp(inputPath).metadata();
  const { width, height, hasAlpha } = meta;
  const dimsKnown = Boolean(width && height);
  const dimsOver = dimsKnown && (width > maxPx || height > maxPx);
  const rawFile = readFileSync(inputPath);

  const original = await sharp(inputPath).keepIccProfile().toBuffer();
  if (!dimsOver && original.length <= maxBytes) {
    const buffer = isJpegFormat(meta.format) ? attachWhitelistedExif(original, rawFile) : original;
    return {
      buffer,
      resized: false,
      reencoded: false,
      overLimit: buffer.length > maxBytes,
      format: meta.format,
      bytes: buffer.length,
      width,
      height,
    };
  }

  const fmt = hasAlpha ? 'png' : 'jpeg';
  let maxSide = dimsOver ? maxPx : (dimsKnown ? Math.max(width, height) : maxPx);
  let quality = 85;
  let buffer;
  let dimsReduced = dimsOver;

  for (;;) {
    let pipeline = sharp(inputPath).keepIccProfile();
    if (dimsKnown && (width > maxSide || height > maxSide)) {
      pipeline = pipeline.resize({
        width: maxSide,
        height: maxSide,
        fit: 'inside',
        withoutEnlargement: true,
      });
    }
    buffer = fmt === 'jpeg'
      ? await pipeline.jpeg({ quality, mozjpeg: true, trellis: true }).toBuffer()
      : await pipeline.png().toBuffer();

    if (buffer.length <= maxBytes) break;

    if (fmt === 'jpeg' && quality > 35) { quality -= 8; continue; }
    const nextSide = Math.floor(maxSide * 0.8);
    if (!dimsKnown || nextSide < 320) break;
    maxSide = nextSide;
    dimsReduced = true;
    quality = 85;
  }

  const finalBuffer = fmt === 'jpeg' ? attachWhitelistedExif(buffer, rawFile) : buffer;
  return {
    buffer: finalBuffer,
    resized: dimsReduced,
    reencoded: !dimsReduced,
    overLimit: finalBuffer.length > maxBytes,
    format: fmt,
    bytes: finalBuffer.length,
    width,
    height,
  };
}

function uploadBuffer(buffer, folder, publicId) {
  return new Promise((resolveUpload, reject) => {
    cloudinary.uploader.upload(
      buffer,
      {
        folder,
        public_id: publicId,
        resource_type: 'image',
        invalidate: false,
      },
      (error, result) => {
        if (error) reject(error);
        else resolveUpload(result);
      },
    );
  });
}

async function pool(items, concurrency, fn) {
  const results = [];
  let i = 0;
  const workers = new Array(concurrency).fill(null).map(async () => {
    for (;;) {
      const idx = i++;
      if (idx >= items.length) return;
      results[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(workers);
  return results;
}

function refreshPhotos() {
  const r = spawnSync('node', ['scripts/fetch-photos.mjs'], {
    cwd: root,
    stdio: 'inherit',
  });
  if (r.status !== 0) {
    console.warn(`Note: refreshing photos.json exited with code ${r.status}. Run \`npm run update-photos\` manually to refresh the /photos gallery.`);
  }
}

async function main() {
  const opts = parseArgs(argv);
  await ensureCloudinary();

  const rl = readline.createInterface({ input: stdin, output: stdout });

  if (!opts.source) {
    opts.source = await prompt(
      rl,
      'Local folder containing the (oversized) photos to upload: ',
    );
  }
  if (!opts.source) {
    console.error('No source folder provided. Aborting.');
    rl.close();
    exit(1);
  }
  opts.source = resolve(opts.source);
  if (!existsSync(opts.source) || !statSync(opts.source).isDirectory()) {
    console.error(`Source folder does not exist or is not a directory: ${opts.source}`);
    rl.close();
    exit(1);
  }

  if (!opts.folder) {
    opts.folder = await prompt(rl, 'Cloudinary folder name to upload into: ');
  }
  if (!opts.folder) {
    console.error('No Cloudinary folder name provided. Aborting.');
    rl.close();
    exit(1);
  }
  opts.folder = sanitizePublicId(opts.folder);

  if (opts.register) {
    const galleryConfigPath = resolve(root, 'src', 'data', 'gallery.config.js');
    const doRegister = await confirm(
      rl,
      `Add folder '${opts.folder}' to src/data/gallery.config.js so /photos displays these photos?`,
      true,
    );
    if (doRegister) registerFolder(galleryConfigPath, opts.folder);
  }
  rl.close();

  const existingIds = await listFolderPublicIds(opts.folder);
  console.log(
    `\nScanning ${relative(root, opts.source)} for images (target: <= ${opts.maxBytes / (1024 * 1024)} MB, long edge <= ${opts.maxPx}px)...\n`,
  );

  const files = readdirSync(opts.source).filter(
    (f) => IMAGE_EXTS.has(extname(f).toLowerCase()),
  );
  if (files.length === 0) {
    console.log('No image files found. Nothing to do.');
    return;
  }

  let uploaded = 0;
  let resizedCount = 0;
  let reencodedCount = 0;
  let skippedExisting = 0;
  let skippedDuplicateStem = 0;
  let skippedOverLimit = 0;
  const batchSeen = new Set();

  await pool(files, opts.concurrency, async (file) => {
    const full = resolve(opts.source, file);
    const stem = basename(file, extname(file));
    const publicId = sanitizePublicId(stem);
    const cloudId = `${opts.folder}/${publicId}`;

    if (existingIds.has(cloudId)) {
      skippedExisting++;
      console.log(`  skip (exists)     ${file} -> ${cloudId}`);
      return;
    }
    if (batchSeen.has(publicId)) {
      skippedDuplicateStem++;
      console.log(`  skip (duplicate)  ${file} -> ${cloudId} (same name as another file in this folder)`);
      return;
    }
    batchSeen.add(publicId);

    try {
      const { buffer, resized, reencoded, overLimit, bytes, format } = await processImage(full, {
        maxPx: opts.maxPx,
        maxBytes: opts.maxBytes,
      });
      if (overLimit) {
        skippedOverLimit++;
        console.error(`  skip (over limit) ${file} -> ${cloudId} still ${(bytes / (1024 * 1024)).toFixed(1)} MB after shrinking; not uploaded.`);
        return;
      }
      const result = await uploadBuffer(buffer, opts.folder, publicId);
      const label = resized ? 'resized' : (reencoded ? 're-encoded' : 'as-is  ');
      console.log(
        `  ${label}  ${file} -> ${result.public_id} (${(bytes / 1024).toFixed(0)} KB, ${format})`,
      );
      uploaded++;
      if (resized) resizedCount++;
      else if (reencoded) reencodedCount++;
    } catch (err) {
      console.error(`  failed            ${file}: ${err.message || err}`);
    }
  });

  console.log(
    `\nDone: ${uploaded} uploaded (${resizedCount} resized, ${reencodedCount} re-encoded to fit), ${skippedExisting} skipped (already in Cloudinary), ${skippedDuplicateStem} skipped (duplicate names), ${skippedOverLimit} skipped (still over limit).`,
  );
  console.log('Refreshing photo manifest...');
  refreshPhotos();
}

const isCli = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isCli) {
  main().catch((err) => {
    console.error(err);
    exit(1);
  });
}
export { processImage, sanitizePublicId, registerFolder, attachWhitelistedExif, parseArgs as parseUploadArgs, defaults as uploadDefaults };