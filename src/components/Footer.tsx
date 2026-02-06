"use client";

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Linkedin } from 'lucide-react';
import { CONTACT_DETAILS, COMPANY_FULL_NAME, NAV_LINKS } from '../constants';
import { Box, Container, SimpleGrid, Stack, Text, Group, Anchor, ThemeIcon } from '@mantine/core';

const Footer: React.FC = () => {
  return (
    <Box component="footer" bg="slate.9" c="slate.3">
      <Container size="xl" py={{ base: 'xl', md: 80 }} px="md">
        <SimpleGrid cols={{ base: 1, md: 4 }} spacing={48}>
          {/* Brand Section */}
          <Stack gap="md">
            <Text fw={900} size="xl" c="white" style={{ letterSpacing: '-0.05em', fontSize: '1.5rem' }}>
              TEWU
            </Text>
            <Text size="sm" lh={1.6}>
              Twój zaufany partner w biznesie. Profesjonalna księgowość, kadry i płace oraz doradztwo dla firm każdej wielkości.
            </Text>
            <Group gap="md">
              <Anchor href="#" c="white" style={{ transition: 'color 0.2s' }}>
                <Facebook size={20} />
              </Anchor>
              <Anchor href="#" c="white" style={{ transition: 'color 0.2s' }}>
                <Linkedin size={20} />
              </Anchor>
            </Group>
          </Stack>

          {/* Quick Links */}
          <Stack gap="md">
            <Text fw={700} size="sm" c="white" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
              Nawigacja
            </Text>
            <Stack gap="xs">
              {NAV_LINKS.map(link => (
                <Anchor
                  key={link.path}
                  component={Link}
                  href={link.path}
                  size="sm"
                  underline="hover"
                  style={{ transition: 'color 0.2s' }}
                >
                  {link.label}
                </Anchor>
              ))}
            </Stack>
          </Stack>

          {/* Services */}
          <Stack gap="md">
            <Text fw={700} size="sm" c="white" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
              Usługi
            </Text>
            <Stack gap="xs">
              <Anchor component={Link} href="/uslugi" c="slate.3" size="sm" underline="hover" style={{ transition: 'color 0.2s' }}>
                Pełna Księgowość
              </Anchor>
              <Anchor component={Link} href="/uslugi" c="slate.3" size="sm" underline="hover" style={{ transition: 'color 0.2s' }}>
                Księga Przychodów
              </Anchor>
              <Anchor component={Link} href="/outsourcing" c="slate.3" size="sm" underline="hover" style={{ transition: 'color 0.2s' }}>
                Outsourcing BPO
              </Anchor>
              <Anchor component={Link} href="/uslugi" c="slate.3" size="sm" underline="hover" style={{ transition: 'color 0.2s' }}>
                Kadry i Płace
              </Anchor>
            </Stack>
          </Stack>

          {/* Contact */}
          <Stack gap="md">
            <Text fw={700} size="sm" c="white" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
              Kontakt
            </Text>
            <Stack gap="sm">
              <Group align="flex-start" gap="xs" wrap="nowrap">
                <MapPin size={18} color="var(--mantine-color-blue-4)" style={{ flexShrink: 0, marginTop: 4 }} />
                <Anchor
                  href="https://www.google.com/maps/search/?api=1&query=Biuro%20Rachunkowe%20TEWU%20Sp.%20z%20o.o.%20aleja%20Powsta%C5%84c%C3%B3w%20Wielkopolskich%2C%20Szczecin"
                  target="_blank"
                  rel="noopener noreferrer"
                  c="slate.3"
                  size="sm"
                  underline="hover"
                  lh={1.4}
                >
                  {CONTACT_DETAILS.address}
                </Anchor>
              </Group>
              <Group align="flex-start" gap="xs" wrap="nowrap">
                <Phone size={18} color="var(--mantine-color-blue-4)" style={{ flexShrink: 0, marginTop: 4 }} />
                <Stack gap={4}>
                  <Anchor href={`tel:${CONTACT_DETAILS.phone.replace(/\s/g, '')}`} c="slate.3" size="sm" underline="hover" style={{ transition: 'color 0.2s' }}>
                    {CONTACT_DETAILS.phone}
                  </Anchor>
                  <Anchor href="tel:+48501482555" c="slate.3" size="sm" underline="hover" style={{ transition: 'color 0.2s' }}>
                    501 482 555
                  </Anchor>
                </Stack>
              </Group>
              <Group align="center" gap="xs" wrap="nowrap">
                <Mail size={18} color="var(--mantine-color-blue-4)" style={{ flexShrink: 0 }} />
                <Anchor href={`mailto:${CONTACT_DETAILS.email}`} c="slate.3" size="sm" underline="hover" style={{ transition: 'color 0.2s' }}>
                  {CONTACT_DETAILS.email}
                </Anchor>
              </Group>
            </Stack>
          </Stack>
        </SimpleGrid>

        <Box mt={64} pt="lg" ta="center" c="slate.5" style={{ borderTop: '1px solid var(--mantine-color-slate-8)' }}>
          <Text size="xs">
            © {new Date().getFullYear()} {COMPANY_FULL_NAME}. Wszelkie prawa zastrzeżone.
          </Text>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
