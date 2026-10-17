import React from 'react';
import { Box, Container, Text, Title } from '@mantine/core';

interface PageHeroProps {
  title: React.ReactNode;
  lead: React.ReactNode;
  /** Shown under the lead, e.g. the quote buttons on the service pages. */
  children?: React.ReactNode;
}

/** The dark band that opens a subpage: the page's H1 and a lead line, centred. */
export function PageHero({ title, lead, children }: PageHeroProps) {
  return (
    <Box component="section" bg="slate.9" py={{ base: 64, md: 96 }} ta="center">
      <Container size="md" px="md">
        <Title order={1} c="white" mb="md">
          {title}
        </Title>
        <Text size="xl" c="slate.4" mb={children ? 'xl' : undefined}>
          {lead}
        </Text>
        {children}
      </Container>
    </Box>
  );
}
