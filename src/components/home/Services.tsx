"use client";

import React from 'react';
import { Box, Container, SimpleGrid, Paper, ThemeIcon, Text, Title, VisuallyHidden } from '@mantine/core';
import { ArrowRight, Building2, Calculator, FileDigit, Users, ClipboardCheck, FileText, Scale } from 'lucide-react';
import Link from 'next/link';
import { Eyebrow } from '@/components/Eyebrow';
import classes from '@/components/layout/Layout.module.css';
import { localizePath, useLocale } from '@/i18n/LocaleContext';
import type { Locale } from '@/i18n/types';
import { PATHS } from '@/lib/paths';
import { servicePagePath, servicePageSlugForServiceItem } from '@/lib/service-pages';

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  'pelna-ksiegowosc': <Building2 size={24} />,
  'kpir': <Calculator size={24} />,
  'ryczalt': <FileDigit size={24} />,
  'kadry-place': <Users size={24} />,
  'zus-us': <ClipboardCheck size={24} />,
  'deklaracje': <FileText size={24} />,
  'reprezentacja': <Scale size={24} />,
};

function cardPath(serviceId: string, locale: Locale, fallback: string): string {
  const slug = servicePageSlugForServiceItem(serviceId);
  return slug ? servicePagePath(locale, slug) : fallback;
}

export function Services() {
    const { t, locale } = useLocale();
    const servicesPath = localizePath(PATHS.services, locale);
    const items = t.servicesPage.items;

    return (
        <Box component="section" py={96} bg="slate.0">
            <Container ta="center" mb={64}>
                <Eyebrow>{t.home.services.sectionLabel}</Eyebrow>
                <Title order={2} c="slate.9">
                    {t.home.services.title}
                </Title>
            </Container>
            <Container>
                <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} spacing="lg">
                    {items.slice(0, 4).map((service) => (
                        <Paper
                            key={service.id}
                            p="xl"
                            radius="lg"
                            withBorder
                            bg="white"
                            className={classes.serviceCard}
                            style={{
                                borderColor: 'var(--mantine-color-slate-1)',
                            }}
                        >
                            <ThemeIcon
                                variant="transparent"
                                size={48}
                                radius="xl"
                                mb="lg"
                                className={classes.hoverIcon}
                            >
                                {SERVICE_ICONS[service.id] || <Building2 size={24} />}
                            </ThemeIcon>
                            <Title order={3} size="h4" c="slate.9" mb="sm">
                                {service.title}
                            </Title>
                            <Text size="sm" c="slate.6" lh={1.6} mb="lg" lineClamp={2}>
                                {service.description}
                            </Text>
                            <Link href={cardPath(service.id, locale, servicesPath)} className={classes.moreLink}>
                                {t.home.services.more}
                                <VisuallyHidden>: {service.title}</VisuallyHidden> <ArrowRight size={16} />
                            </Link>
                        </Paper>
                    ))}
                </SimpleGrid>
                <Box mt={64} ta="center">
                    <Link href={servicesPath} className={classes.textLink}>
                        {t.home.services.viewAll(items.length)} <ArrowRight size={20} />
                    </Link>
                </Box>
            </Container>
        </Box>
    );
}
