// Test fixtures shared by the seo-check tests: a fully valid page that each test breaks in one place.
export const ORIGIN = 'https://tewu.szczecin.pl';
export const DESC = 'Prowadzimy księgi rachunkowe, kadry i płace oraz rozliczenia podatkowe dla firm ze Szczecina. Zapraszamy do kontaktu z biurem rachunkowym.';

export const firmJsonLd = { '@context': 'https://schema.org', '@graph': [{ '@type': 'AccountingService', '@id': `${ORIGIN}/#firma` }, { '@type': 'WebSite' }] };

/** A fully valid page; every test overrides one piece of it. */
export function page({ path = '/', head = {}, body = {} } = {}) {
  const url = ORIGIN + path;
  const jsonLd = head.jsonLd ?? [firmJsonLd];
  const html = `<!DOCTYPE html><html lang="pl"><head>
<title>${head.title ?? 'Biuro rachunkowe w Szczecinie'}</title>
${head.description === null ? '' : `<meta name="description" content="${head.description ?? DESC}"/>`}
${head.extra ?? ''}
${head.canonical === null ? '' : `<link rel="canonical" href="${head.canonical ?? url}"/>`}
<link hrefLang="pl" rel="alternate" href="${ORIGIN}/"/>
<link rel="alternate" hrefLang="uk" href="${ORIGIN}/uk"/>
<link rel="alternate" hrefLang="x-default" href="${ORIGIN}/"/>
<meta property="og:title" content="Biuro rachunkowe"/>
<meta property="og:description" content="${DESC}"/>
<meta property="og:url" content="${url}"/>
<meta property="og:image" content="${ORIGIN}/opengraph-image-35ziip"/>
<meta name="twitter:card" content="summary_large_image"/>
${jsonLd.map((d) => `<script type="application/ld+json">${typeof d === 'string' ? d : JSON.stringify(d)}</script>`).join('\n')}
</head><body><svg><title>TEWU logo</title></svg>${body.html ?? '<h1>Księgowość</h1><h2>Usługi</h2><img src="/a.png" alt=""/>'}</body></html>`;
  return { url, status: 200, headers: {}, html };
}
