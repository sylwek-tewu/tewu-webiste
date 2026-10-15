"use client";

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { COMPANY, telHref } from '@/lib/company';
import { Box, Container, SimpleGrid, Stack, Text, Group, Anchor } from '@mantine/core';
import classes from './layout/Layout.module.css';
import { TewuLogo } from './icons';
import { useLocale } from '@/i18n/LocaleContext';
import { SERVICE_PAGE_SLUGS, servicePagePath } from '@/lib/service-pages';

const CURRENT_YEAR = new Date().getFullYear();

const Footer: React.FC = () => {
  const { t, locale } = useLocale();
  const privacyPath = locale === 'uk' ? '/uk/polityka-prywatnosci' : '/polityka-prywatnosci';
  const outsourcingPath = locale === 'uk' ? '/uk/outsourcing' : '/outsourcing';
  const faqPath = locale === 'uk' ? '/uk/faq' : '/faq';

  return (
    <Box component="footer" bg="slate.9" c="slate.3">
      <Container size="xl" py={{ base: 'xl', md: 80 }} px="md">
        <SimpleGrid cols={{ base: 1, md: 4 }} spacing={48}>
          {/* Brand Section */}
          <Stack gap="md">
            <Box component={TewuLogo} w="4.5em" c="white" />
            <Text size="sm" lh={1.6}>
              {t.footer.description}
            </Text>
          </Stack>

          {/* Quick Links */}
          <Stack gap="md">
            <Text fw={700} size="sm" c="white" tt="uppercase" className={classes.logoSubtext}>
              {t.footer.navTitle}
            </Text>
            <SimpleGrid cols={2} spacing={{ base: 'sm', sm: 'md' }}>
              <Stack gap="xs">
                {t.nav.links.slice(0, 4).map((link) => (
                  <Anchor
                    key={link.path}
                    component={Link}
                    href={link.path}
                    size="sm"
                    underline="hover"
                    className={classes.footerLink}
                    c="slate.3"
                  >
                    {link.label}
                  </Anchor>
                ))}
              </Stack>
              <Stack gap="xs">
                {t.nav.links.slice(4).map((link) => (
                  <Anchor
                    key={link.path}
                    component={Link}
                    href={link.path}
                    size="sm"
                    underline="hover"
                    className={classes.footerLink}
                    c="slate.3"
                  >
                    {link.label}
                  </Anchor>
                ))}
                <Anchor
                  component={Link}
                  href={faqPath}
                  size="sm"
                  underline="hover"
                  className={classes.footerLink}
                  c="slate.3"
                >
                  {t.footer.faq}
                </Anchor>
                <Anchor
                  component={Link}
                  href={privacyPath}
                  size="sm"
                  underline="hover"
                  className={classes.footerLink}
                  c="slate.3"
                >
                  {t.footer.privacyPolicy}
                </Anchor>
              </Stack>
            </SimpleGrid>
          </Stack>

          {/* Services */}
          <Stack gap="md">
            <Text fw={700} size="sm" c="white" tt="uppercase" className={classes.logoSubtext}>
              {t.footer.servicesTitle}
            </Text>
            <Stack gap="xs">
              {SERVICE_PAGE_SLUGS.map((slug) => (
                <Anchor key={slug} component={Link} href={servicePagePath(locale, slug)} c="slate.3" size="sm" underline="hover" className={classes.footerLink}>
                  {t.servicePages.links[slug]}
                </Anchor>
              ))}
              <Anchor component={Link} href={outsourcingPath} c="slate.3" size="sm" underline="hover" className={classes.footerLink}>
                {t.footer.bpoOutsourcing}
              </Anchor>
            </Stack>
          </Stack>

          {/* Contact */}
          <Stack gap="md">
            <Text fw={700} size="sm" c="white" tt="uppercase" className={classes.logoSubtext}>
              {t.footer.contactTitle}
            </Text>
            <Stack gap="sm">
              <Group align="flex-start" gap="xs" wrap="nowrap">
                <MapPin size={18} color="var(--mantine-color-brandBlue-4)" style={{ flexShrink: 0, marginTop: 4 }} />
                <Anchor
                  href={COMPANY.googleBusinessProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  c="slate.3"
                  size="sm"
                  underline="hover"
                  lh={1.4}
                  className={classes.footerLink}
                >
                  {COMPANY.address.line}
                </Anchor>
              </Group>
              <Group align="flex-start" gap="xs" wrap="nowrap">
                <Phone size={18} color="var(--mantine-color-brandBlue-4)" style={{ flexShrink: 0, marginTop: 4 }} />
                <Stack gap={4}>
                  {[...COMPANY.phones.office, COMPANY.phones.mobile[0]].map((phone) => (
                    <Anchor key={phone.e164} href={telHref(phone)} c="slate.3" size="sm" underline="hover" className={classes.footerLink}>
                      {phone.display}
                    </Anchor>
                  ))}
                </Stack>
              </Group>
              <Group align="center" gap="xs" wrap="nowrap">
                <Mail size={18} color="var(--mantine-color-brandBlue-4)" style={{ flexShrink: 0 }} />
                <Anchor href={`mailto:${COMPANY.emails.main}`} c="slate.3" size="sm" underline="hover" className={classes.footerLink}>
                  {COMPANY.emails.main}
                </Anchor>
              </Group>
            </Stack>
          </Stack>
        </SimpleGrid>

        <Box mt={64} pt="lg" ta="center" c="slate.4" className={classes.footerBorder}>
          <Group justify="center" gap="md" wrap="wrap">
            <Text size="xs">
              © {CURRENT_YEAR} {t.common.companyFullName}. {t.footer.allRightsReserved}
            </Text>
            <Text size="xs" c="slate.4" visibleFrom="xs">
              •
            </Text>
            <Anchor component={Link} href={privacyPath} size="xs" c="slate.4" underline="hover">
              {t.footer.privacyPolicy}
            </Anchor>
          </Group>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
