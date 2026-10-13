import type { Metadata } from "next";
import SiteLayout from "@/components/layout/SiteLayout";
import { SITE_URL } from "@/constants";
import { PlLocaleProvider } from "@/i18n/PlLocaleProvider";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    // Same as the home page: the default for any page that sets no metadata of its own
    title: "Biuro rachunkowe Szczecin – księgowość, kadry i płace | TEWU",
    description: "Biuro rachunkowe w Szczecinie: pełna księgowość spółek, KPiR, ryczałt, kadry i płace, KSeF. Ponad 25 lat na rynku. Bezpłatna wycena – oddzwonimy.",
};

export default function PolishRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <SiteLayout lang="pl" LocaleProvider={PlLocaleProvider}>
            {children}
        </SiteLayout>
    );
}
