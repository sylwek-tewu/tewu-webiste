import React from 'react';
import type { Metadata } from 'next';
import PrivacyPolicyClient from '@/app/(pl)/polityka-prywatnosci/PrivacyPolicyClient';
import { getOutboxTtlHours } from '@/lib/outbox/processor';

export const metadata: Metadata = {
  title: 'Політика конфіденційності | Biuro Rachunkowe TEWU',
  description: 'Правила обробки та захисту персональних даних у Biuro Rachunkowe TEWU Sp. z o.o. у Щецині (Польща).',
  alternates: {
    canonical: '/uk/polityka-prywatnosci',
    languages: {
      'pl': '/polityka-prywatnosci',
      'x-default': '/polityka-prywatnosci',
      'uk': '/uk/polityka-prywatnosci',
    },
  },
};

export default function UkrainianPrivacyPolicyPage() {
  // Static page: rendered at build time, so a CALLBACK_OUTBOX_TTL_HOURS change needs a redeploy.
  return <PrivacyPolicyClient retentionHours={getOutboxTtlHours()} />;
}
