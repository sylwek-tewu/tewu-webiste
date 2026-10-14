import { afterEach, describe, it, expect, vi } from 'vitest';
import { getCallbackRecipients, getSmtpConfig } from './config';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getSmtpConfig', () => {
  it('reads the SMTP settings and the sender/recipient from the environment', () => {
    vi.stubEnv('CALLBACK_SMTP_HOST', 'smtp.example.pl');
    vi.stubEnv('CALLBACK_SMTP_PORT', '465');
    vi.stubEnv('CALLBACK_SMTP_USER', 'robot');
    vi.stubEnv('CALLBACK_SMTP_PASS', 'sekret');
    vi.stubEnv('CALLBACK_FROM', 'Test <test@example.pl>');
    vi.stubEnv('CALLBACK_TO', 'zgloszenia@example.pl');

    expect(getSmtpConfig()).toEqual({
      host: 'smtp.example.pl',
      port: 465,
      user: 'robot',
      pass: 'sekret',
      from: 'Test <test@example.pl>',
      to: 'zgloszenia@example.pl',
      missing: [],
    });
  });

  it('falls back to port 587 and the office sender and mailbox', () => {
    vi.stubEnv('CALLBACK_SMTP_HOST', 'smtp.example.pl');
    vi.stubEnv('CALLBACK_SMTP_USER', 'robot');
    vi.stubEnv('CALLBACK_SMTP_PASS', 'sekret');
    vi.stubEnv('CALLBACK_SMTP_PORT', '');
    vi.stubEnv('CALLBACK_FROM', '');
    vi.stubEnv('CALLBACK_TO', '');

    const config = getSmtpConfig();
    expect(config.port).toBe(587);
    expect(config.from).toBe('Biuro Rachunkowe TEWU <biuro@tewu.szczecin.pl>');
    expect(config.to).toBe('biuro@tewu.szczecin.pl');
  });

  it('lists the required SMTP variables that are not set', () => {
    vi.stubEnv('CALLBACK_SMTP_HOST', '');
    vi.stubEnv('CALLBACK_SMTP_USER', 'robot');
    vi.stubEnv('CALLBACK_SMTP_PASS', '');

    expect(getSmtpConfig().missing).toEqual(['CALLBACK_SMTP_HOST', 'CALLBACK_SMTP_PASS']);
  });
});

describe('getCallbackRecipients', () => {
  it('returns the single mailbox from CALLBACK_TO', () => {
    vi.stubEnv('CALLBACK_TO', 'zgloszenia@example.pl');
    expect(getCallbackRecipients()).toEqual(['zgloszenia@example.pl']);
  });

  it('splits several comma-separated addresses and trims the spaces around them', () => {
    vi.stubEnv('CALLBACK_TO', 'jeden@example.pl, drugi@example.pl ,trzeci@example.pl');
    expect(getCallbackRecipients()).toEqual(['jeden@example.pl', 'drugi@example.pl', 'trzeci@example.pl']);
  });

  it('defaults to the office mailbox when CALLBACK_TO is not set', () => {
    vi.stubEnv('CALLBACK_TO', '');
    expect(getCallbackRecipients()).toEqual(['biuro@tewu.szczecin.pl']);
  });
});
