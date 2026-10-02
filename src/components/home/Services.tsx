"use client";

import React from 'react';
import { Box, Container, SimpleGrid, Paper, ThemeIcon, Text, Title } from '@mantine/core';
import { ArrowRight, Building2, Calculator, FileDigit, Users, ClipboardCheck, FileText, Scale, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import classes from '@/components/layout/Layout.module.css';
import { useLocale } from '@/i18n/LocaleContext';

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  'pelna-ksiegowosc': <Building2 size={24} />,
  'kpir': <Calculator size={24} />,
  'ryczalt': <FileDigit size={24} />,
  'kadry-place': <Users size={24} />,
  'zus-us': <ClipboardCheck size={24} />,
  'deklaracje': <FileText size={24} />,
  'reprezentacja': <Scale size={24} />,
  'doradztwo': <TrendingUp size={24} />,
};

export function Services() {
    const { t, locale } = useLocale();
    const servicesPath = locale === 'uk' ? '/uk/uslugi' : '/uslugi';
    const items = t.servicesPage.items;

    return (
        <Box component="section" py={96} bg="slate.0">
            <Container ta="center" mb={64}>
                <Text fw={900} c="brandBlue" tt="uppercase" style={{ letterSpacing: '0.1em' }} size="sm" mb="xs">
                    {t.home.services.sectionLabel}
                </Text>
                <Title order={2} fw={900} c="slate.9" style={{ letterSpacing: '-0.025em' }}>
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
                            <Title order={4} fw={700} c="slate.9" mb="sm" lh={1.3}>
                                {service.title}
                            </Title>
                            <Text size="sm" c="slate.6" lh={1.6} mb="lg" lineClamp={2}>
                                {service.description}
                            </Text>
                            <Link href={servicesPath} className={classes.moreLink}>
                                {t.home.services.more} <ArrowRight size={16} />
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
