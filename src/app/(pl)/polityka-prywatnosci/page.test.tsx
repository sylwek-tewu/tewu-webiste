// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { COMPANY_FULL_NAME, CONTACT_DETAILS } from '@/constants';

// Imported after each module reset, so the page and the render helper share one LocaleContext.
async function renderPage(locale: 'pl' | 'uk' = 'pl') {
  const { default: Page } =
    locale === 'uk' ? await import('@/app/(uk)/uk/polityka-prywatnosci/page') : await import('./page');
  const { renderWithMantine } = await import('@/test/render');
  return renderWithMantine(<Page />, { locale });
}

const strongTexts = (container: HTMLElement) => [...container.querySelectorAll('strong')].map((s) => s.textContent);

describe('Privacy policy page', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('separates "przy" from the street address', async () => {
    const { container } = await renderPage();
    expect(container.textContent).toContain('przy Al. Powstańców Wielkopolskich');
  });

  it('states the outbox retention configured in CALLBACK_OUTBOX_TTL_HOURS', async () => {
    vi.stubEnv('CALLBACK_OUTBOX_TTL_HOURS', '48');
    const { container } = await renderPage();
    expect(container.textContent).toContain('48 godzin');
    expect(container.textContent).not.toContain('72 godzin');
  });

  it('emphasizes the controller, the retention period, the contact e-mail and the authority', async () => {
    const { container } = await renderPage();
    const strong = strongTexts(container);
    expect(strong).toContain(COMPANY_FULL_NAME);
    expect(strong).toContain('72 godziny');
    expect(strong).toContain(CONTACT_DETAILS.email);
    expect(strong).toContain('Prezes Urzędu Ochrony Danych Osobowych (PUODO)');
    expect(container.textContent).not.toContain('**');
  });

  describe('in Ukrainian', () => {
    it('states the configured retention with the Ukrainian plural', async () => {
      vi.stubEnv('CALLBACK_OUTBOX_TTL_HOURS', '22');
      const { container } = await renderPage('uk');
      expect(strongTexts(container)).toContain('22 години');
      expect(container.textContent).not.toContain('72 години');
    });

    it('takes the company name and address from the shared constants', async () => {
      const { container } = await renderPage('uk');
      expect(strongTexts(container)).toContain(COMPANY_FULL_NAME);
      expect(container.textContent).toContain(CONTACT_DETAILS.address);
      expect(container.textContent).not.toContain('**');
    });
  });
});
