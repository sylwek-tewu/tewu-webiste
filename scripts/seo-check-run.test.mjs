import http from 'node:http';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { WWW_REDIRECT_PATH } from './seo-check-lib.mjs';
import { runSeoCheck } from './seo-check-run.mjs';
import { ORIGIN, page } from './seo-check-fixtures.mjs';

const PROD_HOST = 'tewu.szczecin.pl';

// A fake site on a local port that records the Host header of every request.
const state = { pages: new Set(), sitemap: [], broken: new Set(), requests: [], redirectUkImage: false };
let server;
let baseUrl;

beforeAll(async () => {
  server = http.createServer((req, res) => {
    const host = req.headers.host;
    const path = req.url;
    state.requests.push({ host, path, acceptLanguage: req.headers['accept-language'] });
    if (state.broken.has(path)) return req.socket.destroy();
    if (path === '/sitemap.xml') {
      res.writeHead(200, { 'content-type': 'application/xml' });
      return res.end(`<urlset>${state.sitemap.map((u) => `<url><loc>${u}</loc></url>`).join('')}</urlset>`);
    }
    if (path === '/robots.txt') return res.end(`User-Agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`);
    if (path === WWW_REDIRECT_PATH) {
      res.writeHead(host === `www.${PROD_HOST}` ? 308 : 200, { location: `${ORIGIN}${WWW_REDIRECT_PATH}` });
      return res.end();
    }
    if (path === '/opengraph-image-35ziip') {
      // Like src/proxy.ts before the fix: a Ukrainian browser was sent to a missing /uk copy
      if (state.redirectUkImage && req.headers['accept-language']?.startsWith('uk')) {
        res.writeHead(307, { location: `${ORIGIN}/uk/opengraph-image-35ziip` });
        return res.end();
      }
      res.writeHead(200, { 'content-type': 'image/png' });
      return res.end('png');
    }
    // Like next.config.mjs: only the production host is indexable
    const headers = host === PROD_HOST ? { 'content-type': 'text/html' } : { 'content-type': 'text/html', 'x-robots-tag': 'noindex, nofollow' };
    if (state.pages.has(path)) {
      res.writeHead(200, headers);
      return res.end(page({ path }).html);
    }
    res.writeHead(404, headers);
    res.end('<html><head><title>404</title><meta name="robots" content="noindex"/></head><body></body></html>');
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
});

beforeEach(() => {
  state.pages = new Set(['/', '/o-nas']);
  state.sitemap = [`${ORIGIN}/`, `${ORIGIN}/o-nas`];
  state.broken = new Set();
  state.requests = [];
  state.redirectUkImage = false;
});

const errorsOf = (result) => result.results.flatMap((r) => r.findings).filter((f) => f.level === 'error');

describe('runSeoCheck', () => {
  it('passes on a healthy site', async () => {
    const result = await runSeoCheck(baseUrl);
    expect(result.urlCount).toBe(2);
    expect(errorsOf(result)).toEqual([]);
  });

  it('sends the right Host header with every request and does not follow the www redirect', async () => {
    await runSeoCheck(baseUrl);
    const hostsOf = (path) => state.requests.filter((r) => r.path === path).map((r) => r.host);

    expect(hostsOf('/sitemap.xml')).toEqual([PROD_HOST]);
    expect(hostsOf('/robots.txt')).toEqual([PROD_HOST]);
    expect(hostsOf('/nie-istnieje-seo-check')).toEqual([PROD_HOST]);
    expect(hostsOf('/o-nas')).toEqual([PROD_HOST]);
    expect(hostsOf('/opengraph-image-35ziip')).toEqual([PROD_HOST]);
    // "/" is fetched as a page, for the og:image, and once as the preview host
    expect([...hostsOf('/')].sort()).toEqual(['example.test', PROD_HOST, PROD_HOST]);
    // 308 is returned as it is: a single request, no second one to the Location
    expect(hostsOf(WWW_REDIRECT_PATH)).toEqual([`www.${PROD_HOST}`]);
  });

  it('requests the share image as a Ukrainian browser, so a language redirect on it is caught', async () => {
    await runSeoCheck(baseUrl);
    const probes = state.requests.filter((r) => r.path === '/opengraph-image-35ziip');
    expect(probes.map((r) => r.acceptLanguage)).toEqual(['uk']);
  });

  it('reports a share image that the language redirect sends away', async () => {
    state.redirectUkImage = true;
    const result = await runSeoCheck(baseUrl);
    expect(errorsOf(result).map((f) => f.check)).toContain('og:image-file');
  });

  it('reports an empty sitemap as an error', async () => {
    state.sitemap = [];
    const result = await runSeoCheck(baseUrl);
    expect(result.urlCount).toBe(0);
    expect(errorsOf(result).map((f) => f.check)).toContain('sitemap');
  });

  it('reports a sitemap that is not served as an error', async () => {
    state.broken.add('/sitemap.xml');
    const result = await runSeoCheck(baseUrl);
    expect(errorsOf(result).map((f) => f.check)).toContain('sitemap');
  });

  it('reports a sitemap URL on a foreign origin without requesting it', async () => {
    state.sitemap = [`${ORIGIN}/`, 'https://tewu.szczecin.pl.example.test/o-nas'];
    const result = await runSeoCheck(baseUrl);
    expect(errorsOf(result).map((f) => f.check)).toEqual(['sitemap']);
    expect(state.requests.filter((r) => r.path === '/o-nas')).toEqual([]);
  });

  it('turns a network error on one page into a finding and still checks the other pages', async () => {
    state.broken.add('/o-nas');
    const result = await runSeoCheck(baseUrl);
    const broken = result.results.find((r) => r.label === `${ORIGIN}/o-nas`);
    expect(broken.findings.map((f) => f.check)).toEqual(['request']);
    expect(result.results.find((r) => r.label === `${ORIGIN}/`).findings).toEqual([]);
    expect(result.results.at(-1).findings).toEqual([]);
  });
});
