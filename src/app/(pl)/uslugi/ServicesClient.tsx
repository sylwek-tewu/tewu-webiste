"use client";

import React from 'react';
import { ArrowRight, CheckCircle2, Building2, Calculator, FileDigit, Users, ClipboardCheck, FileText, Scale, TrendingUp, Receipt, Rocket } from 'lucide-react';
import { Box, Container, SimpleGrid, Stack, Title, Text, Button, ThemeIcon, Group, Paper } from '@mantine/core';
import Link from 'next/link';
import classes from './ServicesClient.module.css';
import { useLocale } from '@/i18n/LocaleContext';
import { servicePagePath, servicePageSlugForServiceItem } from '@/lib/service-pages';
import { wrappingButtonStyles } from '@/components/layout/wrappingButtonStyles';

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  'pelna-ksiegowosc': <Building2 size={24} />,
  'kpir': <Calculator size={24} />,
  'ryczalt': <FileDigit size={24} />,
  'kadry-place': <Users size={24} />,
  'zus-us': <ClipboardCheck size={24} />,
  'deklaracje': <FileText size={24} />,
  'reprezentacja': <Scale size={24} />,
  'doradztwo': <TrendingUp size={24} />,
  'ksef': <Receipt size={24} />,
  'inkubator-spolek': <Rocket size={24} />,
};

export default function ServicesClient() {
    const { t, locale } = useLocale();
    const contactPath = locale === 'uk' ? '/uk/kontakt' : '/kontakt';

    return (
        <Stack gap={0} bg="white">
            {/* Hero Section */}
            <Box component="section" bg="slate.9" py={{ base: 64, md: 96 }} ta="center">
                <Container size="md" px="md">
                    <Title order={1} c="white" fw={900} mb="md" style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', letterSpacing: '-0.025em' }}>
                        {t.servicesPage.header.title}
                    </Title>
                    <Text size="xl" c="slate.4">
                        {t.servicesPage.header.subtitle}
                    </Text>
                </Container>
            </Box>

            {/* Services Grid */}
            <Box component="section" py={96} bg="white">
                <Container size="xl" px={{ base: 'md', sm: 'xl' }}>
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
                        {t.servicesPage.items.map((service) => {
                            const slug = servicePageSlugForServiceItem(service.id);
                            const body = (
                                <>
                                    <Box w={56} h={56} mb="lg" className={classes.iconContainer}>
                                        {SERVICE_ICONS[service.id] || <Building2 size={24} />}
                                    </Box>
                                    <Title order={3} fw={700} c="slate.9" mb="sm" lh={1.3} fz="xl">
                                        {service.title}
                                    </Title>
                                    <Text size="sm" c="slate.6" lh={1.6}>
                                        {service.description}
                                    </Text>
                                    {slug && (
                                        <Group gap={4} mt="md" c="brandBlue.6" fw={700} fz="sm">
                                            {t.home.services.more} <ArrowRight size={16} />
                                        </Group>
                                    )}
                                </>
                            );
                            return slug ? (
                                <Paper
                                    key={service.id}
                                    component={Link}
                                    href={servicePagePath(locale, slug)}
                                    p="xl"
                                    radius="xl"
                                    withBorder
                                    className={classes.serviceCard}
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    {body}
                                </Paper>
                            ) : (
                                <Paper key={service.id} p="xl" radius="xl" withBorder className={classes.serviceCard}>
                                    {body}
                                </Paper>
                            );
                        })}
                    </SimpleGrid>
                </Container>
            </Box>

            {/* CTA Section */}
            <Box component="section" py={96} bg="brandBlue.6">
                <Container size="md" px="md" ta="center">
                    <Title order={2} c="white" fw={900} mb="lg" fz={{ base: 'xl', md: '2.25rem' }}>
                        {t.servicesPage.cta.title}
                    </Title>
                    <Text c="blue.1" size="lg" mb="xl" maw={600} mx="auto">
                        {t.servicesPage.cta.description}
                    </Text>
                    <Link href={contactPath} style={{ textDecoration: 'none' }}>
                        <Button
                            component="span"
                            size="xl"
                            radius="lg"
                            fw={800}
                            px={{ base: 'lg', sm: 40 }}
                            py={20}
                            styles={wrappingButtonStyles}
                            rightSection={<ArrowRight size={20} />}
                            className={classes.ctaButton}
                        >
                            {t.servicesPage.cta.button}
                        </Button>
                    </Link>
                </Container>
            </Box>

            {/* Additional Values */}
            <Box component="section" py={96} bg="slate.0">
                <Container size="xl" px={{ base: 'md', sm: 'xl' }}>
                    <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
                        <Group gap="md" align="flex-start" wrap="nowrap">
                            <ThemeIcon size={32} variant="transparent" c="green.5">
                                <CheckCircle2 size={32} />
                            </ThemeIcon>
                            <Box>
                                <Title order={4} fw={700} c="slate.9" mb="xs" fz="lg">
                                    {t.servicesPage.values.securityTitle}
                                </Title>
                                <Text size="sm" c="slate.6">
                                    {t.servicesPage.values.securityDesc}
                                </Text>
                            </Box>
                        </Group>
                        <Group gap="md" align="flex-start" wrap="nowrap">
                            <ThemeIcon size={32} variant="transparent" c="green.5">
                                <CheckCircle2 size={32} />
                            </ThemeIcon>
                            <Box>
                                <Title order={4} fw={700} c="slate.9" mb="xs" fz="lg">
                                    {t.servicesPage.values.timelinessTitle}
                                </Title>
                                <Text size="sm" c="slate.6">
                                    {t.servicesPage.values.timelinessDesc}
                                </Text>
                            </Box>
                        </Group>
                        <Group gap="md" align="flex-start" wrap="nowrap">
                            <ThemeIcon size={32} variant="transparent" c="green.5">
                                <CheckCircle2 size={32} />
                            </ThemeIcon>
                            <Box>
                                <Title order={4} fw={700} c="slate.9" mb="xs" fz="lg">
                                    {t.servicesPage.values.modernityTitle}
                                </Title>
                                <Text size="sm" c="slate.6">
                                    {t.servicesPage.values.modernityDesc}
                                </Text>
                            </Box>
                        </Group>
                    </SimpleGrid>
                </Container>
            </Box>
        </Stack>
    );
}
