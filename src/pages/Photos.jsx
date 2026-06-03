import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import photoData from '../data/photos.json';

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

function cloudinaryUrl(publicId, width) {
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_${width}/${publicId}`;
}

function aspectRatioClass(width, height) {
  if (!width || !height) return 'aspect-square';
  const ratio = width / height;
  if (ratio > 1.4) return 'aspect-video';
  if (ratio < 0.7) return 'aspect-[3/4]';
  return 'aspect-square';
}

const Photos = () => {
  const photos = photoData.photos || [];
  const [selectedIndex, setSelectedIndex] = useState(null);

  const close = useCallback(() => setSelectedIndex(null), []);

  const prev = useCallback(() => {
    setSelectedIndex((i) => (i > 0 ? i - 1 : photos.length - 1));
  }, [photos.length]);

  const next = useCallback(() => {
    setSelectedIndex((i) => (i < photos.length - 1 ? i + 1 : 0));
  }, [photos.length]);

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

  return (
    <Layout>
      <SEO
        title="Photos"
        description="A gallery of photos from travels, soccer, and life around Austin, TX."
        path="/photos"
      />
      <div className="min-h-[calc(100vh-4rem)] flex flex-col">
        <div className="w-[80%] mx-auto p-4 lg:p-8 flex-1">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground mb-2">Photos</h1>
            <p className="text-muted-foreground/60">
              {photos.length > 0
                ? `${photos.length} photo${photos.length === 1 ? '' : 's'}`
                : 'No photos yet'}
            </p>
          </div>

          <div className="mb-8 p-4 rounded-lg border border-border bg-muted/50 text-center animate-fade-in delay-100">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground/80">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              Coming Soon — I have to resize most of these photos before uploading and haven't done it yet.
            </span>
          </div>

          {photos.length === 0 && (
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
          )}

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 animate-fade-in delay-200">
            {photos.map((photo, index) => (
              <button
                key={photo.publicId}
                onClick={() => setSelectedIndex(index)}
                className="break-inside-avoid mb-4 overflow-hidden rounded-lg border border-border bg-card group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
            ))}
          </div>
        </div>
      </div>

      {selectedIndex !== null && (() => {
        const photo = photos[selectedIndex];
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
              {selectedIndex + 1} / {photos.length}
            </div>
          </div>
        );
      })()}
    </Layout>
  );
};

export default Photos;
