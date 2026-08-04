import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import photoData from '../data/photos.json';

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

function cloudinaryUrl(publicId, width) {
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_${width}/${publicId}`;
}

function folderOf(publicId) {
  const slash = publicId.indexOf('/');
  return slash === -1 ? null : publicId.slice(0, slash);
}

function stripUnderscores(name) {
  return name.replace(/_/g, ' ');
}

function newestFirst(photos) {
  return [...photos].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

const Photos = () => {
  const { folderName } = useParams();
  const photos = photoData.photos || [];
  const [selectedIndex, setSelectedIndex] = useState(null);

  const folders = useMemo(() => {
    const groups = new Map();
    for (const photo of photos) {
      const folder = folderOf(photo.publicId) ?? 'Photos';
      if (!groups.has(folder)) groups.set(folder, []);
      groups.get(folder).push(photo);
    }
    return [...groups.entries()]
      .map(([name, items]) => ({ name, photos: newestFirst(items) }))
      .sort((a, b) => new Date(b.photos[0].createdAt) - new Date(a.photos[0].createdAt));
  }, [photos]);

  const activeFolder = folderName ? folders.find((f) => f.name === folderName) : undefined;
  const activePhotos = activeFolder ? activeFolder.photos : [];

  const close = useCallback(() => setSelectedIndex(null), []);
  const prev = useCallback(() => {
    setSelectedIndex((i) => (i > 0 ? i - 1 : activePhotos.length - 1));
  }, [activePhotos.length]);
  const next = useCallback(() => {
    setSelectedIndex((i) => (i < activePhotos.length - 1 ? i + 1 : 0));
  }, [activePhotos.length]);

  useEffect(() => {
    setSelectedIndex(null);
  }, [folderName]);

  useEffect(() => {
    if (selectedIndex === null) return;
    const handler = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [selectedIndex, close, prev, next]);

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
      <svg className="h-16 w-16 text-muted-foreground/40 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <h2 className="text-xl font-semibold text-foreground mb-2">No photos yet</h2>
      <p className="text-muted-foreground/60 max-w-md text-center">
        Upload images to your Cloudinary account to see them here.
      </p>
    </div>
  );

  return (
    <Layout>
      <SEO
        title={activeFolder ? stripUnderscores(activeFolder.name) : 'Photos'}
        description="A gallery of photos from travels, soccer, and life around Austin, TX."
        path={activeFolder ? `/photos/${activeFolder.name}` : '/photos'}
      />
      <div className="min-h-[calc(100vh-4rem)] flex flex-col">
        <div className="w-[80%] mx-auto p-4 lg:p-8 flex-1">
          {photos.length === 0 ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Photos</h1>
                <p className="text-muted-foreground/60">0 photos</p>
              </div>
              {emptyState}
            </>
          ) : activeFolder ? (
            <div className="animate-fade-in">
              <Link
                to="/photos"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground/80 hover:text-foreground transition-colors mb-4"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                All folders
              </Link>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">{stripUnderscores(activeFolder.name)}</h1>
                <p className="text-muted-foreground/60">
                  {activePhotos.length} photo{activePhotos.length === 1 ? '' : 's'}
                </p>
              </div>
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 animate-fade-in delay-200">
                {activePhotos.map((photo, index) => (
                  <figure
                    key={photo.publicId}
                    className="break-inside-avoid mb-4 overflow-hidden rounded-lg border border-border bg-card"
                  >
                    <button
                      onClick={() => setSelectedIndex(index)}
                      className="block w-full group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <img
                        src={cloudinaryUrl(photo.publicId, 600)}
                        alt={photo.publicId.split('/').pop()}
                        width={photo.width}
                        height={photo.height}
                        loading="lazy"
                        className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                      />
                    </button>
                    {photo.tags && photo.tags.length > 0 && (
                      <figcaption className="flex flex-wrap gap-1.5 px-3 py-2">
                        {photo.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Photos</h1>
                <p className="text-muted-foreground/60">
                  {folders.length} folder{folders.length === 1 ? '' : 's'}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in delay-200">
                {folders.map((folder) => (
                  <Link
                    key={folder.name}
                    to={`/photos/${encodeURIComponent(folder.name)}`}
                    className="group relative overflow-hidden rounded-lg border border-border bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="relative aspect-[3/2] overflow-hidden">
                      <img
                        src={cloudinaryUrl(folder.photos[0].publicId, 600)}
                        alt={stripUnderscores(folder.name)}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h2 className="text-white font-semibold leading-tight">
                          {stripUnderscores(folder.name)}
                        </h2>
                        <p className="text-white/80 text-sm">
                          {folder.photos.length} photo{folder.photos.length === 1 ? '' : 's'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedIndex !== null && (() => {
        const photo = activePhotos[selectedIndex];
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={close}
            role="dialog"
            aria-label="Photo viewer"
          >
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors z-10"
              aria-label="Previous photo"
            >
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <img
              src={cloudinaryUrl(photo.publicId, 1600)}
              alt={photo.publicId.split('/').pop()}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors z-10"
              aria-label="Next photo"
            >
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={close}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
              aria-label="Close viewer"
            >
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
              {selectedIndex + 1} / {activePhotos.length}
            </div>
          </div>
        );
      })()}
    </Layout>
  );
};

export default Photos;
