# TonyCardone.com

Personal portfolio site built with [React](https://react.dev), [Vite](https://vitejs.dev), [Tailwind CSS v4](https://tailwindcss.com), and [React Router](https://reactrouter.com).

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (auto-fetches photos from Cloudinary and parses the resume) |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm run update-photos` | Refresh photo data from Cloudinary |
| `npm run upload-photos` | Resize oversized local photos and upload to Cloudinary (interactive prompts for source folder + Cloudinary folder) |
| `npm run update-resume` | Re-parse `public/Resume.docx` into `src/data/resume.json` |

## Setup

All Cloudinary configuration lives in `.env.local` (gitignored):

```
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Structure

```
src/
  pages/         Home, Resume, Blog, BlogPost, Photos
  components/    Layout, Nav
  assets/        Images, documents
  blogposts/     Markdown blog content
   data/          Gallery config + generated photo manifest (from Cloudinary)
                  + generated resume data (parsed from public/Resume.docx)
  App.jsx        Routes
  index.css      Tailwind imports, theme, animations
scripts/
  fetch-photos.mjs   Fetches image list from Cloudinary Admin API
  upload-photos.mjs  Resizes oversized local photos and uploads them to Cloudinary
```

## Routes

- `/` — Home page with hero photo of downtown Austin
- `/resume` — Resume with PDF/DOCX download links
- `/blog` — Blog listing
- `/blog/:slug` — Individual blog post
- `/photos` — Photo gallery (folder list) powered by Cloudinary
- `/photos/:folderName` — Individual photo folder

## Photos

The photo gallery fetches images from Cloudinary using the Admin API. Only photos inside the folders listed in `src/data/gallery.config.js` are displayed. `/photos` starts at the folder level (folder names are shown with underscores stripped), and clicking a folder opens `/photos/:folderName` with its images (tags shown beneath each tagged photo). Photos are ordered newest upload first, so the newest appears top-left and the oldest bottom-right. Tags are set on assets in Cloudinary's Media Library and appear automatically on the next build.

| File | Purpose |
|------|---------|
| `src/data/gallery.config.js` | List of Cloudinary folder names to include in the gallery |
| `src/data/photos.json` | Cached photo manifest (auto-generated, do not edit) |
| `scripts/fetch-photos.mjs` | Fetches images from specified Cloudinary folders |

To add a new folder to the gallery, edit `gallery.config.js`:

```js
export const galleryFolders = [
  'samples',
  'bartonsprings',
  'NewFolder',
];
```

On `npm run dev` and `npm run build`, the fetch script runs automatically to pull the latest images from those folders into `src/data/photos.json`. To refresh without a full dev/build cycle, run `npm run update-photos`.

### Upload photos

Resize oversized local photos and upload them to Cloudinary in one step. Credentials are read from `.env.local` (the same `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` used elsewhere). **Original files on disk are never modified or deleted** — images are resized in memory and uploaded from a buffer.

Run interactively:

```
npm run upload-photos
```

You will be prompted for:

1. The local folder containing the photos to upload.
2. The Cloudinary folder name to upload into (becomes a Cloudinary resource prefix).
3. Whether to add that folder to `src/data/gallery.config.js` so `/photos` displays the images (default **yes**).

Images that already fit both limits are uploaded unchanged (the image library re-encodes them). Uploads preserve a curated EXIF whitelist — camera make/model, lens, exposure settings (aperture, shutter speed, ISO, focal length, exposure program/metering/white balance), GPS coordinates/altitude/timestamp, capture date, and orientation — plus the embedded ICC color profile. Everything else is stripped: camera body and lens serial numbers, author/artist, copyright, software, captions, keywords, face-tag names, and all IPTC/XMP blocks. Images saved as PNG (sources with transparency) carry no EXIF. Otherwise oversized images are downscaled so the long edge is at most **2560 px** and re-encoded as JPEG (or PNG when the source has transparency), with quality and dimensions reduced as needed until the encoded size is under **10 MB** (within Cloudinary's signed-upload limit). Images that still exceed the limit after shrinking are skipped with a warning, as are files already present in the target Cloudinary folder (matching by name) and files whose names collide within the same batch. After uploading, the photo manifest `src/data/photos.json` is refreshed automatically.

Non-interactive / scriptable usage:

```
node scripts/upload-photos.mjs --source ./path/to/photos --folder mytrip --register
```

Options:

| Option | Default | Description |
|--------|---------|-------------|
| `--source <dir>` | _prompt_ | Local folder of photos to upload |
| `--folder <name>` | _prompt_ | Cloudinary folder name |
| `--as-is` | off | Upload original bytes unchanged when within limits (preserves full EXIF including serials), resizing only when over the size limit while keeping all metadata. Skips the curated EXIF whitelist. |
| `--max-px <n>` | `2560` | Maximum long edge in pixels |
| `--max-bytes <n>` | `10485760` (10 MB) | Maximum encoded file size per image |
| `--concurrency <n>` | `4` | Parallel upload workers |
| `--refresh-time <ms>` | `0` (no timeout) | Kill the post-upload `update-photos` refresh if it runs longer than this |
| `--no-register` | — | Do not add the folder to `gallery.config.js` |

By default, resized uploads re-encode to strip embedded metadata and re-attach only a curated EXIF whitelist (camera make/model, lens, exposure settings, GPS, capture date, orientation, ICC). Pass `--as-is` to upload originals byte-for-byte (with their full original metadata) instead.

After the run, verify the gallery on the live site at `/photos`.

## Resume

The resume is authored as `public/Resume.docx` (with `public/Resume.pdf` as a generated download). The `/resume` page renders content parsed from the Word document so the page stays in sync with the source file.

| File | Purpose |
|------|---------|
| `public/Resume.docx` | Source resume document (edit this) |
| `public/Resume.pdf` | Generated PDF download of the same resume |
| `src/data/resume.json` | Parsed, structured resume data (auto-generated, do not edit) |
| `scripts/fetch-resume.mjs` | Parses `public/Resume.docx` into `src/data/resume.json` at build time |

On `npm run dev` and `npm run build`, the resume is parsed automatically. To refresh without a full dev/build cycle, run `npm run update-resume`. The `/resume` sitemap entry's `lastmod` is set from the `Resume.pdf` modification time by `scripts/generate-site.mjs`.

## Deployment

The site is a static React single-page app (SPA) built with Vite and deployed to [GitHub Pages](https://pages.github.com/) under the custom domain `tonycardone.com`.

Deployment is handled by the [`Pages` workflow](.github/workflows/pages.yml), which runs on every push to `main` (and on manual dispatch): it installs deps, runs `npm run build`, and publishes the `dist/` output to the `gh-pages` branch via `actions/deploy-pages`.

SPA routing works on Pages thanks to a generated `dist/404.html` (a copy of `index.html`) emitted by `vite.config.js` — when a path isn't a real file, GitHub serves `404.html` and React Router takes over.

The photo gallery is refreshed from Cloudinary at build time using [these secrets](#cloudinary-secrets). If they are not provided, the build keeps the committed `src/data/photos.json` instead.

### Cloudinary secrets (optional)

Add these repository secrets (Settings → Secrets and variables → Actions) so the gallery can refresh during builds:

| Secret | Purpose |
|--------|---------|
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name (also defaults to `thetonyweapon`) |
| `CLOUDINARY_API_KEY` | Cloudinary Admin API key |
| `CLOUDINARY_API_SECRET` | Cloudinary Admin API secret |

If left unset, `fetch-photos.mjs` skips fetching and the build proceeds with the cached `src/data/photos.json`.

