import React from 'react';
import { SimpleGrid } from '@mantine/core';
import type { OfficePhoto } from '@/lib/office-photos';
import classes from './OfficePicture.module.css';

/** A photo of the office: AVIF where the browser takes it, JPEG otherwise; lazy unless it is the page's LCP element. */
export function OfficePicture({ photo, alt, priority = false }: { photo: OfficePhoto; alt: string; priority?: boolean }) {
  return (
    <picture>
      <source type="image/avif" srcSet={photo.avif} />
      <img
        src={photo.jpg}
        alt={alt}
        width={photo.width}
        height={photo.height}
        decoding="async"
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        className={classes.photo}
      />
    </picture>
  );
}

/** Text beside an office photo, stacked on phones: the FAQ hero and the closing CTA with the reception photo. */
export function BesidePhoto({ children }: { children: React.ReactNode }) {
  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing={{ base: 40, md: 64 }} className={classes.besidePhoto}>
      {children}
    </SimpleGrid>
  );
}
