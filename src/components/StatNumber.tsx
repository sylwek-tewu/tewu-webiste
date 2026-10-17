import React from 'react';
import { Text, type TextProps } from '@mantine/core';

/** A large figure such as „500+” or „25+”; colour and spacing come from the caller. */
export function StatNumber({ children, ...props }: TextProps & { children: React.ReactNode }) {
  return (
    <Text fw={900} fz="2.25rem" {...props}>
      {children}
    </Text>
  );
}
