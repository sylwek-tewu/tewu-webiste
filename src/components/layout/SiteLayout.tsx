import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import "@/app/globals.css";
import '@mantine/core/styles.css';
import { mantineHtmlProps, ColorSchemeScript, Box, Stack } from '@mantine/core';

import { CallbackProvider, CallbackWidget } from "@/components/callback-widget";
import { getCallNumber } from "@/lib/callback/call-number";
import type { Locale } from "@/i18n/types";

const inter = Inter({ subsets: ["latin"] });

/**
 * The document shell shared by the (pl) and (uk) root layouts. Each passes its own locale
 * provider, so <html lang> is right in the server HTML and a page ships one dictionary.
 */
export default function SiteLayout({
    lang,
    LocaleProvider,
    children,
}: Readonly<{
    lang: Locale;
    LocaleProvider: React.ComponentType<{ children: React.ReactNode }>;
    children: React.ReactNode;
}>) {
    return (
        <html lang={lang} {...mantineHtmlProps}>
            <head>
                <ColorSchemeScript />
            </head>
            <body className={inter.className}>
                <ThemeProvider>
                    <LocaleProvider>
                        <CallbackProvider>
                            <Stack gap={0} mih="100vh">
                                <Navbar />
                                <Box component="main" style={{ flex: 1 }}>{children}</Box>
                                <Footer />
                            </Stack>
                            <CallbackWidget callInfo={getCallNumber()} />
                        </CallbackProvider>
                    </LocaleProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
