// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithMantine } from '@/test/render';
import { getDictionary, type Locale } from '@/i18n';
import CertificateCard from './CertificateCard';

const CERT = getDictionary('pl').certificates.items[0];

describe.each([
  ['pl', 'Podgląd Dokumentu'],
  ['uk', 'Перегляд документа'],
] as [Locale, string][])('CertificateCard (%s)', (locale, previewLabel) => {
  const cert = getDictionary(locale).certificates.items[0];

  it('is a real button, named by the preview action and the certificate', () => {
    renderWithMantine(<CertificateCard cert={cert} onClick={() => {}} />, { locale });
    const button = screen.getByRole('button', { name: new RegExp(`^${previewLabel}`) });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAccessibleName(`${previewLabel}: ${cert.title} – ${cert.desc}`);
  });

  it('shows the hover caption from the dictionary', () => {
    renderWithMantine(<CertificateCard cert={cert} onClick={() => {}} />, { locale });
    expect(getDictionary(locale).certificates.previewLabel).toBe(previewLabel);
    expect(screen.getAllByText(previewLabel, { exact: false }).length).toBeGreaterThan(0);
  });
});

describe('CertificateCard keyboard and mouse', () => {
  it('opens the preview on click', async () => {
    const onClick = vi.fn();
    renderWithMantine(<CertificateCard cert={CERT} onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('can be reached with Tab and opened with Enter and Space', async () => {
    const onClick = vi.fn();
    renderWithMantine(<CertificateCard cert={CERT} onClick={onClick} />);
    await userEvent.tab();
    expect(screen.getByRole('button')).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });
});
