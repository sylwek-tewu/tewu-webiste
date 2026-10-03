// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithMantine } from '@/test/render';
import { LanguageSwitcher } from './LanguageSwitcher';

const push = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({
  usePathname: () => '/kontakt',
  useRouter: () => ({ push, replace: vi.fn(), prefetch: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
}));

// Windows has no flag emoji glyphs and shows them as letters, so "🇺🇦 UA" reads "UA UA".
const REGIONAL_INDICATOR = /[\u{1F1E6}-\u{1F1FF}]/u;

describe('LanguageSwitcher', () => {
  beforeEach(() => push.mockClear());

  it('draws the flags as images, not as emoji', () => {
    const { container } = renderWithMantine(<LanguageSwitcher />);

    expect(container.textContent).not.toMatch(REGIONAL_INDICATOR);
    expect(container.querySelectorAll('label svg')).toHaveLength(2);
  });

  it('names each option by its language code only, with the flags hidden from screen readers', () => {
    renderWithMantine(<LanguageSwitcher />);

    expect(screen.getByRole('radio', { name: 'PL' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'UA' })).not.toBeChecked();
  });

  it('opens the same page in Ukrainian when UA is clicked', async () => {
    renderWithMantine(<LanguageSwitcher />);

    await userEvent.click(screen.getByRole('radio', { name: 'UA' }));

    expect(push).toHaveBeenCalledWith('/uk/kontakt');
  });
});
