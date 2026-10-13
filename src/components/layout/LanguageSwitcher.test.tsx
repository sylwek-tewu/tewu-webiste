// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithMantine } from '@/test/render';
import { LOCALE_COOKIE_NAME } from '@/i18n/config';
import { LanguageSwitcher } from './LanguageSwitcher';

const push = vi.hoisted(() => vi.fn());
const pathname = vi.hoisted(() => ({ current: '/kontakt' }));
vi.mock('next/navigation', () => ({
  usePathname: () => pathname.current,
  useRouter: () => ({ push, replace: vi.fn(), prefetch: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
}));

// Windows has no flag emoji glyphs and shows them as letters, so "🇺🇦 UA" reads "UA UA".
const REGIONAL_INDICATOR = /[\u{1F1E6}-\u{1F1FF}]/u;

function clearLocaleCookie() {
  document.cookie = `${LOCALE_COOKIE_NAME}=; path=/; max-age=0`;
}

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    push.mockClear();
    pathname.current = '/kontakt';
    clearLocaleCookie();
  });

  it('draws the flags as images, not as emoji', () => {
    const { container } = renderWithMantine(<LanguageSwitcher />);

    expect(container.textContent).not.toMatch(REGIONAL_INDICATOR);
    expect(container.querySelectorAll('a svg')).toHaveLength(2);
  });

  it('is a labelled group of two links named by their language code, with the flags hidden from screen readers', () => {
    const { container } = renderWithMantine(<LanguageSwitcher />);

    expect(screen.getByRole('group', { name: 'Wybierz język / Оберіть мову' })).toBeInTheDocument();
    expect(container.querySelectorAll('a svg[aria-hidden="true"]')).toHaveLength(2);
    expect(screen.getAllByRole('link').map((link) => link.textContent)).toEqual(['PL', 'UA']);
  });

  it('links to the same page in each language, so crawlers and no-JS visitors can follow them', () => {
    renderWithMantine(<LanguageSwitcher />);

    expect(screen.getByRole('link', { name: 'PL' })).toHaveAttribute('href', '/kontakt');
    expect(screen.getByRole('link', { name: 'UA' })).toHaveAttribute('href', '/uk/kontakt');
  });

  it('links the home page of each language to the root and /uk', () => {
    pathname.current = '/';
    renderWithMantine(<LanguageSwitcher />);

    expect(screen.getByRole('link', { name: 'PL' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'UA' })).toHaveAttribute('href', '/uk');
  });

  it('marks only the current language with aria-current', () => {
    renderWithMantine(<LanguageSwitcher />);

    expect(screen.getByRole('link', { name: 'PL' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'UA' })).not.toHaveAttribute('aria-current');
  });

  it('marks UA as current on a Ukrainian page and links back to the Polish path', () => {
    pathname.current = '/uk/uslugi/kpir';
    renderWithMantine(<LanguageSwitcher />, { locale: 'uk' });

    expect(screen.getByRole('link', { name: 'UA' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'PL' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'PL' })).toHaveAttribute('href', '/uslugi/kpir');
  });

  it('remembers the choice in the locale cookie when UA is clicked, for the proxy’s language redirect', async () => {
    renderWithMantine(<LanguageSwitcher />);
    // jsdom does not navigate; the click is only here to run the handler
    const link = screen.getByRole('link', { name: 'UA' });
    link.addEventListener('click', (event) => event.preventDefault());

    await userEvent.click(link);

    expect(document.cookie).toContain(`${LOCALE_COOKIE_NAME}=uk`);
  });

  it('remembers Polish when PL is clicked on a Ukrainian page', async () => {
    pathname.current = '/uk/kontakt';
    renderWithMantine(<LanguageSwitcher />, { locale: 'uk' });
    const link = screen.getByRole('link', { name: 'PL' });
    link.addEventListener('click', (event) => event.preventDefault());

    await userEvent.click(link);

    expect(document.cookie).toContain(`${LOCALE_COOKIE_NAME}=pl`);
  });

  it('does not touch the cookie when the current language is clicked', async () => {
    renderWithMantine(<LanguageSwitcher />);
    const link = screen.getByRole('link', { name: 'PL' });
    link.addEventListener('click', (event) => event.preventDefault());

    await userEvent.click(link);

    expect(document.cookie).not.toContain(LOCALE_COOKIE_NAME);
  });
});
