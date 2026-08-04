# TonyCardone.com

Personal portfolio site built with [React](https://react.dev), [Vite](https://vitejs.dev), [Tailwind CSS v4](https://tailwindcss.com), and [React Router](https://reactrouter.com).

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (auto-fetches photos from Cloudinary and parses the resume) |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm run update-photos` | Refresh photo data from Cloudinary |
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
```

## Routes

- `/` — Home page with hero photo of downtown Austin
- `/resume` — Resume with PDF/DOCX download links
- `/blog` — Blog listing
- `/blog/:slug` — Individual blog post
- `/photos` — Photo gallery powered by Cloudinary

## Photos

The photo gallery fetches images from Cloudinary using the Admin API. Only photos inside the folders listed in `src/data/gallery.config.js` are displayed.

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

## Resume

The resume is authored as `public/Resume.docx` (with `public/Resume.pdf` as a generated download). The `/resume` page renders content parsed from the Word document so the page stays in sync with the source file.

| File | Purpose |
|------|---------|
| `public/Resume.docx` | Source resume document (edit this) |
| `public/Resume.pdf` | Generated PDF download of the same resume |
| `src/data/resume.json` | Parsed, structured resume data (auto-generated, do not edit) |
| `scripts/fetch-resume.mjs` | Parses `public/Resume.docx` into `src/data/resume.json` at build time |

On `npm run dev` and `npm run build`, the resume is parsed automatically. To refresh without a full dev/build cycle, run `npm run update-resume`. The `/resume` sitemap entry's `lastmod` is set from the `Resume.pdf` modification time by `scripts/generate-site.mjs`.
