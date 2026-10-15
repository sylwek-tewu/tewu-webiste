import { describe, it, expect, vi } from 'vitest';
import type { Metadata } from 'next';
import { SERVICE_PAGE_SLUGS, servicePagePath } from '@/lib/service-pages';
import { buildServicePageMetadata } from '@/content/service-pages';
import type { Locale } from '@/i18n/types';
import { metadata as plLayout } from './(pl)/layout';
import { metadata as ukLayout } from './(uk)/layout';
import { metadata as plHome } from './(pl)/page';
import { metadata as plAbout } from './(pl)/o-nas/page';
import { metadata as plServices } from './(pl)/uslugi/page';
import { metadata as plOutsourcing } from './(pl)/outsourcing/page';
import { metadata as plCertificates } from './(pl)/certyfikaty/page';
import { metadata as plContact } from './(pl)/kontakt/page';
import { metadata as plPrivacy } from './(pl)/polityka-prywatnosci/page';
import { metadata as ukHome } from './(uk)/uk/page';
import { metadata as ukAbout } from './(uk)/uk/o-nas/page';
import { metadata as ukServices } from './(uk)/uk/uslugi/page';
import { metadata as ukOutsourcing } from './(uk)/uk/outsourcing/page';
import { metadata as ukCertificates } from './(uk)/uk/certyfikaty/page';
import { metadata as ukContact } from './(uk)/uk/kontakt/page';
import { metadata as ukPrivacy } from './(uk)/uk/polityka-prywatnosci/page';
import { metadata as plFaq } from './(pl)/faq/page';
import { metadata as ukFaq } from './(uk)/uk/faq/page';

// SiteLayout loads next/font, which needs the Next.js compiler; the layouts are only read for their metadata.
vi.mock('@/components/layout/SiteLayout', () => ({ default: () => null }));

// The pages import client components that need the router.
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
}));

interface PageCase {
  locale: Locale;
  /** Polish path of the page. */
  path: string;
  metadata: Metadata;
  /** Exact texts this task sets; absent for texts that stay as they were. */
  title?: string;
  description?: string;
}

const PL_HOME: PageCase = { locale: 'pl', path: '/', metadata: plHome, title: 'Biuro rachunkowe Szczecin – księgowość, kadry i płace | TEWU', description: 'Biuro rachunkowe w Szczecinie: pełna księgowość spółek, KPiR, ryczałt, kadry i płace, KSeF. Ponad 25 lat na rynku. Bezpłatna wycena – oddzwonimy.' };
const UK_HOME: PageCase = { locale: 'uk', path: '/', metadata: ukHome, title: 'Бухгалтерське бюро в Щецині – облік, кадри, зарплата | TEWU', description: 'Бухгалтерське бюро в Щецині: повна бухгалтерія компаній, KPiR, ryczałt, кадри та зарплата, KSeF. Понад 25 років на ринку. Безкоштовна оцінка.' };

function servicePageCase(locale: Locale, slug: (typeof SERVICE_PAGE_SLUGS)[number]): PageCase {
  const base = { locale, path: servicePagePath('pl', slug), metadata: buildServicePageMetadata(locale, slug) };
  if (slug === 'kpir') {
    return { ...base, title: locale === 'pl' ? 'Księga przychodów i rozchodów (KPiR) Szczecin – TEWU' : 'Книга доходів і витрат (KPiR) у Щецині – TEWU' };
  }
  if (slug === 'inkubator-spolek') {
    return locale === 'pl'
      ? { ...base, title: 'Założenie spółki z o.o. w Szczecinie – Inkubator spółek TEWU', description: 'Zakładasz spółkę z o.o. w Szczecinie albo przekształcasz JDG? Doradzimy, założymy spółkę z notariuszem i zapewnimy adres siedziby. Bezpłatna wycena.' }
      : { ...base, title: 'Реєстрація Sp. z o.o. у Щецині – TEWU', description: 'Відкриваєте Sp. z o.o. у Щецині або перетворюєте JDG? Проконсультуємо, зареєструємо компанію з нотаріусом і надамо юридичну адресу. Безкоштовна оцінка.' };
  }
  return base;
}

const pages: PageCase[] = [
  PL_HOME,
  { locale: 'pl', path: '/o-nas', metadata: plAbout, title: 'O nas – biuro rachunkowe w Szczecinie od ponad 25 lat | TEWU', description: 'Biuro Rachunkowe TEWU w Szczecinie: ponad 25 lat na rynku, uprawnienia Ministerstwa Finansów i bezpośredni kontakt z szefostwem biura. Poznaj nas.' },
  { locale: 'pl', path: '/uslugi', metadata: plServices, title: 'Usługi księgowe i kadrowe w Szczecinie – Biuro TEWU', description: 'Usługi biura rachunkowego TEWU w Szczecinie: pełna księgowość, KPiR, ryczałt, kadry i płace, KSeF oraz zakładanie spółek z o.o. Bezpłatna wycena.' },
  { locale: 'pl', path: '/outsourcing', metadata: plOutsourcing, title: 'Outsourcing księgowości i back-office w Szczecinie – TEWU', description: 'Zredukuj koszty operacyjne i skup się na rozwoju. Outsourcing księgowy i procesów back-office w Biurze Rachunkowym TEWU w Szczecinie. Bezpłatna wycena.' },
  { locale: 'pl', path: '/certyfikaty', metadata: plCertificates, title: 'Certyfikaty księgowe – Biuro Rachunkowe TEWU w Szczecinie' },
  { locale: 'pl', path: '/kontakt', metadata: plContact, title: 'Kontakt i dojazd – Biuro Rachunkowe TEWU w Szczecinie', description: 'Biuro Rachunkowe TEWU, Al. Powstańców Wielkopolskich 78A LU2, Szczecin. Telefon 602 235 736, e-mail, godziny otwarcia (pn–pt 8–16) i mapa dojazdu.' },
  { locale: 'pl', path: '/faq', metadata: plFaq, title: 'FAQ – pytania o księgowość, podatki i ZUS | TEWU Szczecin', description: 'Biuro rachunkowe TEWU ze Szczecina odpowiada na częste pytania: JDG czy spółka, forma opodatkowania, zwolnienie z VAT, ulgi w ZUS, rachunek firmowy, KSeF.' },
  { locale: 'pl', path: '/polityka-prywatnosci', metadata: plPrivacy },
  UK_HOME,
  { locale: 'uk', path: '/o-nas', metadata: ukAbout, title: 'Про нас – бухгалтерське бюро в Щецині понад 25 років | TEWU', description: 'Biuro Rachunkowe TEWU у Щецині: понад 25 років на ринку, уповноваження Міністерства фінансів і прямий контакт з керівництвом бюро. Познайомтеся з нами.' },
  { locale: 'uk', path: '/uslugi', metadata: ukServices, title: 'Бухгалтерські та кадрові послуги в Щецині – Бюро TEWU', description: 'Послуги бухгалтерського бюро TEWU у Щецині: повна бухгалтерія, KPiR, ryczałt, кадри та зарплата, KSeF, а також реєстрація Sp. z o.o. Безкоштовна оцінка.' },
  { locale: 'uk', path: '/outsourcing', metadata: ukOutsourcing, title: 'Аутсорсинг бухгалтерії та бек-офісу в Щецині – TEWU', description: 'Знизьте операційні витрати й зосередьтеся на розвитку. Аутсорсинг бухгалтерії та процесів бек-офісу в бюро TEWU у Щецині. Безкоштовна оцінка.' },
  { locale: 'uk', path: '/certyfikaty', metadata: ukCertificates, title: 'Бухгалтерські сертифікати – Бюро TEWU у Щецині' },
  { locale: 'uk', path: '/kontakt', metadata: ukContact, title: 'Контакти та як доїхати – Бюро TEWU у Щецині', description: 'Biuro Rachunkowe TEWU, Al. Powstańców Wielkopolskich 78A LU2, Щецин. Телефон 602 235 736, e-mail, години роботи (пн–пт 8–16) і карта доїзду.' },
  { locale: 'uk', path: '/faq', metadata: ukFaq, title: 'FAQ – питання про бухгалтерію, податки та ZUS | TEWU Щецин', description: 'Бухгалтерське бюро TEWU у Щецині відповідає на поширені запитання: JDG чи Sp. z o.o., форма оподаткування, звільнення від VAT, пільги ZUS, рахунок, KSeF.' },
  { locale: 'uk', path: '/polityka-prywatnosci', metadata: ukPrivacy },
  ...(['pl', 'uk'] as const).flatMap((locale) => SERVICE_PAGE_SLUGS.map((slug) => servicePageCase(locale, slug))),
];

// Global constraint: the office does not advertise tax advice (any inflection, both languages).
const FORBIDDEN = /doradztw\w*\s+podatkow|податков\w*\s+консультуванн|податков\w*\s+консультаці/i;

const localizedPath = (locale: Locale, path: string) => (locale === 'uk' ? (path === '/' ? '/uk' : `/uk${path}`) : path);

describe('page metadata', () => {
  it.each(pages.map((page) => [`${page.locale} ${page.path}`, page] as const))('%s', (_, page) => {
    const { metadata, locale, path } = page;
    const title = String(metadata.title);
    const description = String(metadata.description);
    const canonical = localizedPath(locale, path);

    expect(title.length).toBeLessThanOrEqual(60);
    expect(description.length).toBeLessThanOrEqual(160);
    // Descriptions this task wrote; the texts left as they were may be shorter
    if (page.description) expect(description.length).toBeGreaterThanOrEqual(120);
    if (page.title) expect(title).toBe(page.title);
    if (page.description) expect(description).toBe(page.description);
    expect(`${title} ${description}`).not.toMatch(FORBIDDEN);

    expect(metadata.alternates).toEqual({
      canonical,
      languages: { pl: path, uk: localizedPath('uk', path), 'x-default': path },
    });
    expect(metadata.openGraph).toMatchObject({
      type: 'website',
      url: canonical,
      siteName: 'Biuro Rachunkowe TEWU',
      locale: locale === 'uk' ? 'uk_UA' : 'pl_PL',
      alternateLocale: locale === 'uk' ? 'pl_PL' : 'uk_UA',
      title,
      description,
    });
    expect(metadata.twitter).toMatchObject({ card: 'summary_large_image', title, description });
  });

  it.each([
    ['pl', plLayout, PL_HOME],
    ['uk', ukLayout, UK_HOME],
  ] as const)('the %s layout defaults to the home page texts and keeps metadataBase', (_, layout, home) => {
    expect(layout.title).toBe(home.title);
    expect(layout.description).toBe(home.description);
    expect(layout.metadataBase).toBeInstanceOf(URL);
  });
});
