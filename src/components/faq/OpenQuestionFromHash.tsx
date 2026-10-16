"use client";

import { useEffect } from 'react';

/**
 * Opens the question named in the URL hash (/faq#ulga-na-start), on load and on later hash changes.
 * The only part of the FAQ page that needs the browser, so the rest renders on the server.
 */
export function OpenQuestionFromHash() {
  useEffect(() => {
    const openFromHash = () => {
      // No decodeURIComponent: question ids are ASCII kebab-case (content test), and decoding a
      // stray "%" (/faq#100%) would throw and take the whole page down.
      const id = window.location.hash.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!(target instanceof HTMLDetailsElement)) return;
      target.open = true;
      target.scrollIntoView?.({ block: 'start' });
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, []);
  return null;
}
