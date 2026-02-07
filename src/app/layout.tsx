import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";
import '@mantine/core/styles.css';
import { mantineHtmlProps, ColorSchemeScript, Box, Stack } from '@mantine/core';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Biuro Rachunkowe TEWU",
    description: "Twój zaufany partner w biznesie. Profesjonalna księgowość, kadry i płace oraz doradztwo dla firm każdej wielkości.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pl" {...mantineHtmlProps}>
            <head>
                <ColorSchemeScript />
            </head>
            <body className={inter.className}>
                <ThemeProvider>
                    <Stack gap={0} mih="100vh">
                        <Navbar />
                        <Box component="main" style={{ flex: 1 }}>{children}</Box>
                        <Footer />
                    </Stack>
                </ThemeProvider>
            </body>
        </html>
    );
}
