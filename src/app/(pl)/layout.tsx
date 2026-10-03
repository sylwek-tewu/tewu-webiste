import type { Metadata } from "next";
import SiteLayout from "@/components/layout/SiteLayout";
import { SITE_URL } from "@/constants";
import { PlLocaleProvider } from "@/i18n/PlLocaleProvider";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: "Biuro Rachunkowe TEWU",
    description: "Twój zaufany partner w biznesie. Profesjonalna księgowość, kadry i płace oraz doradztwo dla firm każdej wielkości. Biuro rachunkowe TEWU w Szczecinie.",
};

export default function PolishRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <SiteLayout lang="pl" LocaleProvider={PlLocaleProvider}>
            {children}
        </SiteLayout>
    );
}
