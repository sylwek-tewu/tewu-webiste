"use client";

import React from 'react';
import Link from 'next/link';
import { Anchor } from '@mantine/core';
import { isExternalHref } from '@/lib/href';

/**
 * An underlined link in body copy: official sites open in a new tab, our own pages go through
 * next/link. A client component because `component={Link}` cannot cross from server code.
 */
export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return isExternalHref(href) ? (
    <Anchor href={href} target="_blank" rel="noopener noreferrer" c="brandBlue.7" underline="always">
      {children}
    </Anchor>
  ) : (
    <Anchor component={Link} href={href} c="brandBlue.7" underline="always">
      {children}
    </Anchor>
  );
}
