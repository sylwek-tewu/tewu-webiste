/**
 * Notification settings read from the environment, shared by the email and Telegram channels.
 */

export function getSmtpConfig() {
  const host = process.env.CALLBACK_SMTP_HOST;
  const port = parseInt(process.env.CALLBACK_SMTP_PORT || '587', 10);
  const user = process.env.CALLBACK_SMTP_USER;
  const pass = process.env.CALLBACK_SMTP_PASS;
  const from = process.env.CALLBACK_FROM || 'Biuro Rachunkowe TEWU <biuro@tewu.szczecin.pl>';
  const to = process.env.CALLBACK_TO || 'biuro@tewu.szczecin.pl';

  const missing: string[] = [];
  if (!host) missing.push('CALLBACK_SMTP_HOST');
  if (!user) missing.push('CALLBACK_SMTP_USER');
  if (!pass) missing.push('CALLBACK_SMTP_PASS');

  return { host, port, user, pass, from, to, missing };
}

/** Office mailboxes that receive callback emails (comma-separated CALLBACK_TO), shared with the Telegram ping. */
export function getCallbackRecipients(): string[] {
  return getSmtpConfig()
    .to.split(',')
    .map((email) => email.trim())
    .filter(Boolean);
}
