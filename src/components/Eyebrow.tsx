import React from 'react';
import { Text } from '@mantine/core';

/** Small uppercase label above a section's H2 („Nasze usługi”, „Nasze wartości”). */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <Text fw={900} c="brandBlue.6" tt="uppercase" lts="0.1em" size="sm" mb="xs">
      {children}
    </Text>
  );
}
