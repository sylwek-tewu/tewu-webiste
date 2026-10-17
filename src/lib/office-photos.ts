/**
 * Real photos of the office (from the project owner, 15.10.2026; the Prezes agreed to publishing his).
 * Made from the originals with sharp: no EXIF, 4:3, AVIF for browsers that take it and JPEG otherwise.
 */
export interface OfficePhoto {
  jpg: string;
  avif: string;
  width: number;
  height: number;
}

export const OFFICE_PHOTOS = {
  /** The entrance at Al. Powstańców Wielkopolskich 78A, cropped to the TEWU windows. */
  exterior: { jpg: '/img/biuro/budynek.jpg', avif: '/img/biuro/budynek.avif', width: 960, height: 720 },
  /** The reception desk with the Prezes, Sylwester Wrzeszcz (the office as it is today). */
  reception: { jpg: '/img/biuro/recepcja.jpg', avif: '/img/biuro/recepcja.avif', width: 1200, height: 900 },
  /** The Prezes at his desk, two of the team behind the partition (the same office, photo from 2012). */
  team: { jpg: '/img/biuro/zespol.jpg', avif: '/img/biuro/zespol.avif', width: 1200, height: 900 },
} as const satisfies Record<string, OfficePhoto>;
