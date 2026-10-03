// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithMantine } from '@/test/render';
import { LanguageSwitcher } from './LanguageSwitcher';

// Windows has no flag emoji glyphs and shows them as letters, so "🇺🇦 UA" reads "UA UA".
const REGIONAL_INDICATOR = /[\u{1F1E6}-\u{1F1FF}]/u;

describe('LanguageSwitcher', () => {
  it('draws the flags as images, not as emoji', () => {
    const { container } = renderWithMantine(<LanguageSwitcher />);

    expect(container.textContent).not.toMatch(REGIONAL_INDICATOR);
    expect(container.querySelectorAll('label svg')).toHaveLength(2);
    expect(screen.getByText('PL')).toBeInTheDocument();
    expect(screen.getByText('UA')).toBeInTheDocument();
  });
});
