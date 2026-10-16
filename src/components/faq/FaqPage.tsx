import React from 'react';
import { Anchor, Badge, Box, Container, Group, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { Building2, HandCoins, Landmark, MessageCircleQuestionMark, ReceiptText, Rocket, type LucideIcon } from 'lucide-react';
import { FaqList } from '@/components/faq/FaqList';
import { OpenQuestionFromHash } from '@/components/faq/OpenQuestionFromHash';
import { BesidePhoto, OfficePicture } from '@/components/OfficePicture';
import { ReceptionCta } from '@/components/ReceptionCta';
import { RichText } from '@/components/RichText';
import { TextLink } from '@/components/TextLink';
import type { FaqCategoryId, FaqPageContent, FaqQuestion } from '@/content/faq/types';
import { formatLongDate } from '@/lib/format-date';
import { OFFICE_PHOTOS } from '@/lib/office-photos';
import { formatCount, singularOrPlural } from '@/lib/plural';
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
          {singularOrPlural(question.sources.length, sourcesLabel)}:{' '}
          {question.sources.map((source, i) => (
            <React.Fragment key={source.href}>
              {i > 0 && ', '}
              <TextLink href={source.href}>{source.label}</TextLink>
            </React.Fragment>
          ))}
        </Text>
      )}
    </Stack>
  );
}

export default function FaqPage({ content, updatedAt }: { content: FaqPageContent; updatedAt: string }) {
  const { locale, hero, categories, cta } = content;
  return (
    <Stack gap={0} bg="white" className={classes.page}>
      <OpenQuestionFromHash />
      <Box component="section" bg="slate.9" py={{ base: 56, md: 88 }} className={classes.hero}>
        <MessageCircleQuestionMark aria-hidden="true" className={classes.heroMotif} />
        <Container size="xl" px="md" pos="relative">
          <BesidePhoto>
            <Box>
              <Badge variant="filled" color="brandBlue.0" c="brandBlue.7" mb="md">
                {hero.badge}
              </Badge>
              <Title order={1} c="white" mb="md" lts="-0.025em">
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
            {/* The hero's largest element (LCP on desktop), so it loads first. */}
            <OfficePicture photo={OFFICE_PHOTOS.exterior} alt={hero.imageAlt} priority />
          </BesidePhoto>
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
                <Title order={2} id={titleId} c="slate.9">
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

      <ReceptionCta id={CONTACT_ID} title={cta.title} description={cta.description} imageAlt={cta.imageAlt} source="faq" />
    </Stack>
  );
}
