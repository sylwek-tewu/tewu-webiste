// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithMantine } from '@/test/render';
import { CallbackProvider } from './CallbackContext';
import CallbackWidget from './CallbackWidget';
import { CALLBACK_TOPICS } from '@/lib/callback/types';
import { ukTranslations } from '@/i18n';

// Office closed, so the mobile bar shows the opening hours instead of the call button
vi.mock('@/lib/calendar', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/calendar')>()),
  isOfficeOpen: () => false,
}));

const callInfo = { raw: '+48914824190', telUri: 'tel:+48914824190', display: '91 48 24 190' };
const t = ukTranslations.callbackWidget;

let now = 1_000_000;
let fetchMock: ReturnType<typeof vi.fn>;

function respondWith(body: object, status = 200) {
  fetchMock.mockResolvedValue(new Response(JSON.stringify(body), { status }));
}

async function openForm() {
  const user = userEvent.setup();
  renderWithMantine(
    <CallbackProvider>
      <CallbackWidget callInfo={callInfo} />
    </CallbackProvider>,
    { locale: 'uk' }
  );
  await user.click(screen.getByRole('button', { name: t.titleNormal }));
  await screen.findByLabelText(new RegExp(t.phoneLabel));
  return user;
}

async function submit(user: ReturnType<typeof userEvent.setup>, phone = '501 482 555') {
  await user.type(screen.getByLabelText(new RegExp(t.phoneLabel)), phone);
  now += 5000;
  await user.click(screen.getByRole('button', { name: t.submitButton }));
}

describe('CallbackWidget in Ukrainian', () => {
  beforeEach(() => {
    now = 1_000_000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    window.dataLayer = [];
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('sends locale "uk" with the request', async () => {
    respondWith({ success: true, id: 'C9F1A2', delivery: 'direct' });
    const user = await openForm();
    await submit(user);

    await screen.findByText(t.successTitle);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string).locale).toBe('uk');
  });

  it('labels every topic in Ukrainian', async () => {
    const user = await openForm();
    await user.click(screen.getByRole('textbox', { name: new RegExp(t.topicLabel.replace(/[()]/g, '.')) }));

    const options = await screen.findAllByRole('option', { hidden: true });
    expect(options.map((o) => o.textContent)).toEqual(CALLBACK_TOPICS.map((topic) => t.topics[topic.id]));
  });

  it('links the privacy notice to the Ukrainian policy', async () => {
    await openForm();
    expect(screen.getByRole('link', { name: t.rodoLink })).toHaveAttribute('href', '/uk/polityka-prywatnosci');
  });

  it('shows an invalid phone number error in Ukrainian, checked in the browser', async () => {
    const user = await openForm();
    await submit(user, '123');

    expect(await screen.findByText(t.phoneErrorInvalid)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shows a number the server rejected in Ukrainian, not the server\'s Polish message', async () => {
    respondWith({ error: 'Wprowadź poprawny numer telefonu (np. 501 482 555)', code: 'phone_invalid' }, 400);
    const user = await openForm();
    await submit(user);

    expect(await screen.findByText(t.phoneErrorInvalid)).toBeInTheDocument();
    expect(screen.queryByText(/Wprowadź/)).not.toBeInTheDocument();
  });

  it('explains a failed delivery in Ukrainian, with the office number on the call button', async () => {
    respondWith({ error: 'Nie udało się wysłać prośby. Zadzwoń: 91 48 24 190', code: 'delivery_failed' }, 502);
    const user = await openForm();
    await submit(user);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(t.errors.deliveryFailed);
    expect(alert).not.toHaveTextContent(/Nie udało się|Zadzwoń/);
    expect(within(alert).getByRole('link', { name: `${t.callNow} 91 48 24 190` })).toHaveAttribute(
      'href',
      'tel:+48914824190'
    );
  });

  it('explains a connection problem in Ukrainian', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    const user = await openForm();
    await submit(user);

    expect(await screen.findByText(t.errors.connection)).toBeInTheDocument();
  });

  it('gives the closed-office button a Ukrainian name with the Polish time-zone note', () => {
    renderWithMantine(
      <CallbackProvider>
        <CallbackWidget callInfo={callInfo} />
      </CallbackProvider>,
      { locale: 'uk' }
    );

    const hours = screen.getByRole('button', { name: `${t.officeHours} (за польським часом)` });
    expect(hours).toHaveAttribute('title', `${t.officeHours} (за польським часом)`);
  });
});
