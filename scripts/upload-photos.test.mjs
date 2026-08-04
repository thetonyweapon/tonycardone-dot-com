import { vi } from 'vitest';

vi.mock('cloudinary', () => ({
  v2: {
    uploader: {
      upload: vi.fn(),
    },
  },
}));

import { v2 as cloudinary } from 'cloudinary';
import { uploadBuffer } from './upload-photos.mjs';
import { existsSync, readdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const uploadSpy = vi.mocked(cloudinary.uploader.upload);

function leftovers() {
  return readdirSync(tmpdir()).filter((n) => n.startsWith('cloudinary-upload-'));
}

describe('uploadBuffer (cloudinary v2: file must be a path, not a Buffer)', () => {
  beforeEach(() => {
    uploadSpy.mockReset();
    uploadSpy.mockResolvedValue({ public_id: 'pubid', secure_url: 'https://example.com/pubid.jpg' });
  });

  it('passes a filesystem PATH (string), not a Buffer, to cloudinary.uploader.upload', async () => {
    const buf = Buffer.from('fake-jpeg-bytes', 'latin1');
    const result = await uploadBuffer(buf, 'my_folder', 'Some Photo', 'jpeg');

    expect(uploadSpy).toHaveBeenCalledTimes(1);
    const [fileArg, opts] = uploadSpy.mock.calls[0];
    expect(typeof fileArg).toBe('string');
    expect(Buffer.isBuffer(fileArg)).toBe(false);
    expect(fileArg.startsWith(tmpdir())).toBe(true);
    expect(fileArg.endsWith('.jpeg')).toBe(true);
    expect(opts).toEqual({
      folder: 'my_folder',
      public_id: 'Some Photo',
      resource_type: 'image',
      invalidate: false,
    });
    expect(result).toEqual({ public_id: 'pubid', secure_url: 'https://example.com/pubid.jpg' });
  });

  it('removes the temp file even when upload rejects', async () => {
    uploadSpy.mockRejectedValue(new Error('boom'));
    const buf = Buffer.from('x', 'latin1');
    const before = leftovers().length;
    const promise = uploadBuffer(buf, 'f', 'id', 'jpeg');
    await expect(promise).rejects.toThrow('boom');
    const [fileArg] = uploadSpy.mock.calls[0];
    expect(existsSync(fileArg)).toBe(false);
    // no net increase in temp leftovers
    expect(leftovers().length).toBe(before);
  });

  it('uses a .png temp extension for png format', async () => {
    await uploadBuffer(Buffer.from('x', 'latin1'), 'f', 'id', 'png');
    const [fileArg] = uploadSpy.mock.calls[0];
    expect(fileArg.endsWith('.png')).toBe(true);
    expect(existsSync(fileArg)).toBe(false);
  });
});
