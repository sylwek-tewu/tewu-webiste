import { describe, it, expect } from 'vitest';
import { buildTelegramPingText } from './telegram';
import { CallbackNotificationData } from './types';

describe('Telegram Ping PII Leak Prevention', () => {
  const sampleData: CallbackNotificationData = {
    id: 'A7K2',
    phone: '+48501482555',
    slot: '12-16',
    topic: 'kadry-place',
    source: 'hero',
    createdAt: '2026-10-05T13:42:00.000Z',
  };

  it('builds a message containing slot, topic, source and id', () => {
    const text = buildTelegramPingText(sampleData);
    expect(text).toContain('#A7K2');
    expect(text).toContain('12:00–16:00');
    expect(text).toContain('Kadry i płace');
    expect(text).toContain('hero');
  });

  it('strictly verifies NO phone digits or substrings are present in the telegram text', () => {
    const text = buildTelegramPingText(sampleData);

    // Full phone number must not appear
    expect(text).not.toContain(sampleData.phone);
    expect(text).not.toContain('501482555');
    expect(text).not.toContain('501 482 555');
    expect(text).not.toContain('482555'); // No trailing digits
    expect(text).not.toContain('501'); // No leading digits
  });

  it('does not leak user-supplied freeform data if provided in unexpected fields', () => {
    const trickyData: CallbackNotificationData = {
      id: 'TR99',
      phone: '+48602235736',
      slot: 'asap',
      topic: 'spolka',
      source: 'header',
      createdAt: '2026-10-05T09:00:00.000Z',
    };

    const text = buildTelegramPingText(trickyData);
    expect(text).not.toContain('602235736');
    expect(text).not.toContain('602 235 736');
    expect(text).not.toContain('+48');
  });
});
