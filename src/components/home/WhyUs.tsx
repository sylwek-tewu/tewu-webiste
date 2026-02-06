import React from 'react';
import { Box, Container, Grid, Title, Text, Stack, Group, ThemeIcon, Image } from '@mantine/core';
import { REASONS_TO_TRUST } from '@/constants';

export function WhyUs() {
    return (
        <Box component="section" py={96} bg="white">
            <Container size="xl">
                <Box mb={64}>
                    <Text fw={900} c="brandBlue" tt="uppercase" style={{ letterSpacing: '0.1em' }} size="sm" mb="xs">
                        Dlaczego my?
                    </Text>
                    <Title order={2} fw={900} c="slate.9" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                        Dlaczego warto nam zaufać?
                    </Title>
                </Box>

                <Grid gutter={64} align="center">
                    <Grid.Col span={{ base: 12, lg: 6 }}>
                        <Stack gap="xl">
                            {REASONS_TO_TRUST.map((reason, index) => (
                                <Group key={index} align="flex-start" wrap="nowrap">
                                    <ThemeIcon size={40} radius="md" variant="light" color="brandBlue" flex={0} style={{ flexShrink: 0 }}>
                                        {reason.icon}
                                    </ThemeIcon>
                                    <div>
                                        <Text fw={700} c="slate.9" size="lg" mb={4}>{reason.title}</Text>
                                        <Text c="slate.6" lh={1.5}>{reason.description}</Text>
                                    </div>
                                </Group>
                            ))}
                        </Stack>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, lg: 6 }} visibleFrom="lg">
                        <Box pos="relative" h={600} w="100%">
                            {/* Floating Images Placeholder - emulating the stack */}
                            <Box pos="absolute" top={0} right={0} w="80%" h="70%" style={{ zIndex: 1 }}>
                                <Image
                                    src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
                                    alt="Meeting"
                                    radius="md"
                                    h="100%"
                                    w="100%"
                                    fit="cover"
                                    style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                                />
                            </Box>
                            <Box pos="absolute" bottom={0} left={0} w="60%" h="50%" style={{ zIndex: 2 }}>
                                <Image
                                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
                                    alt="Office"
                                    radius="md"
                                    h="100%"
                                    w="100%"
                                    fit="cover"
                                    style={{ border: '4px solid white', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                                />
                            </Box>
                        </Box>
                    </Grid.Col>
                </Grid>
            </Container>
        </Box>
    );
}
