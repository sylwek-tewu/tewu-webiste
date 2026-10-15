// Fetches the site and runs the checks of seo-check-lib.mjs. Kept apart from the CLI so that the
// Host routing and the no-redirect behaviour can be tested against a local server.
import http from 'node:http';
import { SITE_ORIGIN, WWW_REDIRECT_PATH, evaluatePage, evaluateSite, parseDocument, parseSitemapUrls } from './seo-check-lib.mjs';

const CONCURRENCY = 6;
const PROD_HOST = new URL(SITE_ORIGIN).host;

/**
 * GET without following redirects. node:http instead of fetch: fetch (undici) silently drops a
 * custom Host header. Rejects on network errors.
 */
export function httpGet(baseUrl, path, { host = PROD_HOST, binary = false, acceptLanguage } = {}) {
  return new Promise((resolve, reject) => {
    const headers = acceptLanguage ? { host, 'accept-language': acceptLanguage } : { host };
    const req = http.get(new URL(path, baseUrl), { headers }, (res) => {
      const done = (text) => resolve({ status: res.statusCode, headers: res.headers, text });
      if (binary) {
        // Only the status and headers of an image matter.
        res.destroy();
        done('');
        return;
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => done(Buffer.concat(chunks).toString('utf8')));
      res.on('error', reject);
    });
    req.on('error', reject);
  });
}

const requestError = (e) => ({ level: 'error', check: 'request', message: `request failed: ${e.message || e.code || e}` });
const sitemapError = (message) => ({ level: 'error', check: 'sitemap', message });

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await fn(items[i]);
      }
    }),
  );
  return results;
}

/** A failed request becomes a response with status 0 plus an error finding, so one failure never aborts the run. */
async function safeGet(failures, baseUrl, path, options) {
  try {
    return await httpGet(baseUrl, path, options);
  } catch (e) {
    failures.push(requestError(e));
    return { status: 0, headers: {}, text: '' };
  }
}

const isSiteUrl = (url) => url === SITE_ORIGIN || url.startsWith(`${SITE_ORIGIN}/`);
const toPath = (url) => url.slice(SITE_ORIGIN.length) || '/';

/**
 * @returns {Promise<{ urlCount: number, results: { label: string, findings: object[] }[] }>}
 *   one result per sitemap URL (and per sitemap problem), the last one holds the site checks
 */
export async function runSeoCheck(baseUrl) {
  const results = [];

  let urls = [];
  try {
    const sitemap = await httpGet(baseUrl, '/sitemap.xml');
    if (sitemap.status !== 200) results.push({ label: '/sitemap.xml', findings: [sitemapError(`/sitemap.xml returned HTTP ${sitemap.status}`)] });
    else urls = parseSitemapUrls(sitemap.text);
  } catch (e) {
    results.push({ label: '/sitemap.xml', findings: [sitemapError(`/sitemap.xml request failed: ${e.message || e.code || e}`)] });
  }
  if (urls.length === 0 && results.length === 0) {
    results.push({ label: '/sitemap.xml', findings: [sitemapError('sitemap.xml lists no URLs')] });
  }

  const pageResults = await mapLimit(urls, CONCURRENCY, async (url) => {
    if (!isSiteUrl(url)) return { label: url, findings: [sitemapError(`sitemap URL is not on ${SITE_ORIGIN}`)] };
    try {
      const response = await httpGet(baseUrl, toPath(url));
      return { label: url, findings: evaluatePage({ url, status: response.status, headers: response.headers, html: response.text }) };
    } catch (e) {
      return { label: url, findings: [requestError(e)] };
    }
  });
  results.push(...pageResults);

  const failures = [];
  const get = (path, options) => safeGet(failures, baseUrl, path, options);
  const home = await get('/');
  // The share image is fetched as a Ukrainian browser: the language redirect must not touch it.
  const ogImageUrl = parseDocument(home.text).metas.find((m) => m.property === 'og:image')?.content ?? '';
  const [robots, llms, previewHost, wwwRedirect, notFound, ogImage] = await Promise.all([
    get('/robots.txt'),
    get('/llms.txt'),
    get('/', { host: 'example.test' }),
    get(WWW_REDIRECT_PATH, { host: `www.${PROD_HOST}` }),
    get('/nie-istnieje-seo-check'),
    isSiteUrl(ogImageUrl) ? get(toPath(ogImageUrl), { binary: true, acceptLanguage: 'uk' }) : { status: 0, headers: {}, text: '' },
  ]);
  results.push({
    label: 'site checks (robots.txt, llms.txt, preview noindex, www redirect, 404, og:image file)',
    findings: [
      ...failures,
      ...evaluateSite({
        robots: { status: robots.status, body: robots.text },
        previewHost,
        wwwRedirect,
        notFound: { status: notFound.status, html: notFound.text },
        ogImage,
        llms: { status: llms.status, headers: llms.headers, body: llms.text },
      }),
    ],
  });

  return { urlCount: urls.length, results };
}
