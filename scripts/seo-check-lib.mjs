// Pure functions behind scripts/seo-check.mjs: HTML is parsed with regular expressions (Node
// built-ins only) and every evaluate* function returns findings: { level, check, message }.

export const SITE_ORIGIN = 'https://tewu.szczecin.pl';
export const FIRM_ID = `${SITE_ORIGIN}/#firma`;
export const WWW_REDIRECT_PATH = '/uslugi/kpir?utm_source=check';

// Global Constraints: "doradztwo podatkowe" / "податкове консультування" / "податкові консультації",
// in any inflection and word order.
export const FORBIDDEN_PHRASES = [
  /doradztw\p{L}*\s+podatkow/iu,
  /podatkow\p{L}*\s+doradztw/iu,
  /податков\p{L}*\s+консульт/iu,
  /консульт\p{L}*\s+податков/iu,
];

const FORBIDDEN_JSON_LD_TYPES = ['AggregateRating', 'Review'];
const SERVICE_PAGE = /^\/(?:uk\/)?uslugi\/[^/]+\/?$/;
const SERVICE_PAGE_TYPES = ['Service', 'BreadcrumbList', 'FAQPage'];

const NAMED_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

export function decodeEntities(text) {
  return text.replace(/&(?:#x([0-9a-f]+)|#(\d+)|([a-z]+));/gi, (match, hex, dec, name) => {
    if (hex) return String.fromCodePoint(parseInt(hex, 16));
    if (dec) return String.fromCodePoint(parseInt(dec, 10));
    return NAMED_ENTITIES[name.toLowerCase()] ?? match;
  });
}

/** Attributes of one start tag, names lower-cased, whatever their order or quote style. */
export function parseAttributes(tag) {
  const attributes = {};
  const body = tag.replace(/^<\s*[^\s/>]+/, '').replace(/\/?>$/, '');
  const pattern = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  for (const match of body.matchAll(pattern)) {
    attributes[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? '');
  }
  return attributes;
}

export function parseSitemapUrls(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) => decodeEntities(m[1]));
}

// A start tag whose quoted attribute values may contain ">".
const startTags = (name) => new RegExp(`<${name}\\b(?:[^>"']|"[^"]*"|'[^']*')*>`, 'gi');

const stripTags = (html) => decodeEntities(html.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();

export function parseDocument(html) {
  const jsonLd = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter((m) => parseAttributes(`<script ${m[1]}>`).type === 'application/ld+json')
    .map((m) => m[2]);

  const headMatch = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i);
  const head = headMatch ? headMatch[1] : '';
  const body = (headMatch ? html.slice(headMatch.index + headMatch[0].length) : html)
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '');
  const headNoScripts = head.replace(/<script\b[\s\S]*?<\/script>/gi, '');

  return {
    hasHead: Boolean(headMatch),
    titles: [...headNoScripts.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map((m) => stripTags(m[1])),
    metas: (headNoScripts.match(startTags('meta')) ?? []).map(parseAttributes),
    links: (headNoScripts.match(startTags('link')) ?? []).map(parseAttributes),
    headings: [...body.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => ({ level: Number(m[1]), text: stripTags(m[2]) })),
    images: (body.match(startTags('img')) ?? []).map(parseAttributes),
    jsonLd,
  };
}

/** Every object inside parsed JSON-LD: top level, @graph members and anything nested. */
function* jsonLdNodes(data) {
  if (Array.isArray(data)) {
    for (const item of data) yield* jsonLdNodes(item);
  } else if (data && typeof data === 'object') {
    yield data;
    for (const value of Object.values(data)) yield* jsonLdNodes(value);
  }
}

export function collectJsonLdTypes(documents) {
  const types = new Set();
  for (const node of jsonLdNodes(documents)) {
    for (const type of [node['@type']].flat()) if (typeof type === 'string') types.add(type);
  }
  return types;
}

// https://tewu.szczecin.pl and https://tewu.szczecin.pl/ are the same URL; Next.js emits the former.
const sameUrl = (a, b) => {
  try {
    return new URL(a).href === new URL(b).href;
  } catch {
    return a === b;
  }
};

const finding = (level, check, message) => ({ level, check, message });
const error = (check, message) => finding('error', check, message);
const warning = (check, message) => finding('warning', check, message);

const isAbsoluteSiteUrl = (value) => value === SITE_ORIGIN || value?.startsWith(`${SITE_ORIGIN}/`);
const hasNoindex = (value) => /\bnoindex\b/i.test(value ?? '');
const metaContent = (metas, key, value) => metas.filter((m) => m[key] === value).map((m) => m.content ?? '');

/**
 * @param {{ url: string, status: number, headers: Record<string, string>, html: string }} page
 *   url is the sitemap URL (https://tewu.szczecin.pl/...), headers have lower-case names
 */
export function evaluatePage({ url, status, headers, html }) {
  const findings = [];
  const doc = parseDocument(html);
  const pathname = new URL(url).pathname;

  if (status !== 200) findings.push(error('status', `HTTP ${status}, expected 200`));
  if (headers['x-robots-tag'] !== undefined) findings.push(error('noindex', `X-Robots-Tag: ${headers['x-robots-tag']}`));
  if (doc.metas.some((m) => m.name?.toLowerCase() === 'robots' && hasNoindex(m.content))) {
    findings.push(error('noindex', '<meta name="robots"> contains noindex'));
  }

  if (doc.titles.length !== 1) {
    findings.push(error('title', `${doc.titles.length} <title> elements in <head>, expected 1`));
  } else if (doc.titles[0].length === 0) {
    findings.push(error('title', 'empty <title>'));
  } else if (doc.titles[0].length > 60) {
    findings.push(warning('title', `title is ${doc.titles[0].length} characters (max 60): ${doc.titles[0]}`));
  }

  const descriptions = metaContent(doc.metas, 'name', 'description');
  if (descriptions.length !== 1) {
    findings.push(error('description', `${descriptions.length} meta descriptions, expected 1`));
  } else if (descriptions[0].length < 120 || descriptions[0].length > 160) {
    findings.push(warning('description', `description is ${descriptions[0].length} characters (120-160): ${descriptions[0]}`));
  }

  const canonicals = doc.links.filter((l) => l.rel?.toLowerCase().split(/\s+/).includes('canonical'));
  if (canonicals.length !== 1) {
    findings.push(error('canonical', `${canonicals.length} canonical links, expected 1`));
  } else if (!sameUrl(canonicals[0].href, url)) {
    findings.push(error('canonical', `canonical ${canonicals[0].href} differs from the sitemap URL ${url}`));
  }
  // With zero or several canonicals the error above is already reported; og:url is then compared to the sitemap URL.
  const canonical = canonicals.length === 1 ? canonicals[0].href : url;

  const alternates = doc.links.filter((l) => l.rel?.toLowerCase().split(/\s+/).includes('alternate') && l.hreflang);
  for (const lang of ['pl', 'uk', 'x-default']) {
    const link = alternates.find((l) => l.hreflang.toLowerCase() === lang);
    if (!link) findings.push(error('hreflang', `hreflang="${lang}" alternate is missing`));
    else if (!isAbsoluteSiteUrl(link.href)) findings.push(error('hreflang', `hreflang="${lang}" href is not an absolute ${SITE_ORIGIN} URL: ${link.href}`));
  }

  const h1Count = doc.headings.filter((h) => h.level === 1).length;
  if (h1Count !== 1) findings.push(error('h1', `${h1Count} <h1> elements, expected 1`));

  for (const key of ['og:title', 'og:description']) {
    if (!metaContent(doc.metas, 'property', key).some(Boolean)) findings.push(error(key, `${key} is missing`));
  }
  const ogUrl = metaContent(doc.metas, 'property', 'og:url');
  if (ogUrl.length !== 1) findings.push(error('og:url', `${ogUrl.length} og:url tags, expected 1`));
  else if (!sameUrl(ogUrl[0], canonical)) findings.push(error('og:url', `og:url ${ogUrl[0]} differs from the canonical ${canonical}`));
  const ogImage = metaContent(doc.metas, 'property', 'og:image');
  if (ogImage.length === 0) findings.push(error('og:image', 'og:image is missing'));
  else if (!/^https?:\/\//.test(ogImage[0])) findings.push(error('og:image', `og:image is not absolute: ${ogImage[0]}`));
  if (!metaContent(doc.metas, 'name', 'twitter:card').some(Boolean)) findings.push(error('twitter:card', 'twitter:card is missing'));

  const parsedJsonLd = [];
  doc.jsonLd.forEach((raw, index) => {
    try {
      parsedJsonLd.push(JSON.parse(raw));
    } catch (e) {
      findings.push(error('json-ld', `JSON-LD block ${index + 1} does not parse: ${e.message}`));
    }
  });
  const types = collectJsonLdTypes(parsedJsonLd);
  const hasFirm = [...jsonLdNodes(parsedJsonLd)].some((n) => n['@id'] === FIRM_ID && [n['@type']].flat().includes('AccountingService'));
  if (!hasFirm) findings.push(error('json-ld', `AccountingService with @id ${FIRM_ID} is missing`));
  if (SERVICE_PAGE.test(pathname)) {
    const missing = SERVICE_PAGE_TYPES.filter((t) => !types.has(t));
    if (missing.length) findings.push(error('json-ld', `service page lacks JSON-LD types: ${missing.join(', ')}`));
  }
  for (const type of FORBIDDEN_JSON_LD_TYPES) {
    if (types.has(type)) findings.push(error('json-ld', `JSON-LD contains forbidden type ${type}`));
  }

  const texts = [
    ['title', doc.titles.join(' ')],
    ['description', descriptions.join(' ')],
    ...doc.metas.filter((m) => m.property?.startsWith('og:')).map((m) => [m.property, m.content ?? '']),
    ...doc.headings.map((h) => [`h${h.level}`, h.text]),
    ...parsedJsonLd.map((d) => ['json-ld', JSON.stringify(d)]),
  ];
  for (const [where, text] of texts) {
    const hit = FORBIDDEN_PHRASES.map((p) => text.match(p)).find(Boolean);
    if (hit) findings.push(error('forbidden-phrase', `"${hit[0]}" in ${where}`));
  }

  for (const img of doc.images) {
    if (img.alt === undefined) findings.push(error('img-alt', `<img> without alt attribute: ${img.src ?? '(no src)'}`));
  }

  doc.headings.forEach((heading, i) => {
    const previous = doc.headings[i - 1];
    if (previous && heading.level > previous.level + 1) {
      findings.push(warning('heading-order', `<h${previous.level}> followed by <h${heading.level}>: ${heading.text}`));
    }
  });

  return findings;
}

/**
 * Site-wide checks from already fetched responses (headers lower-case).
 * @param {{
 *   robots: { status: number, body: string },
 *   previewHost: { status: number, headers: Record<string, string> },
 *   wwwRedirect: { status: number, headers: Record<string, string> },
 *   notFound: { status: number, html: string },
 *   ogImage: { status: number, headers: Record<string, string> },
 * }} responses
 */
export function evaluateSite({ robots, previewHost, wwwRedirect, notFound, ogImage }) {
  const findings = [];

  if (robots.status !== 200) findings.push(error('robots.txt', `/robots.txt returned HTTP ${robots.status}`));
  else if (!robots.body.includes(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`)) {
    findings.push(error('robots.txt', `/robots.txt lacks "Sitemap: ${SITE_ORIGIN}/sitemap.xml"`));
  }

  if (!hasNoindex(previewHost.headers['x-robots-tag'])) {
    findings.push(error('preview-noindex', `Host: example.test has X-Robots-Tag "${previewHost.headers['x-robots-tag'] ?? ''}", expected noindex`));
  }

  if (wwwRedirect.status !== 308) findings.push(error('www-redirect', `www redirect is HTTP ${wwwRedirect.status}, expected 308`));
  const expectedLocation = SITE_ORIGIN + WWW_REDIRECT_PATH;
  if (wwwRedirect.headers.location !== expectedLocation) {
    findings.push(error('www-redirect', `www redirect Location is "${wwwRedirect.headers.location ?? ''}", expected ${expectedLocation}`));
  }

  if (notFound.status !== 404) findings.push(error('404', `unknown URL returned HTTP ${notFound.status}, expected 404`));
  const noindexMetas = parseDocument(notFound.html).metas.filter((m) => m.name?.toLowerCase() === 'robots' && hasNoindex(m.content));
  if (noindexMetas.length !== 1) findings.push(error('404', `404 page has ${noindexMetas.length} robots noindex metas, expected 1`));

  if (ogImage.status !== 200) findings.push(error('og:image-file', `og:image returned HTTP ${ogImage.status}, expected 200`));
  if (!/^image\/png\b/i.test(ogImage.headers['content-type'] ?? '')) {
    findings.push(error('og:image-file', `og:image Content-Type is "${ogImage.headers['content-type'] ?? ''}", expected image/png`));
  }

  return findings;
}
