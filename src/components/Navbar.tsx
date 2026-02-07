"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { NAV_LINKS } from '../constants';
import { Box, Container, Group, Burger, Drawer, Stack, Button, Text, Anchor, Paper } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from './layout/Layout.module.css';

const Navbar: React.FC = () => {
  const [opened, { toggle, close }] = useDisclosure(false);
  const pathname = usePathname();

  return (
    <Paper component="nav" pos="sticky" top={0} bg="white" shadow="sm" withBorder radius={0} style={{ zIndex: 50 }}>
      <Container size="xl" px="md">
        <Group justify="space-between" h={80}>
          <Group gap="xs">
            <Link href="/" onClick={close} style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, textDecoration: 'none' }}>
              <Text span fw={900} size="30px" lh={1} className={classes.logoText} c="slate.8">
                TEWU
              </Text>
              <Box visibleFrom="sm" h={32} w={2} bg="slate.2" mx={8} />
              <Text
                span
                visibleFrom="sm"
                tt="uppercase"
                fw="bold"
                c="slate.5"
                lh={1.25}
                size="xs"
              >
                Biuro<br />Rachunkowe
              </Text>
            </Link>
          </Group>

          {/* Desktop Menu */}
          <Group gap="xl" visibleFrom="md">
            {NAV_LINKS.map((link) => (
              <Anchor
                key={link.path}
                component={Link}
                href={link.path}
                underline="never"
                fw={600}
                size="sm"
                c={pathname === link.path ? 'brandBlue.6' : 'slate.6'}
                className={`${classes.navLink} ${pathname === link.path ? classes.navLinkActive : ''}`}
              >
                {link.label}
              </Anchor>
            ))}
            <Button
              component={Link}
              href="/kontakt"
              size="md"
              fw={700}
              radius={12}
              className={classes.primaryButton}
              style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
            >
              Bezpłatna wycena
            </Button>
          </Group>

          {/* Mobile menu button */}
          <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="sm" />
        </Group>
      </Container>

      {/* Mobile Menu */}
      <Drawer
        opened={opened}
        onClose={close}
        size="100%"
        padding="md"
        title="Menu"
        hiddenFrom="md"
        zIndex={100}
      >
        <Stack gap="sm">
          {NAV_LINKS.map((link) => (
            <Anchor
              key={link.path}
              component={Link}
              href={link.path}
              onClick={close}
              underline="never"
              fw={500}
              size="lg"
              py="xs"
              px="xs"
              display="block"
              style={{ borderRadius: 'var(--mantine-radius-md)' }}
              bg={pathname === link.path ? 'brandBlue.0' : 'transparent'}
              c={pathname === link.path ? 'brandBlue.6' : 'slate.6'}
            >
              {link.label}
            </Anchor>
          ))}
          <Button
            component={Link}
            href="/kontakt"
            onClick={close}
            fullWidth
            size="lg"
            radius="md"
            fw={700}
            mt="md"
            className={classes.primaryButton}
          >
            Bezpłatna wycena
          </Button>
        </Stack>
      </Drawer>
    </Paper>
  );
};

export default Navbar;
