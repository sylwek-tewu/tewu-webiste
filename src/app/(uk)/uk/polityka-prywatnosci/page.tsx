import React from 'react';
import { buildPageMetadata } from '@/lib/metadata';
import PrivacyPolicyClient from '@/app/(pl)/polityka-prywatnosci/PrivacyPolicyClient';
import { getOutboxTtlHours } from '@/lib/outbox/processor';

export const metadata = buildPageMetadata({
  locale: 'uk',
  path: '/polityka-prywatnosci',
  title: 'Політика конфіденційності | Biuro Rachunkowe TEWU',
  description: 'Правила обробки та захисту персональних даних у Biuro Rachunkowe TEWU Sp. z o.o. у Щецині (Польща).',
});

export default function UkrainianPrivacyPolicyPage() {
  // Static page: rendered at build time, so a CALLBACK_OUTBOX_TTL_HOURS change needs a redeploy.
  return <PrivacyPolicyClient retentionHours={getOutboxTtlHours()} />;
}
