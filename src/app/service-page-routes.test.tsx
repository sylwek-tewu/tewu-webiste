import { describe, it, expect, vi } from 'vitest';
import { SERVICE_PAGE_SLUGS } from '@/lib/service-pages';
import { buildServicePageMetadata, getServicePageContent } from '@/content/service-pages';
import * as plRoute from './(pl)/uslugi/[slug]/page';
import * as ukRoute from './(uk)/uk/uslugi/[slug]/page';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
}));

const params = (slug: string) => ({ params: Promise.resolve({ slug }) });

describe.each([
  ['pl', plRoute],
  ['uk', ukRoute],
] as const)('service page route (%s)', (locale, route) => {
  it('pre-renders every landing page and nothing else', () => {
    expect(route.generateStaticParams()).toEqual(SERVICE_PAGE_SLUGS.map((slug) => ({ slug })));
    expect(route.dynamicParams).toBe(false);
  });

  it('passes the page copy in its language to the landing page', async () => {
    const element = await route.default(params('kpir'));
    expect(element.props.content).toBe(getServicePageContent(locale, 'kpir'));
  });

  it('answers an unknown slug with 404', async () => {
    await expect(route.default(params('nieistnieje'))).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('sets the page metadata', async () => {
    expect(await route.generateMetadata(params('ksef'))).toEqual(buildServicePageMetadata(locale, 'ksef'));
  });
});
