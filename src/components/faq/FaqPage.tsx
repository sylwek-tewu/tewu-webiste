"use client";

import React, { useEffect } from 'react';
import { Anchor, Badge, Box, Container, Group, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { Building2, HandCoins, Landmark, MessageCircleQuestionMark, ReceiptText, Rocket, type LucideIcon } from 'lucide-react';
import { FaqList } from '@/components/faq/FaqList';
import { QuoteActions } from '@/components/QuoteActions';
import { RichText } from '@/components/RichText';
import type { FaqCategoryId, FaqPageContent, FaqQuestion } from '@/content/faq/types';
import { formatLongDate } from '@/lib/format-date';
import { OFFICE_PHOTOS, type OfficePhoto } from '@/lib/office-photos';
import { formatCount } from '@/lib/plural';
import classes from './FaqPage.module.css';

/** Anchor of the closing contact section; outside the question and category id namespace. */
const CONTACT_ID = 'kontakt';

const CATEGORY_ICONS: Record<FaqCategoryId, LucideIcon> = {
  'o-biurze': Building2,
  'zakladanie-firmy': Rocket,
  'podatki-vat-ksef': ReceiptText,
  zus: HandCoins,
  'rachunek-firmowy': Landmark,
};

/** Opens the question named in the URL hash (/faq#ulga-na-start), on load and on later hash changes. */
function useOpenQuestionFromHash() {
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
}

function Photo({ photo, alt, priority = false }: { photo: OfficePhoto; alt: string; priority?: boolean }) {
  return (
    <picture>
      <source type="image/avif" srcSet={photo.avif} />
      <img
        src={photo.jpg}
        alt={alt}
        width={photo.width}
        height={photo.height}
        decoding="async"
        // The building photo is the hero's largest element (LCP on desktop), so it loads first.
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        className={classes.photo}
      />
    </picture>
  );
}

function Answer({ question, sourcesLabel }: { question: FaqQuestion; sourcesLabel: FaqPageContent['sourcesLabel'] }) {
  return (
    <Stack gap="xs">
      {question.answer.map((paragraph) => (
        <Text key={paragraph} c="slate.7">
          <RichText text={paragraph} />
        </Text>
      ))}
      {question.sources && (
        <Text size="sm" c="slate.6">
          {question.sources.length === 1 ? sourcesLabel.one : sourcesLabel.many}:{' '}
          {question.sources.map((source, i) => (
            <React.Fragment key={source.href}>
              {i > 0 && ', '}
              <Anchor href={source.href} target="_blank" rel="noopener noreferrer" c="brandBlue.7" underline="always">
                {source.label}
              </Anchor>
            </React.Fragment>
          ))}
        </Text>
      )}
    </Stack>
  );
}

export default function FaqPage({ content, updatedAt }: { content: FaqPageContent; updatedAt: string }) {
  const { locale, hero, categories, cta } = content;
  useOpenQuestionFromHash();

  return (
    <Stack gap={0} bg="white" className={classes.page}>
      <Box component="section" bg="slate.9" py={{ base: 56, md: 88 }} className={classes.hero}>
        <MessageCircleQuestionMark aria-hidden="true" className={classes.heroMotif} />
        <Container size="xl" px="md" pos="relative">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={{ base: 40, md: 64 }} style={{ alignItems: 'center' }}>
            <Box>
              <Badge size="lg" variant="filled" color="blue.0" c="blue.7" radius="lg" mb="md">
                {hero.badge}
              </Badge>
              <Title order={1} c="white" fw={900} mb="md" style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', letterSpacing: '-0.025em' }}>
                {hero.title}
              </Title>
              <Text size="xl" c="slate.4" mb="lg">
                {hero.lead}
              </Text>
              <Text size="sm" c="slate.4">
                {hero.updatedPrefix} <time dateTime={updatedAt}>{formatLongDate(locale, updatedAt)}</time>
              </Text>
              <Text size="sm" c="slate.4" mt={4}>
                {hero.disclaimer}{' '}
                <Anchor href={`#${CONTACT_ID}`} underline="always" inherit className={classes.disclaimerLink}>
                  {hero.disclaimerLink}
                </Anchor>
              </Text>
            </Box>
            <Photo photo={OFFICE_PHOTOS.exterior} alt={hero.imageAlt} priority />
          </SimpleGrid>
        </Container>
      </Box>

      <Box py={{ base: 40, md: 56 }}>
        <Container size="xl" px="md">
          <Box component="nav" aria-label={content.categoriesLabel}>
            <SimpleGrid cols={{ base: 1, xs: 2, md: 5 }} spacing="md">
              {categories.map(({ id, title, questions }) => {
                const Icon = CATEGORY_ICONS[id];
                return (
                  <Paper key={id} component="a" href={`#${id}`} p="lg" radius="lg" withBorder className={classes.tile}>
                    <ThemeIcon size={44} radius="md" variant="light" mb="sm" aria-hidden="true">
                      <Icon size={22} />
                    </ThemeIcon>
                    <Text fw={800} c="slate.9" lh={1.25}>
                      {title}
                    </Text>
                    <Text size="sm" c="slate.6">
                      {formatCount(locale, questions.length, content.questionCount)}
                    </Text>
                  </Paper>
                );
              })}
            </SimpleGrid>
          </Box>
        </Container>
      </Box>

      {categories.map((category, index) => {
        const Icon = CATEGORY_ICONS[category.id];
        const titleId = `${category.id}-tytul`;
        return (
          <Box
            key={category.id}
            component="section"
            id={category.id}
            aria-labelledby={titleId}
            py={{ base: 56, md: 80 }}
            bg={index % 2 === 0 ? 'slate.0' : 'white'}
            className={classes.category}
          >
            <Container size="md" px="md">
              <Group gap="sm" mb="xl" wrap="nowrap">
                <ThemeIcon size={44} radius="md" variant="light" aria-hidden="true">
                  <Icon size={22} />
                </ThemeIcon>
                <Title order={2} id={titleId} fw={900} c="slate.9" fz={{ base: 'xl', md: '2rem' }}>
                  {category.title}
                </Title>
              </Group>
              <FaqList
                items={category.questions.map((question) => ({
                  id: question.id,
                  question: question.question,
                  answer: <Answer question={question} sourcesLabel={content.sourcesLabel} />,
                }))}
              />
            </Container>
          </Box>
        );
      })}

      <Box component="section" id={CONTACT_ID} py={{ base: 64, md: 96 }} bg="brandBlue.6" className={classes.category}>
        <Container size="xl" px="md">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={{ base: 40, md: 64 }} style={{ alignItems: 'center' }}>
            <Box>
              <Title order={2} c="white" fw={900} mb="md" fz={{ base: 'xl', md: '2.25rem' }}>
                {cta.title}
              </Title>
              <Text c="blue.0" size="lg" mb="xl">
                {cta.description}
              </Text>
              <QuoteActions variant="white" source="faq" justify="flex-start" />
            </Box>
            <Photo photo={OFFICE_PHOTOS.reception} alt={cta.imageAlt} />
          </SimpleGrid>
        </Container>
      </Box>
    </Stack>
  );
}
