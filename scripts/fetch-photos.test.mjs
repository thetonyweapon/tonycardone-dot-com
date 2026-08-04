import { vi } from 'vitest';
import { readFileSync, rmSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    api: {
      resources: vi.fn(),
    },
  },
}));

import { v2 as cloudinary } from 'cloudinary';
import { fetchAllImages } from './fetch-photos.mjs';

const resourcesSpy = vi.mocked(cloudinary.api.resources);

function tempManifestPath() {
  return join(tmpdir(), `fetch-photos-test-${process.pid}-${Date.now()}.json`);
}

describe('fetch-photos (Cloudinary Admin API)', () => {
  beforeEach(() => {
    resourcesSpy.mockReset();
  });

  it('requests tags from the Admin API so asset tags survive into photos.json', async () => {
    resourcesSpy.mockResolvedValue({
      resources: [
        {
          public_id: 'Trip1/p1',
          format: 'jpg',
          width: 800,
          height: 600,
          created_at: '2026-01-02T00:00:00Z',
          tags: ['austin', 'trip'],
        },
        {
          public_id: 'Trip1/p2',
          format: 'jpg',
          width: 800,
          height: 600,
          created_at: '2026-01-01T00:00:00Z',
          tags: [],
        },
      ],
      next_cursor: null,
    });

    const outPath = tempManifestPath();
    try {
      await fetchAllImages({ outputPath: outPath });

      expect(resourcesSpy).toHaveBeenCalledWith(
        expect.objectContaining({ tags: true }),
      );

      const manifest = JSON.parse(readFileSync(outPath, 'utf8'));
      expect(manifest.photos[0].publicId).toBe('Trip1/p1');
      expect(manifest.photos[0].tags).toEqual(['austin', 'trip']);
      expect(manifest.photos[1].tags).toEqual([]);
    } finally {
      rmSync(outPath, { force: true });
    }
  });

  it('walks every configured folder with tags: true', async () => {
    resourcesSpy.mockResolvedValue({ resources: [], next_cursor: null });

    const outPath = tempManifestPath();
    try {
      await fetchAllImages({ outputPath: outPath });
    } finally {
      rmSync(outPath, { force: true });
    }

    expect(resourcesSpy.mock.calls.length).toBeGreaterThan(0);
    for (const call of resourcesSpy.mock.calls) {
      expect(call[0]).toMatchObject({ type: 'upload', tags: true });
    }
    expect(existsSync(outPath)).toBe(false);
  });
});
