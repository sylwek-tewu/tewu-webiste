/**
 * Single source of truth for company facts (names, address, phones, registry numbers, map).
 * Client-safe: plain data, no React and no dictionary import. Hours text shown to visitors
 * stays in the dictionaries (`t.contact.hoursValue`); `openingHours` here is the machine-readable form.
 */

export interface CompanyPhone {
  /** House style shown to visitors, e.g. '91 48 24 190'. */
  display: string;
  e164: string;
}

/** `tel:` href for a phone entry, so call sites never build fallbacks of their own. */
export function telHref(phone: CompanyPhone): string {
  return `tel:${phone.e164}`;
}

const STREET = 'Al. Powstańców Wielkopolskich 78A LU2';
const POSTAL_CODE = '70-110';
const CITY = 'Szczecin';
const LEGAL_NAME = 'Biuro Rachunkowe TEWU Sp. z o.o.';
const LANDLINE: CompanyPhone = { display: '91 48 24 190', e164: '+48914824190' };
const COORDINATES = { latitude: 53.4136901, longitude: 14.5328745 } as const;

// Keyless Google Maps embed of the TEWU business profile location.
const MAP_EMBED_URL =
  'https://www.google.com/maps?q=Biuro+Rachunkowe+TEWU+Sp.+z+o.o.,+Al.+Powsta%C5%84c%C3%B3w+Wielkopolskich+78A,+70-110+Szczecin' +
  `&ll=${COORDINATES.latitude},${COORDINATES.longitude}&z=17&output=embed`;

export const COMPANY = {
  legalName: LEGAL_NAME,
  shortName: 'Biuro Rachunkowe TEWU',
  address: {
    street: STREET,
    postalCode: POSTAL_CODE,
    city: CITY,
    country: 'PL',
    line: `${STREET}, ${POSTAL_CODE} ${CITY}`,
  },
  phones: {
    // Display order: 602 235 736 first, then the landline.
    office: [
      { display: '602 235 736', e164: '+48602235736' },
      LANDLINE,
    ],
    /** The secretariat landline (callback widget default, privacy policy contact line). */
    landline: LANDLINE,
    mobile: [
      { display: '501 482 555', e164: '+48501482555' },
      { display: '886 543 973', e164: '+48886543973' },
    ],
  },
  emails: {
    main: 'biuro@tewu.szczecin.pl',
    second: 'sw@tewu.szczecin.pl',
  },
  openingHours: {
    days: ['Mo', 'Tu', 'We', 'Th', 'Fr'],
    opens: '08:00',
    closes: '16:00',
  },
  registry: {
    nip: '9552249417',
    regon: '320601499',
    krs: '0000320281',
  },
  bankAccount: '10 1020 4795 0000 9002 0180 2966',
  googleBusinessProfileUrl: 'https://www.google.com/maps?cid=12155973943651028905',
  mapEmbedUrl: MAP_EMBED_URL,
  geo: COORDINATES,
  languages: ['pl', 'uk'],
} as const;
