import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Box, Container, SimpleGrid, Stack, Title, Text, Group, Paper, ThemeIcon, Badge } from '@mantine/core';
import CertificatesList from '@/components/certificates/CertificatesList';

const certs = [
    {
        url: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=1200&q=80',
        title: 'Certyfikat Księgowy I',
        desc: 'Wydany przez Ministra Finansów',
        pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'
    },
    {
        url: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1200&q=80',
        title: 'Certyfikat Księgowy II',
        desc: 'Uprawnienia do usługowego prowadzenia ksiąg',
        pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'
    }
];

const CertificatesClient: React.FC = () => {
    return (
        <Stack gap={0} bg="white">
            {/* Header */}
            <Box component="section" bg="slate.9" py={{ base: 64, md: 96 }} ta="center">
                <Container size="md" px="md">
                    <Title order={1} c="white" fw={900} mb="md" style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', letterSpacing: '-0.025em' }}>
                        Nasze Certyfikaty
                    </Title>
                    <Text size="xl" c="slate.4">
                        Gwarancja najwyższych kompetencji potwierdzona państwowymi uprawnieniami.
                    </Text>
                </Container>
            </Box>

            {/* Main Content */}
            <Box component="section" py={96}>
                <Container size="xl" px="md">
                    <SimpleGrid cols={{ base: 1, lg: 2 }} spacing={64}>
                        <Stack gap="xl">
                            <Box>
                                <Badge size="lg" variant="filled" color="blue.0" c="blue.7" radius="lg" mb="sm">
                                    Ministerstwo Finansów
                                </Badge>
                                <Title order={2} fw={900} c="slate.9" lh={1.2} style={{ fontSize: 'clamp(1.875rem, 4vw, 2.25rem)' }} mb="md">
                                    Uprawnienia wydane przez Ministerstwo Finansów
                                </Title>
                                <Stack gap="md" c="slate.6" lh={1.6}>
                                    <Text>
                                        Działalność Biura Rachunkowego TEWU oparta jest na solidnych fundamentach prawnych i merytorycznych. Posiadamy <Text span fw={700}>Certyfikaty Księgowe wydane przez Ministra Finansów</Text>, które uprawniają nas do usługowego prowadzenia ksiąg rachunkowych.
                                    </Text>
                                    <Text>
                                        Uzyskanie takich certyfikatów wiąże się ze spełnieniem rygorystycznych wymogów dotyczących wykształcenia, praktyki zawodowej oraz nieposzlakowanej opinii. Dla naszych Klientów to pewność, że powierzają swoje finanse w ręce profesjonalistów, których wiedza została zweryfikowana na szczeblu państwowym.
                                    </Text>
                                </Stack>
                            </Box>

                            <Paper p="xl" radius="xl" withBorder bg="slate.0" style={{ borderColor: 'var(--mantine-color-slate-1)' }}>
                                <Group align="flex-start">
                                    <ThemeIcon variant="transparent" c="blue.6" size={32}>
                                        <ShieldCheck size={32} />
                                    </ThemeIcon>
                                    <Box style={{ flex: 1 }}>
                                        <Text fw={700} c="slate.9" size="lg" mb={4}>Pełne Bezpieczeństwo</Text>
                                        <Text c="slate.6" size="sm">Posiadane uprawnienia są uzupełnione wysoką polisą ubezpieczenia OC, co stanowi kompleksową ochronę dla obsługiwanych przez nas podmiotów.</Text>
                                    </Box>
                                </Group>
                            </Paper>
                        </Stack>

                        <CertificatesList certs={certs} />
                    </SimpleGrid>
                </Container>
            </Box>
        </Stack>
    );
};

export default CertificatesClient;
