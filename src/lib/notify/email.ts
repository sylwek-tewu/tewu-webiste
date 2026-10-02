/**
 * SMTP Email Notification Dispatcher using Nodemailer.
 */

import nodemailer from 'nodemailer';
import { CallbackNotificationData } from './types';
import { CALLBACK_SLOTS, CALLBACK_TOPICS, toKnownSource } from '../callback/types';
import { getWarsawTime } from '../callback/business-hours';

function getSlotLabel(slotId: string): string {
  const found = CALLBACK_SLOTS.find((s) => s.id === slotId);
  return found ? `${found.label} (${found.timeRangeLabel})` : 'Nieznana';
}

function getTopicLabel(topicId?: string): string {
  if (!topicId) return 'Nie określono';
  const found = CALLBACK_TOPICS.find((t) => t.id === topicId);
  return found ? found.label : 'Nie określono';
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatWarsawDateTime(isoString: string): string {
  const date = new Date(isoString);
  const wt = getWarsawTime(date);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(wt.day)}.${pad(wt.month)}.${wt.year}, ${pad(wt.hour)}:${pad(wt.minute)}`;
}

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

export function buildCallbackEmail(data: CallbackNotificationData): { subject: string; text: string; html: string } {
  const slotLabel = getSlotLabel(data.slot);
  const topicLabel = getTopicLabel(data.topic);
  const source = toKnownSource(data.source);
  const dateFormatted = formatWarsawDateTime(data.createdAt);
  const h = {
    id: escapeHtml(data.id),
    phone: escapeHtml(data.phone),
    slot: escapeHtml(slotLabel),
    topic: escapeHtml(topicLabel),
    source: escapeHtml(source),
  };

  const subject = `[Oddzwonienie #${data.id}] Nowa prośba o kontakt – ${slotLabel}`;

  const textBody = `
Nowa prośba o oddzwonienie z formularza na stronie tewu.szczecin.pl

Identyfikator: #${data.id}
Telefon: ${data.phone}
Preferowana pora kontaktu: ${slotLabel}
Czego dotyczy: ${topicLabel}
Źródło zgłoszenia: ${source}
Data i godzina: ${dateFormatted} (czas polski)
`.trim();

  const htmlBody = `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
  <div style="border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px;">
    <h2 style="color: #1e3a8a; margin: 0;">Biuro Rachunkowe TEWU</h2>
    <p style="margin: 4px 0 0; color: #64748b; font-size: 14px;">Nowa prośba o bezpłatną wycenę / oddzwonienie</p>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
    <tr>
      <td style="padding: 8px 0; color: #64748b; width: 180px;">Identyfikator:</td>
      <td style="padding: 8px 0; font-weight: bold; color: #1e3a8a;">#${h.id}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #64748b;">Numer telefonu:</td>
      <td style="padding: 8px 0; font-weight: bold; font-size: 18px; color: #0f172a;">
        <a href="tel:${h.phone}" style="color: #2563eb; text-decoration: none;">${h.phone}</a>
      </td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #64748b;">Preferowana pora:</td>
      <td style="padding: 8px 0; font-weight: bold;">${h.slot}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #64748b;">Temat:</td>
      <td style="padding: 8px 0;">${h.topic}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #64748b;">Miejsce wywołania:</td>
      <td style="padding: 8px 0; font-family: monospace; color: #475569;">${h.source}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #64748b;">Czas zgłoszenia:</td>
      <td style="padding: 8px 0; color: #475569;">${dateFormatted} (czas polski)</td>
    </tr>
  </table>

  <div style="background-color: #f8fafc; border-radius: 6px; padding: 12px; font-size: 13px; color: #64748b;">
    Zgłoszenie odebrane przez widżet call-back. Reakcja telefoniczna powinna nastąpić w deklarowanym oknie czasowym.
  </div>
</div>
`.trim();

  return { subject, text: textBody, html: htmlBody };
}

export async function sendCallbackEmail(data: CallbackNotificationData): Promise<boolean> {
  const config = getSmtpConfig();

  if (config.missing.length > 0) {
    console.error(`[SMTP] Missing required environment variables: ${config.missing.join(', ')}`);
    return false;
  }

  const { subject, text: textBody, html: htmlBody } = buildCallbackEmail(data);

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
    });

    const recipients = config.to.split(',').map((email) => email.trim()).filter(Boolean);

    await transporter.sendMail({
      from: config.from,
      to: recipients,
      subject,
      text: textBody,
      html: htmlBody,
    });

    return true;
  } catch (error) {
    console.error('[SMTP] Failed to send email:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}
