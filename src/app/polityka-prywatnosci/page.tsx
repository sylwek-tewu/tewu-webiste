import React from 'react';
import type { Metadata } from 'next';
import { Container, Title, Text, Stack, Paper, Box, Group, ThemeIcon, Divider } from '@mantine/core';
import { Shield, Mail, Phone, MapPin, Building2, Lock, AlertTriangle } from 'lucide-react';
import { CONTACT_DETAILS, COMPANY_FULL_NAME } from '@/constants';

export const metadata: Metadata = {
  title: 'Polityka Prywatności | Biuro Rachunkowe TEWU',
  description: 'Zasady przetwarzania i ochrony danych osobowych w Biurze Rachunkowym TEWU Sp. z o.o. w Szczecinie.',
};

/**
 * SZKIC POLITYKI PRYWATNOŚCI - DO WERYFIKACJI PRAWNEJ PRZEZ TEWU
 * Dokument reguluje zasady przetwarzania danych w serwisie ze szczególnym uwzględnieniem
 * formularza szybkiego kontaktu / widżetu call-back „Bezpłatna wycena – oddzwonimy”.
 */
export default function PrivacyPolicyPage() {
  return (
    <Box component="section" py={{ base: 64, md: 96 }} bg="slate.0">
      <Container size="md" px="md">
        <Stack gap="xl">
          {/* Header */}
          <Box ta="center" mb="lg">
            <Group justify="center" mb="sm">
              <ThemeIcon size={52} radius="xl" bg="blue.0" c="brandBlue.6">
                <Shield size={28} />
              </ThemeIcon>
            </Group>
            <Title order={1} fw={900} c="slate.9" style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', letterSpacing: '-0.025em' }}>
              Polityka Prywatności
            </Title>
            <Text c="slate.5" size="sm" mt="xs">
              Biuro Rachunkowe TEWU Sp. z o.o. • Ostatnia aktualizacja: październik 2026
            </Text>
          </Box>

          {/* Main Content Card */}
          <Paper p={{ base: 'xl', md: 40 }} radius="xl" shadow="sm" withBorder bg="white" style={{ borderColor: 'var(--mantine-color-slate-2)' }}>
            <Stack gap="xl">
              {/* Section 1 */}
              <div>
                <Title order={2} size="h3" fw={800} c="slate.9" mb="sm">
                  1. Administrator Danych Osobowych
                </Title>
                <Text size="sm" c="slate.7" lh={1.7} mb="md">
                  Administratorem Twoich danych osobowych jest <strong>{COMPANY_FULL_NAME}</strong> z siedzibą w Szczecinie przy
                  ul. {CONTACT_DETAILS.address}, wpisana do rejestru przedsiębiorców Krajowego Rejestru Sądowego pod numerem
                  KRS: 0000320281, NIP: 9552249417, REGON: 320601499.
                </Text>
                <Group gap="lg" wrap="wrap">
                  <Group gap="xs">
                    <Mail size={16} color="var(--mantine-color-brandBlue-6)" />
                    <Text size="xs" fw={600} c="slate.8">{CONTACT_DETAILS.email}</Text>
                  </Group>
                  <Group gap="xs">
                    <Phone size={16} color="var(--mantine-color-brandBlue-6)" />
                    <Text size="xs" fw={600} c="slate.8">{CONTACT_DETAILS.phone}</Text>
                  </Group>
                  <Group gap="xs">
                    <MapPin size={16} color="var(--mantine-color-brandBlue-6)" />
                    <Text size="xs" fw={600} c="slate.8">Szczecin, Polska</Text>
                  </Group>
                </Group>
              </div>

              <Divider color="slate.1" />

              {/* Section 2 */}
              <div>
                <Title order={2} size="h3" fw={800} c="slate.9" mb="sm">
                  2. Cele i podstawy prawne przetwarzania danych
                </Title>
                <Text size="sm" c="slate.7" lh={1.7} mb="sm">
                  Dane osobowe zbierane za pośrednictwem serwisu przetwarzane są w następujących celach:
                </Text>
                <Stack gap="xs" pl="sm">
                  <Text size="sm" c="slate.7" lh={1.7}>
                    • <strong>Realizacja kontaktu telefonicznego i przedstawienie wyceny:</strong> Wycena usług księgowych
                    w TEWU ma charakter indywidualny i powstaje w drodze rozmowy. Podstawą prawną jest podjęcie działań
                    na żądanie osoby, której dane dotyczą, przed zawarciem umowy (art. 6 ust. 1 lit. b RODO) lub prawnie
                    uzasadniony interes Administratora polegający na obsłudze zgłoszeń klientów (art. 6 ust. 1 lit. f RODO).
                    {/* TODO: zweryfikować z radcą prawnym ostateczną kwalifikację lit. b vs lit. f */}
                  </Text>
                  <Text size="sm" c="slate.7" lh={1.7}>
                    • <strong>Zabezpieczenie przed nadużyciami i spamem:</strong> Stosowanie mechanizmów technicznych
                    (m.in. honeypot, weryfikacja czasu wysłania) na podstawie art. 6 ust. 1 lit. f RODO (uzasadniony interes
                    polegający na zapewnieniu bezpieczeństwa i ciągłości działania serwisu).
                  </Text>
                  <Text size="sm" c="slate.7" lh={1.7}>
                    • <strong>Ustalenie, obrona lub dochodzenie ewentualnych roszczeń:</strong> Na podstawie art. 6 ust. 1 lit. f RODO.
                  </Text>
                </Stack>
              </div>

              <Divider color="slate.1" />

              {/* Section 3 */}
              <div>
                <Title order={2} size="h3" fw={800} c="slate.9" mb="sm">
                  3. Zakres zbieranych danych
                </Title>
                <Text size="sm" c="slate.7" lh={1.7}>
                  W ramach formularza „Bezpłatna wycena – oddzwonimy” zbieramy wyłącznie dane niezbędne do wykonania
                  rozmowy telefonicznej:
                </Text>
                <Stack gap="xs" pl="sm" mt="xs">
                  <Text size="sm" c="slate.7">• Numer telefonu kontaktowego (wymagany),</Text>
                  <Text size="sm" c="slate.7">• Preferowaną porę rozmowy (np. 8:00–12:00, 12:00–16:00, 17:00–18:00 lub jak najszybciej),</Text>
                  <Text size="sm" c="slate.7">• Opcjonalny ogólny temat zapytania (np. spółka z o.o., JDG, kadry i płace),</Text>
                  <Text size="sm" c="slate.7">• Techniczny znacznik czasu i miejsce wywołania formularza na stronie.</Text>
                </Stack>
                <Text size="xs" c="slate.5" mt="sm">
                  Formularz nie wymaga podawania imienia, nazwiska, nazwy firmy, numeru NIP ani wrażliwych danych finansowych.
                </Text>
              </div>

              <Divider color="slate.1" />

              {/* Section 4 */}
              <div>
                <Title order={2} size="h3" fw={800} c="slate.9" mb="sm">
                  4. Odbiorcy danych i bezpieczeństwo
                </Title>
                <Text size="sm" c="slate.7" lh={1.7} mb="sm">
                  Dane osobowe mogą być przekazywane wyłącznie zaufanym podmiotom wspierającym obsługę techniczną:
                </Text>
                <Stack gap="sm">
                  <Paper p="md" radius="md" withBorder bg="slate.0" style={{ borderColor: 'var(--mantine-color-slate-2)' }}>
                    <Group gap="xs" mb={4}>
                      <Mail size={16} color="var(--mantine-color-brandBlue-6)" />
                      <Text size="sm" fw={700} c="slate.9">Poczta elektroniczna (SMTP)</Text>
                    </Group>
                    <Text size="xs" c="slate.6" lh={1.5}>
                      Zgłoszenie z numerem telefonu przesyłane jest bezpiecznym kanałem pocztowym bezpośrednio do skrzynki
                      pracowników Biura Rachunkowego TEWU w celu wykonania telefonu zwrotnego.
                    </Text>
                  </Paper>

                  <Paper p="md" radius="md" withBorder bg="slate.0" style={{ borderColor: 'var(--mantine-color-slate-2)' }}>
                    <Group gap="xs" mb={4}>
                      <Building2 size={16} color="var(--mantine-color-brandBlue-6)" />
                      <Text size="sm" fw={700} c="slate.9">Hosting i infrastruktura Netlify</Text>
                    </Group>
                    <Text size="xs" c="slate.6" lh={1.5}>
                      Aplikacja utrzymywana jest na platformie Netlify Inc., która przetwarza żądania serwerowe jako procesor danych
                      na podstawie umowy powierzenia przetwarzania (Data Processing Agreement – DPA).
                    </Text>
                  </Paper>

                  <Paper p="md" radius="md" withBorder bg="slate.0" style={{ borderColor: 'var(--mantine-color-slate-2)' }}>
                    <Group gap="xs" mb={4}>
                      <Lock size={16} color="var(--mantine-color-brandBlue-6)" />
                      <Text size="sm" fw={700} c="slate.9">Bufor awaryjny (Netlify Blobs)</Text>
                    </Group>
                    <Text size="xs" c="slate.6" lh={1.5}>
                      W przypadku chwilowej awarii dostawcy poczty e-mail, zgłoszenie jest tymczasowo zabezpieczane w buforze awaryjnym
                      w postaci zaszyfrowanej algorytmem AES-256-GCM. Bufor służy wyłącznie automatycznemu ponowieniu wysyłki
                      i ulega bezpowrotnemu usunięciu niezwłocznie po doręczeniu lub maksymalnie po upływie 72 godzin.
                    </Text>
                  </Paper>
                </Stack>
              </div>

              <Divider color="slate.1" />

              {/* Section 5 */}
              <div>
                <Title order={2} size="h3" fw={800} c="slate.9" mb="sm">
                  5. Okres przechowywania danych
                </Title>
                <Text size="sm" c="slate.7" lh={1.7}>
                  Dane kontaktowe przetwarzane są przez okres niezbędny do przeprowadzenia rozmowy i przygotowania oferty.
                  W przypadku nawiązania współpracy, dane podlegają dalszemu przetwarzaniu na zasadach określonych w umowie
                  o świadczenie usług księgowych. W przypadku braku nawiązania współpracy, dane są usuwane, chyba że przepisy
                  prawa wymagają ich dłuższego przechowywania.
                </Text>
                <Text size="sm" c="slate.7" lh={1.7} mt="xs">
                  Maksymalny okres retencji zgłoszeń oczekujących w buforze awaryjnym wynosi <strong>72 godziny</strong>.
                </Text>
              </div>

              <Divider color="slate.1" />

              {/* Section 6 */}
              <div>
                <Title order={2} size="h3" fw={800} c="slate.9" mb="sm">
                  6. Prawa osoby, której dane dotyczą
                </Title>
                <Text size="sm" c="slate.7" lh={1.7} mb="sm">
                  Zgodnie z przepisami Rozporządzenia RODO, każdej osobie przysługują następujące uprawnienia:
                </Text>
                <Stack gap="xs" pl="sm">
                  <Text size="sm" c="slate.7">• Prawo dostępu do treści swoich danych oraz otrzymania ich kopii,</Text>
                  <Text size="sm" c="slate.7">• Prawo do sprostowania (poprawiania) nieprawidłowych danych,</Text>
                  <Text size="sm" c="slate.7">• Prawo do usunięcia danych („prawo do bycia zapomnianym”),</Text>
                  <Text size="sm" c="slate.7">• Prawo do ograniczenia przetwarzania,</Text>
                  <Text size="sm" c="slate.7">• Prawo do wniesienia sprzeciwu wobec przetwarzania opartego na uzasadnionym interesie.</Text>
                </Stack>
                <Text size="sm" c="slate.7" lh={1.7} mt="md">
                  W celu realizacji swoich praw skontaktuj się z nami mailowo: <strong>{CONTACT_DETAILS.email}</strong>.
                </Text>
                <Text size="sm" c="slate.7" lh={1.7} mt="xs">
                  Przysługuje Ci również prawo wniesienia skargi do organu nadzorczego: <strong>Prezes Urzędu Ochrony Danych
                  Osobowych (PUODO)</strong>, ul. Stawki 2, 00-193 Warszawa.
                </Text>
              </div>

              <Divider color="slate.1" />

              {/* Section 7 */}
              <div>
                <Title order={2} size="h3" fw={800} c="slate.9" mb="sm">
                  7. Pliki cookies i narzędzia analityczne
                </Title>
                <Text size="sm" c="slate.7" lh={1.7} mb="xs">
                  Serwis wykorzystuje niezbędne mechanizmy sesyjne zapewniające prawidłowe działanie interfejsu. Formularz
                  oddzwonienia nie ładuje zewnętrznych skryptów śledzących (m.in. brak zewnętrznych systemów CAPTCHA).
                </Text>
                {/* <Paper p="md" radius="md" bg="slate.0" withBorder style={{ borderColor: 'var(--mantine-color-slate-2)' }}>
                  <Text size="xs" c="slate.6" fs="italic">
                    TODO: Sekcja zostanie zaktualizowana i rozbudowana po wdrożeniu baneru cookies (CMP / Cookiebot),
                    trybu Google Consent Mode v2, Google Analytics 4 oraz tagów konwersji kampanii reklamowych Google Ads.
                </Paper> */}
              </div>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
