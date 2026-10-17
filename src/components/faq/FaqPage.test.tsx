// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, it, expect } from 'vitest';
import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithMantine } from '@/test/render';
import { CallbackProvider, useCallbackWidget } from '@/components/callback-widget';
import { FAQ_UPDATED_AT, getFaqContent } from '@/content/faq';
import type { Locale } from '@/i18n/types';
import { plTranslations } from '@/i18n';
import FaqPage from './FaqPage';

function WidgetProbe() {
  const { isOpen, source } = useCallbackWidget();
  return <output>{isOpen ? `open:${source}` : 'closed'}</output>;
}

function renderFaq(locale: Locale = 'pl') {
  return renderWithMantine(
    <CallbackProvider>
      <FaqPage content={getFaqContent(locale)} updatedAt={FAQ_UPDATED_AT} />
      <WidgetProbe />
    </CallbackProvider>,
    { locale }
  );
}

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

describe.each(['pl', 'uk'] as Locale[])('FaqPage (%s)', (locale) => {
  const content = getFaqContent(locale);
  const questions = content.categories.flatMap((category) => category.questions);

  it('has one h1 and an h2 per category', () => {
    renderFaq(locale);
    expect(screen.getAllByRole('heading', { level: 1 }).map((h) => h.textContent)).toEqual([content.hero.title]);
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      ...content.categories.map((category) => category.title),
      content.cta.title,
    ]);
  });

  it('shows the update date in words and as a machine-readable date', () => {
    renderFaq(locale);
    const time = document.querySelector('time');
    expect(time).toHaveAttribute('dateTime', FAQ_UPDATED_AT);
    expect(time).toHaveTextContent(locale === 'pl' ? '15 października 2026 r.' : '15 жовтня 2026 р.');
  });

  it('links a tile to every category section, with the number of questions', () => {
    renderFaq(locale);
    const nav = screen.getByRole('navigation', { name: content.categoriesLabel });
    for (const category of content.categories) {
      const tile = within(nav).getByRole('link', { name: new RegExp(category.title) });
      expect(tile).toHaveAttribute('href', `#${category.id}`);
      expect(document.getElementById(category.id)?.tagName).toBe('SECTION');
    }
  });

  it('links the end of the disclaimer to the contact section', () => {
    renderFaq(locale);
    const link = screen.getByRole('link', { name: content.hero.disclaimerLink });
    expect(link).toHaveAttribute('href', '#kontakt');
    const section = document.getElementById('kontakt');
    expect(section?.tagName).toBe('SECTION');
    expect(section).toHaveTextContent(content.cta.title);
  });

  it('keeps every question and answer in the page, also while collapsed', () => {
    const { container } = renderFaq(locale);
    expect(container.querySelectorAll('details')).toHaveLength(questions.length);
    for (const question of questions) {
      const details = container.querySelector(`details#${question.id}`) as HTMLDetailsElement;
      expect(details.open).toBe(false);
      expect(details.querySelector('summary')).toHaveTextContent(question.question);
    }
  });
});

describe('FaqPage', () => {
  const content = getFaqContent('pl');

  it('opens the question named in the hash', () => {
    window.history.replaceState(null, '', '/faq#ulga-na-start');
    const { container } = renderFaq();
    expect((container.querySelector('details#ulga-na-start') as HTMLDetailsElement).open).toBe(true);
    expect((container.querySelector('details#certyfikat-ksiegowy') as HTMLDetailsElement).open).toBe(false);
  });

  it('opens the question when the hash changes after the page has loaded', () => {
    const { container } = renderFaq();
    const details = container.querySelector('details#wakacje-skladkowe') as HTMLDetailsElement;
    expect(details.open).toBe(false);
    act(() => {
      window.history.replaceState(null, '', '/faq#wakacje-skladkowe');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(details.open).toBe(true);
  });

  it('survives a hash that is not valid percent-encoding', () => {
    for (const hash of ['#100%', '#%', '#%2']) {
      window.history.replaceState(null, '', `/faq${hash}`);
      const { container, unmount } = renderFaq();
      expect(container.querySelector('h1')).toHaveTextContent(content.hero.title);
      expect([...container.querySelectorAll('details')].some((d) => (d as HTMLDetailsElement).open)).toBe(false);
      unmount();
    }
  });

  it('ignores a hash that names no question', () => {
    for (const hash of ['#nieznane', '#zus']) {
      window.history.replaceState(null, '', `/faq${hash}`);
      const { container, unmount } = renderFaq();
      expect([...container.querySelectorAll('details')].some((d) => (d as HTMLDetailsElement).open)).toBe(false);
      unmount();
    }
  });

  it('renders answer links and cites the official sources in a new tab', () => {
    renderFaq();
    expect(screen.getAllByRole('link', { name: 'Certyfikaty' }).some((a) => a.getAttribute('href') === '/certyfikaty')).toBe(true);
    const source = screen.getByRole('link', { name: 'biznes.gov.pl – ulga na start' });
    expect(source).toHaveAttribute('href', 'https://www.biznes.gov.pl/pl/portal/00285');
    expect(source).toHaveAttribute('target', '_blank');
    expect(source).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('opens the callback widget from the final call to action with the faq source', async () => {
    renderFaq();
    await userEvent.click(screen.getByRole('link', { name: plTranslations.servicePages.ctaButton }));
    expect(screen.getByRole('status')).toHaveTextContent('open:faq');
  });

  it('describes both office photos', () => {
    renderFaq();
    expect(screen.getByAltText(content.hero.imageAlt)).toHaveAttribute('src', '/img/biuro/budynek.jpg');
    expect(screen.getByAltText(content.cta.imageAlt)).toHaveAttribute('src', '/img/biuro/recepcja.jpg');
  });
});
