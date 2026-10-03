"use client";

import React from 'react';
import { LocaleProvider } from './LocaleContext';
import { plTranslations } from './pl';

export function PlLocaleProvider({ children }: { children: React.ReactNode }) {
  return <LocaleProvider locale="pl" t={plTranslations}>{children}</LocaleProvider>;
}
