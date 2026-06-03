# TonyCardone.com

Personal portfolio site built with [React](https://react.dev), [Vite](https://vitejs.dev), [Tailwind CSS v4](https://tailwindcss.com), and [React Router](https://reactrouter.com).

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (auto-fetches photos from Cloudinary) |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm run update-photos` | Refresh photo data from Cloudinary |

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
