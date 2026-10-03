// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithMantine } from '@/test/render';
import { CallbackProvider } from './CallbackContext';
import CallbackWidget from './CallbackWidget';
import type { ResolvedCallNumber } from '@/lib/callback/call-number';

const callInfo: ResolvedCallNumber = {
  raw: '+48914824190',
  telUri: 'tel:+48914824190',
  display: '91 48 24 190',
};

let now = 1_000_000;
let fetchMock: ReturnType<typeof vi.fn>;

function respondWith(body: object, status = 200) {
  fetchMock.mockResolvedValue(new Response(JSON.stringify(body), { status }));
}

function sentBody(): Record<string, unknown> {
  return JSON.parse(fetchMock.mock.calls[0][1].body as string);
}

async function openForm() {
  const user = userEvent.setup();
  renderWithMantine(
    <CallbackProvider>
      <CallbackWidget callInfo={callInfo} />
    </CallbackProvider>
  );
  await user.click(screen.getByRole('button', { name: /Zamów bezpłatną wycenę/ }));
  await screen.findByLabelText(/Numer telefonu/);
  return user;
}

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>, secondsOpen: number) {
  await user.type(screen.getByLabelText(/Numer telefonu/), '501 482 555');
  now += secondsOpen * 1000;
  await user.click(screen.getByRole('button', { name: /Poproś o kontakt/ }));
}

describe('CallbackWidget', () => {
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

  it('posts the normalized phone, slot, source and the time the form was open', async () => {
    respondWith({ success: true, id: 'C9F1A2', delivery: 'direct' });
    const user = await openForm();

    await fillAndSubmit(user, 5);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(fetchMock.mock.calls[0][0]).toBe('/api/callback');
    expect(sentBody()).toMatchObject({
      phone: '+48501482555',
      slot: 'asap',
      source: 'floating',
      elapsedMs: 5000,
    });
  });

  it('holds a fast submission until 2 s have passed instead of letting the server drop it', async () => {
    respondWith({ success: true, id: 'C9F1A2', delivery: 'direct' });
    const user = await openForm();

    await fillAndSubmit(user, 0.5);

    // Not sent straight away; sent once the remaining ~1.5 s have elapsed.
    expect(fetchMock).not.toHaveBeenCalled();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce(), { timeout: 3000 });
    expect(sentBody().elapsedMs).toBeGreaterThanOrEqual(2000);
  });

  it('records a conversion only when the server reports a delivery', async () => {
    respondWith({ success: true, id: 'C9F1A2', delivery: 'buffered' });
    const user = await openForm();
    await fillAndSubmit(user, 5);

    await screen.findByText(/Otrzymaliśmy Twoją prośbę/);
    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({ event: 'callback_request_submit', delivery: 'buffered' })
    );
  });

  it('records no conversion when the server silently ignored the request', async () => {
    respondWith({ success: true, id: 'OK' });
    const user = await openForm();
    await fillAndSubmit(user, 5);

    await screen.findByText(/Otrzymaliśmy Twoją prośbę/);
    expect(window.dataLayer).not.toContainEqual(
      expect.objectContaining({ event: 'callback_request_submit' })
    );
  });

  it('shows the office number when the server fails', async () => {
    respondWith({ error: 'Nie udało się wysłać prośby. Zadzwoń: 91 48 24 190' }, 502);
    const user = await openForm();
    await fillAndSubmit(user, 5);

    const link = await screen.findByRole('link', { name: /Zadzwoń teraz: 91 48 24 190/ });
    expect(link).toHaveAttribute('href', 'tel:+48914824190');
  });

  it('shows a phone number the server rejected as a field error, not a general failure', async () => {
    respondWith({ error: 'Wprowadź poprawny numer telefonu (np. 501 482 555)' }, 400);
    const user = await openForm();
    await fillAndSubmit(user, 5);

    const phone = screen.getByLabelText(/Numer telefonu/);
    await waitFor(() => expect(phone).toHaveAttribute('aria-invalid', 'true'));
    expect(screen.getByText(/Wprowadź poprawny numer telefonu/)).toBeInTheDocument();
    expect(screen.queryByText('Nie udało się wysłać prośby')).not.toBeInTheDocument();
  });

  it('cancels a held submission when the visitor closes the form', async () => {
    respondWith({ success: true, id: 'C9F1A2', delivery: 'direct' });
    const user = await openForm();
    await fillAndSubmit(user, 0.5);

    await user.keyboard('{Escape}');
    await new Promise((r) => setTimeout(r, 2000));
    expect(fetchMock).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /Zamów bezpłatną wycenę/ }));
    expect(await screen.findByRole('button', { name: /Poproś o kontakt/ })).toBeInTheDocument();
    expect(screen.queryByText(/Otrzymaliśmy Twoją prośbę/)).not.toBeInTheDocument();
  });

  it('marks up the form for phone keyboards, autofill and screen readers', async () => {
    await openForm();

    const phone = screen.getByLabelText(/Numer telefonu/);
    expect(phone).toHaveAttribute('type', 'tel');
    expect(phone).toHaveAttribute('inputmode', 'tel');
    expect(phone).toHaveAttribute('autocomplete', 'tel');
    expect(screen.getByRole('radiogroup', { name: /Kiedy możemy oddzwonić/ })).toBeInTheDocument();
    const promise = screen.getByRole('dialog').querySelector('[aria-live="polite"]');
    expect(promise).toHaveTextContent(/Oddzwonimy|Biuro/);
  });
});
