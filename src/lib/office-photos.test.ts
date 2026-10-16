import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { OFFICE_PHOTOS } from './office-photos';

const PUBLIC = path.resolve(import.meta.dirname, '../../public');

describe('OFFICE_PHOTOS', () => {
  it.each(Object.entries(OFFICE_PHOTOS))('%s: both files exist in public/', (_name, photo) => {
    for (const file of [photo.jpg, photo.avif]) {
      expect(fs.existsSync(path.join(PUBLIC, file)), file).toBe(true);
    }
  });

  it.each(Object.entries(OFFICE_PHOTOS))('%s: the JPEG has the registered size and no EXIF block', (_name, photo) => {
    const jpeg = fs.readFileSync(path.join(PUBLIC, photo.jpg));
    // SOF0/SOF2 marker: height and width are the 2-byte values after the precision byte
    let offset = 2;
    let size: { width: number; height: number } | null = null;
    let hasExif = false;
    while (offset < jpeg.length && !size) {
      const marker = jpeg.readUInt16BE(offset);
      const length = jpeg.readUInt16BE(offset + 2);
      if (marker === 0xffe1) hasExif = true;
      if (marker === 0xffc0 || marker === 0xffc2) size = { height: jpeg.readUInt16BE(offset + 5), width: jpeg.readUInt16BE(offset + 7) };
      offset += 2 + length;
    }
    expect(size).toEqual({ width: photo.width, height: photo.height });
    expect(hasExif).toBe(false);
  });
});
