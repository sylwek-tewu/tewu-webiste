import { describe, expect, it } from 'vitest';
import {
  collectJsonLdTypes,
  evaluatePage,
  evaluateSite,
  parseAttributes,
  parseDocument,
  parseSitemapUrls,
} from './seo-check-lib.mjs';
import { DESC, ORIGIN, firmJsonLd, page } from './seo-check-fixtures.mjs';

const errors = (findings) => findings.filter((f) => f.level === 'error').map((f) => f.check);
const warnings = (findings) => findings.filter((f) => f.level === 'warning').map((f) => f.check);

describe('parseAttributes', () => {
  it('reads attributes in any order, with either quote style', () => {
    expect(parseAttributes(`<a hrefLang="uk" class='x y' href="/uk">`)).toEqual({ hreflang: 'uk', class: 'x y', href: '/uk' });
  });

  it('decodes the entities Next.js emits in attribute values', () => {
    expect(parseAttributes('<meta content="Tom &amp; Jerry &quot;q&quot;"/>').content).toBe('Tom & Jerry "q"');
  });
});

describe('decodeEntities', () => {
  it('leaves a malformed numeric entity as it is instead of throwing', () => {
    expect(parseAttributes('<meta content="a &#99999999; b &#xFFFFFFFF; c"/>').content).toBe('a &#99999999; b &#xFFFFFFFF; c');
  });
});

describe('parseSitemapUrls', () => {
  it('lists every <loc>', () => {
    const xml = `<urlset><url><loc>${ORIGIN}/</loc></url><url><loc>${ORIGIN}/uk</loc></url></urlset>`;
    expect(parseSitemapUrls(xml)).toEqual([`${ORIGIN}/`, `${ORIGIN}/uk`]);
  });
});

describe('parseDocument', () => {
  it('counts only <title> elements inside <head>', () => {
    const doc = parseDocument(page().html);
    expect(doc.titles).toEqual(['Biuro rachunkowe w Szczecinie']);
  });

  it('collects headings with levels and text, ignoring markup', () => {
    const doc = parseDocument('<head></head><body><h1>A <em>b</em> &amp; c</h1><h3>d</h3></body>');
    expect(doc.headings).toEqual([{ level: 1, text: 'A b & c' }, { level: 3, text: 'd' }]);
  });
});

describe('collectJsonLdTypes', () => {
  it('handles @graph, top-level objects and arrays of types', () => {
    const types = collectJsonLdTypes([firmJsonLd, { '@type': 'FAQPage' }, { '@type': ['Service', 'Thing'] }]);
    expect([...types].sort()).toEqual(['AccountingService', 'FAQPage', 'Service', 'Thing', 'WebSite']);
  });
});

describe('evaluatePage', () => {
  it('accepts a valid page', () => {
    expect(evaluatePage(page())).toEqual([]);
  });

  it('does not count the SVG logo <title> in the body', () => {
    const p = page({ body: { html: '<h1>A</h1><svg><title>1</title></svg><svg><title>2</title></svg>' } });
    expect(errors(evaluatePage(p))).toEqual([]);
  });

  it('errors on a second <title> in the head', () => {
    expect(errors(evaluatePage(page({ head: { extra: '<title>Another</title>' } })))).toEqual(['title']);
  });

  it('warns about a title above 60 characters', () => {
    const findings = evaluatePage(page({ head: { title: 'x'.repeat(61) } }));
    expect(errors(findings)).toEqual([]);
    expect(warnings(findings)).toEqual(['title']);
  });

  it('errors when the description is missing and warns when it is short', () => {
    expect(errors(evaluatePage(page({ head: { description: null } })))).toEqual(['description']);
    const short = evaluatePage(page({ head: { description: 'Za krótki opis.' } }));
    expect(errors(short)).toEqual([]);
    expect(warnings(short)).toEqual(['description']);
  });

  it('errors on two canonicals', () => {
    const extra = `<link rel="canonical" href="${ORIGIN}/inne"/>`;
    expect(errors(evaluatePage(page({ head: { extra } })))).toEqual(['canonical']);
  });

  it('errors when the canonical differs from the sitemap URL', () => {
    expect(errors(evaluatePage(page({ path: '/uk', head: { canonical: `${ORIGIN}/` } })))).toEqual(['canonical', 'og:url']);
  });

  it('treats the root URL with and without the trailing slash as equal', () => {
    const p = page();
    p.html = p.html.replace(`canonical" href="${ORIGIN}/"`, `canonical" href="${ORIGIN}"`).replace(`og:url" content="${ORIGIN}/"`, `og:url" content="${ORIGIN}"`);
    expect(evaluatePage(p)).toEqual([]);
  });

  it('errors when og:url differs from the canonical', () => {
    const p = page();
    p.html = p.html.replace(`og:url" content="${ORIGIN}/"`, `og:url" content="${ORIGIN}/uk"`);
    expect(errors(evaluatePage(p))).toEqual(['og:url']);
  });

  it('errors on noindex in the robots meta and in X-Robots-Tag', () => {
    const meta = page({ head: { extra: '<meta name="robots" content="noindex, nofollow"/>' } });
    expect(errors(evaluatePage(meta))).toEqual(['noindex']);
    const header = { ...page(), headers: { 'x-robots-tag': 'noindex' } };
    expect(errors(evaluatePage(header))).toEqual(['noindex']);
  });

  it('errors on a non-200 status', () => {
    expect(errors(evaluatePage({ ...page(), status: 500 }))).toEqual(['status']);
  });

  it('errors on a missing x-default alternate', () => {
    const p = page();
    p.html = p.html.replace(/<link rel="alternate" hrefLang="x-default"[^>]*>/, '');
    expect(errors(evaluatePage(p))).toEqual(['hreflang']);
  });

  it('errors on relative hreflang URLs', () => {
    const p = page();
    p.html = p.html.replace(`hrefLang="uk" href="${ORIGIN}/uk"`, 'hrefLang="uk" href="/uk"');
    expect(errors(evaluatePage(p))).toEqual(['hreflang']);
  });

  it('errors on zero or two <h1>', () => {
    expect(errors(evaluatePage(page({ body: { html: '<h2>A</h2>' } })))).toContain('h1');
    expect(errors(evaluatePage(page({ body: { html: '<h1>A</h1><h1>B</h1>' } })))).toEqual(['h1']);
  });

  it('errors on a missing og:image and twitter:card', () => {
    const p = page();
    p.html = p.html.replace(/<meta property="og:image"[^>]*>/, '').replace(/<meta name="twitter:card"[^>]*>/, '');
    expect(errors(evaluatePage(p)).sort()).toEqual(['og:image', 'twitter:card']);
  });

  it('errors on a relative og:image', () => {
    const p = page();
    p.html = p.html.replace(`${ORIGIN}/opengraph-image-35ziip`, '/opengraph-image-35ziip');
    expect(errors(evaluatePage(p))).toEqual(['og:image']);
  });

  it('errors on JSON-LD that does not parse', () => {
    expect(errors(evaluatePage(page({ head: { jsonLd: [firmJsonLd, '{"@type": '] } })))).toEqual(['json-ld']);
  });

  it('errors when the AccountingService is missing', () => {
    expect(errors(evaluatePage(page({ head: { jsonLd: [{ '@type': 'WebSite' }] } })))).toEqual(['json-ld']);
  });

  it('errors on "@type":"Review" and AggregateRating', () => {
    const bad = { '@context': 'https://schema.org', '@graph': [{ '@type': 'AccountingService', '@id': `${ORIGIN}/#firma` }, { '@type': 'Review' }] };
    expect(errors(evaluatePage(page({ head: { jsonLd: [bad] } })))).toEqual(['json-ld']);
    const rating = { '@type': 'AggregateRating' };
    expect(errors(evaluatePage(page({ head: { jsonLd: [firmJsonLd, rating] } })))).toEqual(['json-ld']);
  });

  it('requires Service, BreadcrumbList and FAQPage on service pages, PL and UK', () => {
    for (const path of ['/uslugi/kpir', '/uk/uslugi/kpir']) {
      expect(errors(evaluatePage(page({ path })))).toEqual(['json-ld']);
      const full = [firmJsonLd, { '@type': 'Service' }, { '@type': 'BreadcrumbList' }, { '@type': 'FAQPage' }];
      expect(errors(evaluatePage(page({ path, head: { jsonLd: full } })))).toEqual([]);
    }
  });

  it('errors on "doradztwa podatkowego" in an H2', () => {
    const p = page({ body: { html: '<h1>A</h1><h2>Pomoc w zakresie doradztwa podatkowego</h2>' } });
    expect(errors(evaluatePage(p))).toEqual(['forbidden-phrase']);
  });

  it('errors on forbidden phrases in the title, the description and JSON-LD', () => {
    expect(errors(evaluatePage(page({ head: { title: 'Doradztwo podatkowe' } })))).toEqual(['forbidden-phrase']);
    expect(errors(evaluatePage(page({ head: { description: `${DESC} Податкове консультування.` } })))).toEqual(['forbidden-phrase']);
    const ld = { '@type': 'Service', description: 'doradztwo podatkowe' };
    expect(errors(evaluatePage(page({ head: { jsonLd: [firmJsonLd, ld] } })))).toEqual(['forbidden-phrase']);
  });

  it('errors on the reversed word order of the forbidden phrases, Polish and Ukrainian', () => {
    const pl = page({ body: { html: '<h1>A</h1><h2>Podatkowe doradztwo dla firm</h2>' } });
    expect(errors(evaluatePage(pl))).toEqual(['forbidden-phrase']);
    const uk = page({ body: { html: '<h1>A</h1><h2>Консультації податкові для фірм</h2>' } });
    expect(errors(evaluatePage(uk))).toEqual(['forbidden-phrase']);
  });

  it('errors on a forbidden phrase in og:title', () => {
    const p = page();
    p.html = p.html.replace('og:title" content="Biuro rachunkowe"', 'og:title" content="Doradztwo podatkowe Szczecin"');
    expect(errors(evaluatePage(p))).toEqual(['forbidden-phrase']);
  });

  it('parses JSON-LD whose "<" is escaped, as the site emits it', () => {
    // Same escaping as serializeJsonLd in src/components/seo/JsonLd.tsx
    const escaped = JSON.stringify({ '@type': 'Service', description: 'a </script> b' }).replace(/</g, '\\' + 'u003c');
    expect(escaped).not.toContain('<');
    expect(errors(evaluatePage(page({ head: { jsonLd: [firmJsonLd, escaped] } })))).toEqual([]);
  });

  it('errors when the canonical differs from the sitemap URL only by a trailing slash', () => {
    const p = page({ path: '/x', head: { canonical: `${ORIGIN}/x/` } });
    expect(errors(evaluatePage(p))).toEqual(['canonical', 'og:url']);
  });

  it('errors on a missing og:title and og:description', () => {
    const p = page();
    p.html = p.html.replace(/<meta property="og:title"[^>]*>/, '').replace(/<meta property="og:description"[^>]*>/, '');
    expect(errors(evaluatePage(p)).sort()).toEqual(['og:description', 'og:title']);
  });

  it('errors on an <img> without alt but accepts alt=""', () => {
    expect(errors(evaluatePage(page({ body: { html: '<h1>A</h1><img src="/a.png">' } })))).toEqual(['img-alt']);
    expect(errors(evaluatePage(page({ body: { html: '<h1>A</h1><img src="/a.png" alt="">' } })))).toEqual([]);
  });

  it('warns about a heading level skip', () => {
    const findings = evaluatePage(page({ body: { html: '<h1>A</h1><h3>B</h3>' } }));
    expect(errors(findings)).toEqual([]);
    expect(warnings(findings)).toEqual(['heading-order']);
  });
});

describe('evaluateSite', () => {
  const ok = {
    robots: { status: 200, body: `User-Agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n` },
    previewHost: { status: 200, headers: { 'x-robots-tag': 'noindex, nofollow' } },
    wwwRedirect: { status: 308, headers: { location: `${ORIGIN}/uslugi/kpir?utm_source=check` } },
    notFound: { status: 404, html: '<head><title>404</title><meta name="robots" content="noindex"/></head><body></body>' },
    ogImage: { status: 200, headers: { 'content-type': 'image/png' } },
  };

  it('accepts a correct site', () => {
    expect(evaluateSite(ok)).toEqual([]);
  });

  it('errors on a robots.txt without the Sitemap line', () => {
    expect(errors(evaluateSite({ ...ok, robots: { status: 200, body: 'User-Agent: *\nAllow: /' } }))).toEqual(['robots.txt']);
  });

  it('errors on a robots.txt that is not 200', () => {
    expect(errors(evaluateSite({ ...ok, robots: { status: 404, body: ok.robots.body } }))).toEqual(['robots.txt']);
  });

  it('errors when a foreign host is not noindex', () => {
    expect(errors(evaluateSite({ ...ok, previewHost: { status: 200, headers: {} } }))).toEqual(['preview-noindex']);
  });

  it('errors when www does not 308 to the apex with the query string', () => {
    const wrong = { status: 307, headers: { location: `${ORIGIN}/uslugi/kpir` } };
    expect(errors(evaluateSite({ ...ok, wwwRedirect: wrong }))).toEqual(['www-redirect', 'www-redirect']);
  });

  it('errors when the 404 page has no or duplicate noindex', () => {
    const none = { status: 404, html: '<head><title>404</title></head><body></body>' };
    expect(errors(evaluateSite({ ...ok, notFound: none }))).toEqual(['404']);
    const twice = { status: 404, html: '<head><meta name="robots" content="noindex"/><meta name="robots" content="noindex"/></head>' };
    expect(errors(evaluateSite({ ...ok, notFound: twice }))).toEqual(['404']);
    expect(errors(evaluateSite({ ...ok, notFound: { ...twice, status: 200 } }))).toEqual(['404', '404']);
  });

  it('errors when the og:image is not a 200 image/png', () => {
    expect(errors(evaluateSite({ ...ok, ogImage: { status: 404, headers: {} } }))).toEqual(['og:image-file', 'og:image-file']);
    expect(errors(evaluateSite({ ...ok, ogImage: { status: 200, headers: { 'content-type': 'text/html' } } }))).toEqual(['og:image-file']);
  });
});
