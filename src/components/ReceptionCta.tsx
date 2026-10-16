import React from 'react';
import { Box, Container, Text, Title } from '@mantine/core';
import { BesidePhoto, OfficePicture } from '@/components/OfficePicture';
import { QuoteActions } from '@/components/QuoteActions';
import type { CallbackSource } from '@/lib/callback/types';
import { OFFICE_PHOTOS } from '@/lib/office-photos';
import classes from './ReceptionCta.module.css';

interface ReceptionCtaProps {
  title: string;
  description: string;
  /** The reception photo's alt text, in the page's language. */
  imageAlt: string;
  /** Recorded with the callback lead, as in QuoteActions. */
  source: CallbackSource;
  /** Anchor for links to this section (the FAQ disclaimer links to #kontakt). */
  id?: string;
}

/**
 * The closing call to action of the FAQ and service pages: the quote button and the number the Prezes
 * answers, next to his photo in the reception. The photo goes under the buttons on phones.
 */
export function ReceptionCta({ title, description, imageAlt, source, id }: ReceptionCtaProps) {
  return (
    <Box component="section" id={id} py={{ base: 64, md: 96 }} bg="brandBlue.6" className={classes.section}>
      <Container size="xl" px="md">
        <BesidePhoto>
          <Box>
            <Title order={2} c="white" mb="md">
              {title}
            </Title>
            <Text c="brandBlue.0" size="lg" mb="xl">
              {description}
            </Text>
            <QuoteActions variant="white" source={source} align="start" />
          </Box>
          <OfficePicture photo={OFFICE_PHOTOS.reception} alt={imageAlt} />
        </BesidePhoto>
      </Container>
    </Box>
  );
}
