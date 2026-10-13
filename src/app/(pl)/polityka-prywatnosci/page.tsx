import React from 'react';
import type { Metadata } from 'next';
import PrivacyPolicyClient from './PrivacyPolicyClient';
import { getOutboxTtlHours } from '@/lib/outbox/processor';

export const metadata: Metadata = {
  title: 'Polityka Prywatności | Biuro Rachunkowe TEWU',
  description: 'Zasady przetwarzania i ochrony danych osobowych w Biurze Rachunkowym TEWU Sp. z o.o. w Szczecinie.',
  alternates: {
    canonical: '/polityka-prywatnosci',
    languages: {
      'pl': '/polityka-prywatnosci',
      'x-default': '/polityka-prywatnosci',
      'uk': '/uk/polityka-prywatnosci',
    },
  },
};

export default function PrivacyPolicyPage() {
  // Static page: rendered at build time, so a CALLBACK_OUTBOX_TTL_HOURS change needs a redeploy.
  return <PrivacyPolicyClient retentionHours={getOutboxTtlHours()} />;
}
