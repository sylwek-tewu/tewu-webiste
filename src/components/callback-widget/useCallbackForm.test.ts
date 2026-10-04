// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCallbackForm, type UseCallbackFormOptions } from './useCallbackForm';
import { plTranslations } from '@/i18n';
import type { ResolvedCallNumber } from '@/lib/callback/call-number';

const callInfo: ResolvedCallNumber = {
  raw: '+48914824190',
  telUri: 'tel:+48914824190',
  display: '91 48 24 190',
};

describe('useCallbackForm', () => {
  let now: number;
  let fetchMock: ReturnType<typeof vi.fn>;
  let closeWidgetMock: ReturnType<typeof vi.fn<() => void>>;

  beforeEach(() => {
    vi.useFakeTimers();
    now = 1_000_000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    closeWidgetMock = vi.fn();
    window.dataLayer = [];
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  function createOptions(overrides?: Partial<UseCallbackFormOptions>): UseCallbackFormOptions {
    return {
      callInfo,
      isOpen: true,
      source: 'floating',
      closeWidget: closeWidgetMock,
      t: plTranslations.callbackWidget,
      locale: 'pl',
      ...overrides,
    };
  }

  function mockFetchResponse(body: object, status = 200, ok = true) {
    fetchMock.mockResolvedValue({
      ok,
      status,
      json: async () => body,
    });
  }

  it('initializes with default values', () => {
    const { result } = renderHook(() => useCallbackForm(createOptions()));

    expect(result.current.phone).toBe('');
    expect(result.current.slot).toBe('asap');
    expect(result.current.topic).toBe('');
    expect(result.current.honeypot).toBe('');
    expect(result.current.phoneError).toBeNull();
    expect(result.current.submitError).toBeNull();
    expect(result.current.submitSuccess).toBe(false);
    expect(result.current.isPending).toBe(false);
    expect(result.current.promiseMessage).toBeTruthy();
  });

  it('updates slot and updates promiseMessage accordingly', () => {
    const { result } = renderHook(() => useCallbackForm(createOptions()));
    const initialMessage = result.current.promiseMessage;

    act(() => {
      result.current.setSlot('17-18');
    });

    expect(result.current.slot).toBe('17-18');
    expect(result.current.promiseMessage).not.toBe(initialMessage);
    expect(result.current.promiseMessage).toContain('17:00–18:00');
  });

  it('validates invalid phone number without calling fetch', async () => {
    const { result } = renderHook(() => useCallbackForm(createOptions()));

    act(() => {
      result.current.setPhone('123'); // too short / invalid
    });

    await act(async () => {
      result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.phoneError).toBe(plTranslations.callbackWidget.phoneErrorInvalid);
    expect(result.current.submitSuccess).toBe(false);
  });

  it('clears phone error when phone changes', async () => {
    const { result } = renderHook(() => useCallbackForm(createOptions()));

    act(() => {
      result.current.setPhone('');
    });

    await act(async () => {
      result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    });

    expect(result.current.phoneError).toBe(plTranslations.callbackWidget.phoneErrorRequired);

    act(() => {
      result.current.setPhone('5');
    });

    expect(result.current.phoneError).toBeNull();
  });

  it('submits valid phone after normal elapsed time, posts normalized payload and sets submitSuccess', async () => {
    mockFetchResponse({ success: true, id: 'REQ-123', delivery: 'direct' });
    const { result } = renderHook(() => useCallbackForm(createOptions()));

    act(() => {
      result.current.setPhone('501 482 555');
      result.current.setTopic('spolka');
      result.current.setHoneypot('bot-value');
    });

    // Simulate 3 seconds have passed (greater than MIN_FILL_TIME_MS 2000)
    now += 3000;

    await act(async () => {
      result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith('/api/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '+48501482555',
        slot: 'asap',
        topic: 'spolka',
        source: 'floating',
        locale: 'pl',
        honeypot: 'bot-value',
        elapsedMs: 3000,
      }),
    });

    expect(result.current.submitSuccess).toBe(true);
    expect(result.current.submitError).toBeNull();
    expect(result.current.phoneError).toBeNull();

    // Verify dataLayer push
    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: 'callback_request_submit',
        delivery: 'direct',
        time_slot: 'asap',
        topic: 'spolka',
      })
    );
  });

  it('anti-bot fast submission waits out delay without dropping', async () => {
    mockFetchResponse({ success: true, id: 'REQ-FAST', delivery: 'direct' });
    const { result } = renderHook(() => useCallbackForm(createOptions()));

    act(() => {
      result.current.setPhone('501 482 555');
    });

    // Only 500ms elapsed -> delay should be 1500ms
    now += 500;

    await act(async () => {
      result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    });

    // Should not have fetched yet
    expect(fetchMock).not.toHaveBeenCalled();

    // Advance by 1400ms (still within delay)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1400);
    });
    expect(fetchMock).not.toHaveBeenCalled();

    // Advance the remaining 100ms
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.elapsedMs).toBe(2000);
    expect(result.current.submitSuccess).toBe(true);
  });

  it('form close cancels pending submission (cancelledRef)', async () => {
    mockFetchResponse({ success: true, id: 'REQ-CANCEL', delivery: 'direct' });
    const { result, rerender } = renderHook(
      (props: UseCallbackFormOptions) => useCallbackForm(props),
      { initialProps: createOptions() }
    );

    act(() => {
      result.current.setPhone('501 482 555');
    });

    now += 500; // 1500ms delay needed

    await act(async () => {
      result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    });

    expect(fetchMock).not.toHaveBeenCalled();

    // Close the widget via handleClose
    act(() => {
      result.current.handleClose();
    });

    expect(closeWidgetMock).toHaveBeenCalledOnce();

    // Also rerender with isOpen: false to simulate parent state update
    rerender(createOptions({ isOpen: false }));

    // Now advance past the delay
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    // Fetch was cancelled, so it was never called
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.submitSuccess).toBe(false);
  });

  it('maps server error codes to localized phone error or submit error', async () => {
    mockFetchResponse({ error: 'Server says bad phone', code: 'phone_invalid' }, 400, false);
    const { result } = renderHook(() => useCallbackForm(createOptions()));

    act(() => {
      result.current.setPhone('501 482 555');
    });
    now += 2500;

    await act(async () => {
      result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    });

    expect(result.current.phoneError).toBe(plTranslations.callbackWidget.phoneErrorInvalid);
    expect(result.current.submitError).toBeNull();
    expect(result.current.submitSuccess).toBe(false);
  });

  it('maps server delivery_failed to localized submit error', async () => {
    mockFetchResponse({ error: 'Delivery failed', code: 'delivery_failed' }, 502, false);
    const { result } = renderHook(() => useCallbackForm(createOptions()));

    act(() => {
      result.current.setPhone('501 482 555');
    });
    now += 2500;

    await act(async () => {
      result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    });

    expect(result.current.submitError).toBe(plTranslations.callbackWidget.errors.deliveryFailed);
    expect(result.current.phoneError).toBeNull();
    expect(result.current.submitSuccess).toBe(false);
  });

  it('handles network / connection failure gracefully', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    const { result } = renderHook(() => useCallbackForm(createOptions()));

    act(() => {
      result.current.setPhone('501 482 555');
    });
    now += 2500;

    await act(async () => {
      result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    });

    expect(result.current.submitError).toBe(plTranslations.callbackWidget.errors.connection);
    expect(result.current.submitSuccess).toBe(false);
  });

  it('resets form state on handleClose after successful submit', async () => {
    mockFetchResponse({ success: true, id: 'REQ-123', delivery: 'direct' });
    const { result } = renderHook(() => useCallbackForm(createOptions()));

    act(() => {
      result.current.setPhone('501 482 555');
      result.current.setSlot('12-16');
      result.current.setTopic('fundacja');
    });
    now += 2500;

    await act(async () => {
      result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    });

    expect(result.current.submitSuccess).toBe(true);

    act(() => {
      result.current.handleClose();
    });

    expect(result.current.phone).toBe('');
    expect(result.current.slot).toBe('asap');
    expect(result.current.topic).toBe('');
    expect(result.current.submitSuccess).toBe(false);
  });
});
