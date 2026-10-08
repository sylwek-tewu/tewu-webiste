import { describe, it, expect } from 'vitest';
import { buildCallbackEmail } from './email';
import { CallbackNotificationData } from './types';

const base: CallbackNotificationData = {
  id: 'C9F1A2',
  phone: '+48501482555',
  slot: '12-16',
  topic: 'kadry-place',
  source: 'header',
  locale: 'pl',
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

  it('tags a Ukrainian-language request in the subject and body', () => {
    const email = buildCallbackEmail({ ...base, locale: 'uk' });
    expect(email.subject).toMatch(/^\[Oddzwonienie #C9F1A2\] \[UA\] Nowa prośba o kontakt/);
    expect(email.text).toContain('Język strony: Ukraiński (UA)');
  });

  // Outlook on Windows shows flag emoji as letters ("UA Ukraiński (UA)").
  it('names the language in the HTML body without flag emoji', () => {
    for (const locale of ['pl', 'uk'] as const) {
      const email = buildCallbackEmail({ ...base, locale });
      expect(email.html).toContain(locale === 'uk' ? 'Ukraiński (UA)' : 'Polski (PL)');
      expect(email.html).not.toMatch(/[\u{1F1E6}-\u{1F1FF}]/u);
    }
  });

  it('has no language tag in the subject for a Polish request or an old record without locale', () => {
    for (const data of [{ ...base, locale: 'pl' as const }, base]) {
      const email = buildCallbackEmail(data);
      expect(email.subject).not.toContain('[UA]');
      expect(email.text).toContain('Język strony: Polski (PL)');
    }
  });

  it('HTML-escapes interpolated values', () => {
    const email = buildCallbackEmail({ ...base, phone: '"><img src=x onerror=alert(1)>' });
    expect(email.html).not.toContain('<img src=x');
    expect(email.html).toContain('&quot;&gt;&lt;img src=x onerror=alert(1)&gt;');
  });

  it('shows an unknown source as "unknown"', () => {
    const email = buildCallbackEmail({ ...base, source: '<b>601 602 603</b>' as unknown as CallbackNotificationData['source'] });
    expect(email.html).not.toContain('601');
    expect(email.text).toContain('Źródło zgłoszenia: unknown');
  });

  it('never echoes an unknown topic id', () => {
    const email = buildCallbackEmail({ ...base, topic: '<b>free text</b>' as unknown as CallbackNotificationData['topic'] });
    expect(email.text).not.toContain('free text');
    expect(email.html).not.toContain('free text');
  });

  it('names the landing page the request came from', () => {
    const email = buildCallbackEmail({ ...base, source: 'service', landingPage: 'kpir' });
    expect(email.text).toContain('Podstrona usługowa: Księga przychodów i rozchodów (KPiR) (/uslugi/kpir)');
    expect(email.html).toContain('Księga przychodów i rozchodów (KPiR) (/uslugi/kpir)');
  });

  it('gives the Ukrainian path for a request from the Ukrainian page', () => {
    const email = buildCallbackEmail({ ...base, locale: 'uk', landingPage: 'ksef' });
    expect(email.text).toContain('Podstrona usługowa: KSeF (/uk/uslugi/ksef)');
  });

  it('says no landing page when the request came from elsewhere', () => {
    expect(buildCallbackEmail(base).text).toContain('Podstrona usługowa: Nie dotyczy');
  });
});

describe('getSmtpTransportOptions', () => {
  it('keeps the SMTP handshake timeouts inside the route email budget', async () => {
    const { getSmtpTransportOptions } = await import('./email');
    const { DELIVERY_BUDGET } = await import('../callback/delivery-budget');
    const options = getSmtpTransportOptions({ host: 'smtp.example.com', port: 587, user: 'u', pass: 'p' });

    expect(options.connectionTimeout + options.greetingTimeout).toBeLessThan(DELIVERY_BUDGET.emailMs);
    expect(options.socketTimeout).toBeLessThan(DELIVERY_BUDGET.emailMs);
    expect(options.secure).toBe(false);
    expect(getSmtpTransportOptions({ host: 'h', port: 465, user: 'u', pass: 'p' }).secure).toBe(true);
  });

  it('refuses to send without TLS, also on the STARTTLS port', async () => {
    const { getSmtpTransportOptions } = await import('./email');
    expect(getSmtpTransportOptions({ host: 'h', port: 587, user: 'u', pass: 'p' }).requireTLS).toBe(true);
    expect(getSmtpTransportOptions({ host: 'h', port: 465, user: 'u', pass: 'p' }).requireTLS).toBe(true);
  });

  it('allows plain SMTP only to the same machine', async () => {
    const { getSmtpTransportOptions } = await import('./email');
    for (const host of ['localhost', '127.0.0.1', '::1']) {
      expect(getSmtpTransportOptions({ host, port: 587, user: 'u', pass: 'p' }).requireTLS).toBe(false);
    }
    expect(getSmtpTransportOptions({ host: '127.example.com', port: 587, user: 'u', pass: 'p' }).requireTLS).toBe(true);
  });
});
