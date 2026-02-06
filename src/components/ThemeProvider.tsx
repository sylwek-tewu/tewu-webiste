"use client";

import React from 'react';
import { MantineProvider } from '@mantine/core';
import { theme, resolver } from '@/theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    return (
        <MantineProvider theme={theme} cssVariablesResolver={resolver}>
            {children}
        </MantineProvider>
    );
}
