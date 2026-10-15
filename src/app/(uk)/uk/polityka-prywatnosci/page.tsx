import React from 'react';
import { buildPageMetadata } from '@/lib/metadata';
import PrivacyPolicyClient from '@/app/(pl)/polityka-prywatnosci/PrivacyPolicyClient';
import { getOutboxTtlHours } from '@/lib/outbox/processor';

export const metadata = buildPageMetadata({
  locale: 'uk',
  path: '/polityka-prywatnosci',
  title: 'Політика конфіденційності | Biuro Rachunkowe TEWU',
  description: 'Як Biuro Rachunkowe TEWU у Щецині обробляє персональні дані: адміністратор, цілі, обсяг даних, одержувачі, строк зберігання, ваші права та файли cookie.',
});

export default function UkrainianPrivacyPolicyPage() {
  // Static page: rendered at build time, so a CALLBACK_OUTBOX_TTL_HOURS change needs a redeploy.
  return <PrivacyPolicyClient retentionHours={getOutboxTtlHours()} />;
}
