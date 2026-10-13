#!/usr/bin/env node
// Checks a running build against the SEO fixes: pnpm seo:check [baseUrl]
// Exit code 1 when any check reports an error; warnings do not fail the run.
import http from 'node:http';
import { SITE_ORIGIN, WWW_REDIRECT_PATH, evaluatePage, evaluateSite, parseDocument, parseSitemapUrls } from './seo-check-lib.mjs';

const baseUrl = (process.argv[2] ?? 'http://127.0.0.1:3000').replace(/\/+$/, '');
const CONCURRENCY = 6;

/**
 * Every request pretends to come from the production host unless a check says otherwise.
 * node:http instead of fetch: fetch (undici) silently drops a custom Host header.
 */
function get(path, { host = 'tewu.szczecin.pl', binary = false } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.get(new URL(path, baseUrl), { headers: { host } }, (res) => {
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

// The sitemap and og:image carry the production origin; requests go to baseUrl with the same path.
const toPath = (url) => url.slice(SITE_ORIGIN.length) || '/';

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

function report(label, findings) {
  const icon = findings.some((f) => f.level === 'error') ? 'FAIL' : findings.length ? 'WARN' : 'OK  ';
  console.info(`${icon} ${label}`);
  for (const f of findings) console.info(`       ${f.level === 'error' ? 'error  ' : 'warning'} [${f.check}] ${f.message}`);
}

async function main() {
  console.info(`seo:check against ${baseUrl} (Host: tewu.szczecin.pl)\n`);

  const sitemap = await get('/sitemap.xml');
  if (sitemap.status !== 200) {
    console.error(`/sitemap.xml returned HTTP ${sitemap.status}`);
    process.exit(1);
  }
  const urls = parseSitemapUrls(sitemap.text);
  console.info(`sitemap.xml lists ${urls.length} URLs\n`);

  let errorCount = 0;
  let warningCount = 0;
  const count = (findings) => {
    errorCount += findings.filter((f) => f.level === 'error').length;
    warningCount += findings.filter((f) => f.level === 'warning').length;
  };

  const pages = await mapLimit(urls, CONCURRENCY, async (url) => {
    const response = await get(toPath(url));
    return { url, findings: evaluatePage({ url, status: response.status, headers: response.headers, html: response.text }) };
  });
  for (const { url, findings } of pages) {
    count(findings);
    report(url, findings);
  }

  console.info('\nsite checks');
  const home = await get('/');
  const ogImageUrl = parseDocument(home.text).metas.find((m) => m.property === 'og:image')?.content ?? '';
  const [robots, previewHost, wwwRedirect, notFound, ogImage] = await Promise.all([
    get('/robots.txt'),
    get('/', { host: 'example.test' }),
    get(WWW_REDIRECT_PATH, { host: 'www.tewu.szczecin.pl' }),
    get('/nie-istnieje-seo-check'),
    ogImageUrl.startsWith(SITE_ORIGIN) ? get(toPath(ogImageUrl), { binary: true }) : { status: 0, headers: {} },
  ]);
  const site = evaluateSite({
    robots: { status: robots.status, body: robots.text },
    previewHost,
    wwwRedirect,
    notFound: { status: notFound.status, html: notFound.text },
    ogImage,
  });
  count(site);
  report('robots.txt, preview noindex, www redirect, 404, og:image file', site);

  console.info(`\n${urls.length} pages, ${errorCount} errors, ${warningCount} warnings`);
  process.exit(errorCount > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
