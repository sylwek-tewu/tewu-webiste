// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';

// Imported after each module reset, so the page and the render helper share one LocaleContext.
async function renderPage() {
  const { default: PrivacyPolicyPage } = await import('./page');
  const { renderWithMantine } = await import('@/test/render');
  return renderWithMantine(<PrivacyPolicyPage />);
}

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
});
