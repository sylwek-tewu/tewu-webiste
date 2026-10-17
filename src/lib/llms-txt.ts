import { SITE_URL } from '@/constants';
import { localizePath } from '@/i18n/config';
import { FAQ_UPDATED_AT } from '@/content/faq';
import { COMPANY } from '@/lib/company';
import { formatLongDate } from '@/lib/format-date';
import { PATHS } from '@/lib/paths';
import { SERVICE_PAGES, servicePageSlugOfPath } from '@/lib/service-pages';
import { PAGE_PATHS } from '@/lib/site-pages';

/**
 * /llms.txt (llmstxt.org): what the office is and which pages answer what, for AI assistants.
 * Facts come from COMPANY and the page registries, so the file follows the site; the short page
 * descriptions are here because server code may not read the dictionaries (ADR 0002).
 */

const url = (path: string) => `${SITE_URL}${path}`;

// One entry per Polish page other than the service pages, which take their registry label.
const PAGES: Record<string, { name: string; description: string }> = {
  [PATHS.home]: { name: 'Strona główna', description: 'usługi biura, dlaczego TEWU, kontakt' },
  [PATHS.about]: { name: 'O nas', description: 'ponad 25 lat na rynku, uprawnienia Ministerstwa Finansów, bezpośredni kontakt z szefostwem biura' },
  [PATHS.services]: { name: 'Usługi', description: 'wszystkie usługi biura' },
  [PATHS.outsourcing]: { name: 'Outsourcing', description: 'outsourcing księgowości i procesów back-office' },
  [PATHS.certificates]: { name: 'Certyfikaty', description: 'Certyfikat Księgowy Ministerstwa Finansów i świadectwo kwalifikacyjne' },
  [PATHS.contact]: { name: 'Kontakt', description: 'adres, telefony, e-mail, godziny otwarcia i mapa dojazdu' },
  [PATHS.faq]: {
    name: 'Częste pytania (FAQ)',
    // The date the amounts were checked, not "this year": the line stays true if nobody updates them
    description: `JDG czy spółka, forma opodatkowania, zwolnienie z VAT, ulgi w ZUS, rachunek firmowy, KSeF – kwoty i terminy ze źródłami urzędowymi, stan na ${formatLongDate('pl', FAQ_UPDATED_AT)}`,
  },
  [PATHS.privacy]: { name: 'Polityka prywatności', description: 'jak przetwarzamy dane przekazane przez stronę' },
};

/** Throws for a page without an entry above, so a new page cannot slip out of llms.txt. */
function pageLine(path: string): string {
  const slug = servicePageSlugOfPath(path);
  if (slug) return `- [${SERVICE_PAGES[slug].label}](${url(path)}): usługa biura rachunkowego w Szczecinie`;
  const page = PAGES[path];
  if (!page) throw new Error(`llms.txt: no description for ${path}`);
  return `- [${page.name}](${url(path)}): ${page.description}`;
}

export function buildLlmsTxt(): string {
  const { address, phones, emails, openingHours } = COMPANY;
  const main = PAGE_PATHS.filter((path) => path !== PATHS.privacy);
  return [
    `# ${COMPANY.shortName}`,
    '',
    `> Biuro rachunkowe w Szczecinie (${address.line}): pełna księgowość spółek, KPiR, ryczałt, kadry i płace, KSeF oraz zakładanie spółek z o.o. Ponad 25 lat na rynku. Obsługa po polsku i ukraińsku, stacjonarnie i online.`,
    '',
    `Kontakt: tel. ${phones.office[0].display}, e-mail ${emails.main}, pn–pt ${openingHours.opens}–${openingHours.closes}.`,
    '',
    '## Strony',
    '',
    ...main.map(pageLine),
    '',
    '## Wersja ukraińska',
    '',
    `- [Головна](${url(localizePath(PATHS.home, 'uk'))}): бухгалтерське бюро в Щецині, обслуговування українською`,
    `- [Поширені запитання (FAQ)](${url(localizePath(PATHS.faq, 'uk'))}): JDG чи Sp. z o.o., форма оподаткування, VAT, ZUS, рахунок, KSeF`,
    '',
    '## Optional',
    '',
    pageLine(PATHS.privacy),
    '',
  ].join('\n');
}
