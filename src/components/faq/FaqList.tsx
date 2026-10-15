"use client";

import React from 'react';
import { Box, Paper, Stack } from '@mantine/core';
import classes from './FaqList.module.css';

export interface FaqListItem {
  /** Anchor of the question (/faq#id); service pages leave it out. */
  id?: string;
  question: string;
  answer: React.ReactNode;
}

/** Questions as native <details>: the answers stay in the HTML for search engines and work without JavaScript. */
export function FaqList({ items }: { items: FaqListItem[] }) {
  return (
    <Stack gap="sm">
      {items.map(({ id, question, answer }) => (
        <Paper key={question} id={id} component="details" p="lg" radius="md" withBorder className={classes.item}>
          <summary>{question}</summary>
          <Box mt="sm" c="slate.7">
            {answer}
          </Box>
        </Paper>
      ))}
    </Stack>
  );
}
