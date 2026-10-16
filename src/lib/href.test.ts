import { describe, it, expect } from 'vitest';
import { isExternalHref } from './href';

describe('isExternalHref', () => {
  it('tells site paths from external addresses', () => {
    expect(isExternalHref('https://www.biznes.gov.pl/pl/portal/00285')).toBe(true);
    expect(isExternalHref('/uslugi/kpir')).toBe(false);
  });
});
