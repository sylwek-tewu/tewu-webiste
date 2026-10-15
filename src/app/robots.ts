import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/constants';

// `host` is left out on purpose: Google ignores the directive. Preview deployments are kept out
// of the index by the X-Robots-Tag header in next.config.mjs, not by Disallow here.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
