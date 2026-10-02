import { describe, it, expect } from 'vitest';
import { buildCallbackEmail } from './email';
import { CallbackNotificationData } from './types';

const base: CallbackNotificationData = {
  id: 'C9F1A2',
  phone: '+48501482555',
  slot: '12-16',
  topic: 'kadry-place',
  source: 'header',
  createdAt: '2026-10-05T13:42:00.000Z',
};

describe('buildCallbackEmail', () => {
  it('puts the id in the subject and the phone, labels and Warsaw time in the body', () => {
    const email = buildCallbackEmail(base);
    expect(email.subject).toContain('[Oddzwonienie #C9F1A2]');
    expect(email.text).toContain('+48501482555');
    expect(email.text).toContain('Kadry i płace');
    expect(email.text).toContain('05.10.2026, 15:42');
    expect(email.html).toContain('href="tel:+48501482555"');
  });

  it('HTML-escapes interpolated values', () => {
    const email = buildCallbackEmail({ ...base, phone: '"><img src=x onerror=alert(1)>' });
    expect(email.html).not.toContain('<img src=x');
    expect(email.html).toContain('&quot;&gt;&lt;img src=x onerror=alert(1)&gt;');
  });

  it('shows an unknown source as "unknown"', () => {
    const email = buildCallbackEmail({ ...base, source: '<b>601 602 603</b>' });
    expect(email.html).not.toContain('601');
    expect(email.text).toContain('Źródło zgłoszenia: unknown');
  });

  it('never echoes an unknown topic id', () => {
    const email = buildCallbackEmail({ ...base, topic: '<b>free text</b>' });
    expect(email.text).not.toContain('free text');
    expect(email.html).not.toContain('free text');
  });
});
