import React from 'react';
import { Box, Container, Grid, Title, Text, Stack, Group, ThemeIcon, Image, SimpleGrid } from '@mantine/core';
import { REASONS_TO_TRUST } from '@/constants';
import classes from '@/components/layout/Layout.module.css';

export function WhyUs() {
    return (
        <Box component="section" py={96} bg="white" style={{ borderBottom: '1px solid var(--mantine-color-slate-1)' }}>
            <Container>
                {/* Upper Section: 7/12 content + 5/12 sticky images */}
                <Grid gutter={{ base: 48, lg: 80 }}>
                    <Grid.Col span={{ base: 12, lg: 7 }}>
                        <Stack gap={48}>
                            {/* Header */}
                            <Box>
                                <Title order={2} fw={900} c="slate.9" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.025em' }} mb="md">
                                    Dlaczego warto nam zaufać?
                                </Title>
                                <Text size="lg" c="slate.6" lh={1.6}>
                                    W TEWU wierzymy, że księgowość to co więcej niż tylko liczby. To fundament Twojego biznesu, który wymaga solidności, nowoczesnego podejścia i pełnej transparentności.
                                </Text>
                            </Box>

                            {/* First 3 Reasons */}
                            <Stack gap={40}>
                                {REASONS_TO_TRUST.slice(0, 3).map((reason, index) => (
                                    <Group key={index} align="flex-start" wrap="nowrap" gap="lg" className={classes.reasonRow}>
                                        <ThemeIcon
                                            size={64}
                                            radius="lg"
                                            variant="transparent"
                                            className={classes.reasonIcon}
                                            style={{ flexShrink: 0 }}
                                        >
                                            {reason.icon}
                                        </ThemeIcon>
                                        <Box>
                                            <Text fw={700} c="slate.9" size="xl" mb={8} lh={1.2}>{reason.title}</Text>
                                            <Text c="slate.6" lh={1.6} maw={600}>{reason.description}</Text>
                                        </Box>
                                    </Group>
                                ))}
                            </Stack>
                        </Stack>
                    </Grid.Col>

                    {/* Floating Images Column */}
                    <Grid.Col span={{ base: 12, lg: 5 }} visibleFrom="lg">
                        <Box pos="relative" h={480} style={{ position: 'sticky', top: 128 }}>
                            {/* First image - offset down */}
                            <Box
                                pos="absolute"
                                top={48}
                                left={0}
                                w="calc(50% - 8px)"
                                style={{ aspectRatio: '3/4', zIndex: 1 }}
                            >
                                <Image
                                    src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80"
                                    alt="Zespół przy pracy"
                                    radius="xl"
                                    w="100%"
                                    h="100%"
                                    fit="cover"
                                    style={{ boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.15)' }}
                                />
                            </Box>
                            {/* Second image - at top */}
                            <Box
                                pos="absolute"
                                top={0}
                                right={0}
                                w="calc(50% - 8px)"
                                style={{ aspectRatio: '3/4', zIndex: 2 }}
                            >
                                <Image
                                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
                                    alt="Spotkanie biznesowe"
                                    radius="xl"
                                    w="100%"
                                    h="100%"
                                    fit="cover"
                                    style={{ boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.15)' }}
                                />
                            </Box>
                        </Box>
                    </Grid.Col>
                </Grid>

                {/* Lower Section: Remaining reasons in 2-column grid */}
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing={{ base: 32, md: 48 }} verticalSpacing={40} mt={48}>
                    {REASONS_TO_TRUST.slice(3).map((reason, index) => (
                        <Group key={index} align="flex-start" wrap="nowrap" gap="lg" className={classes.reasonRow}>
                            <ThemeIcon
                                size={64}
                                radius="lg"
                                variant="transparent"
                                className={classes.reasonIcon}
                                style={{ flexShrink: 0 }}
                            >
                                {reason.icon}
                            </ThemeIcon>
                            <Box>
                                <Text fw={700} c="slate.9" size="xl" mb={8} lh={1.2}>{reason.title}</Text>
                                <Text c="slate.6" lh={1.6}>{reason.description}</Text>
                            </Box>
                        </Group>
                    ))}
                </SimpleGrid>
            </Container>
        </Box>
    );
}
