import React from 'react';
import { buildPageMetadata } from '@/lib/metadata';
import PrivacyPolicyClient from './PrivacyPolicyClient';
import { getOutboxTtlHours } from '@/lib/outbox/processor';

export const metadata = buildPageMetadata({
  locale: 'pl',
  path: '/polityka-prywatnosci',
  title: 'Polityka Prywatności | Biuro Rachunkowe TEWU',
  description: 'Zasady przetwarzania i ochrony danych osobowych w Biurze Rachunkowym TEWU Sp. z o.o. w Szczecinie.',
});

export default function PrivacyPolicyPage() {
  // Static page: rendered at build time, so a CALLBACK_OUTBOX_TTL_HOURS change needs a redeploy.
  return <PrivacyPolicyClient retentionHours={getOutboxTtlHours()} />;
}
