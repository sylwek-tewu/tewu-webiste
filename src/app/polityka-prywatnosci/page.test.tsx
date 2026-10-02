// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderWithMantine } from '@/test/render';

describe('Privacy policy page', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('separates "przy" from the street address', async () => {
    const { default: PrivacyPolicyPage } = await import('./page');
    const { container } = renderWithMantine(<PrivacyPolicyPage />);
    expect(container.textContent).toContain('przy Al. Powstańców Wielkopolskich');
  });

  it('states the outbox retention configured in CALLBACK_OUTBOX_TTL_HOURS', async () => {
    vi.stubEnv('CALLBACK_OUTBOX_TTL_HOURS', '48');
    const { default: PrivacyPolicyPage } = await import('./page');
    const { container } = renderWithMantine(<PrivacyPolicyPage />);
    expect(container.textContent).toContain('48 godzin');
    expect(container.textContent).not.toContain('72 godzin');
  });
});
