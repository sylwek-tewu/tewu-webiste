import React from 'react';
import { buildPageMetadata } from '@/lib/metadata';
import PrivacyPolicyClient from './PrivacyPolicyClient';
import { getOutboxTtlHours } from '@/lib/outbox/processor';

export const metadata = buildPageMetadata({
  locale: 'pl',
  path: '/polityka-prywatnosci',
  title: 'Polityka Prywatności | Biuro Rachunkowe TEWU',
  description: 'Jak Biuro Rachunkowe TEWU w Szczecinie przetwarza dane osobowe: administrator, cele, zakres danych, odbiorcy, okres przechowywania, Twoje prawa i pliki cookie.',
});

export default function PrivacyPolicyPage() {
  // Static page: rendered at build time, so a CALLBACK_OUTBOX_TTL_HOURS change needs a redeploy.
  return <PrivacyPolicyClient retentionHours={getOutboxTtlHours()} />;
}
