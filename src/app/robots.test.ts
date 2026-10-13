import { describe, it, expect } from 'vitest';
import robots from './robots';
import { SITE_URL } from '@/constants';

describe('robots.txt', () => {
  it('allows every crawler and points to the sitemap', () => {
    expect(robots()).toEqual({
      rules: [{ userAgent: '*', allow: '/' }],
      sitemap: `${SITE_URL}/sitemap.xml`,
    });
  });

  it('does not set the deprecated Host directive', () => {
    expect(robots().host).toBeUndefined();
  });
});
