import { describe, it, expect } from 'vitest';
import { COMPANY, telHref } from './company';

describe('COMPANY', () => {
  it('lists office phones in display order with E.164 values', () => {
    expect(COMPANY.phones.office).toEqual([
      { display: '602 235 736', e164: '+48602235736' },
      { display: '91 48 24 190', e164: '+48914824190' },
    ]);
  });

  it('lists mobile phones in their existing order', () => {
    expect(COMPANY.phones.mobile).toEqual([
      { display: '501 482 555', e164: '+48501482555' },
      { display: '886 543 973', e164: '+48886543973' },
    ]);
  });

  it('holds names, address, e-mails and registry numbers', () => {
    expect(COMPANY.legalName).toBe('Biuro Rachunkowe TEWU Sp. z o.o.');
    expect(COMPANY.shortName).toBe('Biuro Rachunkowe TEWU');
    expect(COMPANY.address).toEqual({
      street: 'Al. Powstańców Wielkopolskich 78A LU2',
      postalCode: '70-110',
      city: 'Szczecin',
      country: 'PL',
      line: 'Al. Powstańców Wielkopolskich 78A LU2, 70-110 Szczecin',
    });
    expect(COMPANY.emails).toEqual({ main: 'biuro@tewu.szczecin.pl', second: 'sw@tewu.szczecin.pl' });
    expect(COMPANY.registry).toEqual({ nip: '9552249417', regon: '320601499', krs: '0000320281' });
    expect(COMPANY.bankAccount).toBe('10 1020 4795 0000 9002 0180 2966');
  });

  it('holds opening hours, profile, coordinates and languages', () => {
    expect(COMPANY.openingHours).toEqual({ days: ['Mo', 'Tu', 'We', 'Th', 'Fr'], opens: '08:00', closes: '16:00' });
    expect(COMPANY.googleBusinessProfileUrl).toBe('https://www.google.com/maps?cid=12155973943651028905');
    expect(COMPANY.geo).toEqual({ latitude: 53.4136901, longitude: 14.5328745 });
    expect(COMPANY.languages).toEqual(['pl', 'uk']);
  });

  it('builds the keyless map embed URL around the profile location', () => {
    expect(COMPANY.mapEmbedUrl).toBe(
      'https://www.google.com/maps?q=Biuro+Rachunkowe+TEWU+Sp.+z+o.o.,+Al.+Powsta%C5%84c%C3%B3w+Wielkopolskich+78A,+70-110+Szczecin&ll=53.4136901,14.5328745&z=17&output=embed',
    );
  });
});

describe('telHref', () => {
  it('builds a tel: href from a phone entry', () => {
    expect(telHref(COMPANY.phones.office[0])).toBe('tel:+48602235736');
  });
});
