"use client";

import React from 'react';
import { LocaleProvider } from './LocaleContext';
import { ukTranslations } from './uk';

export function UkLocaleProvider({ children }: { children: React.ReactNode }) {
  return <LocaleProvider locale="uk" t={ukTranslations}>{children}</LocaleProvider>;
}
