"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { servicePageSlugOfPath } from '@/lib/service-pages';
import { CallbackContextType, WidgetTriggerSource } from './types';
import { pushCallbackWidgetOpen } from './analytics';

const CALLBACK_LINK_PARAM = 'callback';

const CallbackContext = createContext<CallbackContextType | null>(null);

export const CallbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const landingPage = servicePageSlugOfPath(pathname || '/');
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState<WidgetTriggerSource>('floating');

  const openWidget = useCallback((triggerSource: WidgetTriggerSource = 'floating') => {
    setSource(triggerSource);
    setIsOpen(true);
    pushCallbackWidgetOpen(triggerSource);
  }, []);

  // A Callback Link (?callback) opens the widget on arrival. The parameter is dropped from the
  // address so a reload does not reopen it; other parameters (UTM, gclid) and the hash stay.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has(CALLBACK_LINK_PARAM)) return;
    url.searchParams.delete(CALLBACK_LINK_PARAM);
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    openWidget('link');
  }, [openWidget]);

  const closeWidget = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      source,
      landingPage,
      openWidget,
      closeWidget,
    }),
    [isOpen, source, landingPage, openWidget, closeWidget]
  );

  return <CallbackContext.Provider value={value}>{children}</CallbackContext.Provider>;
};

export function useCallbackWidget(): CallbackContextType {
  const context = useContext(CallbackContext);
  if (!context) {
    throw new Error('useCallbackWidget must be used within a CallbackProvider');
  }
  return context;
}
