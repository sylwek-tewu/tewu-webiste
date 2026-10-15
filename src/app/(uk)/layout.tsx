import type { Metadata } from "next";
import SiteLayout from "@/components/layout/SiteLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/constants";
import { UkLocaleProvider } from "@/i18n/UkLocaleProvider";
import { buildSiteJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    // Same as the home page: the default for any page that sets no metadata of its own
    title: "Бухгалтерське бюро в Щецині – облік, кадри, зарплата | TEWU",
    description: "Бухгалтерське бюро в Щецині: повна бухгалтерія компаній, KPiR, ryczałt, кадри та зарплата, KSeF. Понад 25 років на ринку. Безкоштовна оцінка.",
};

export default function UkrainianRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <SiteLayout lang="uk" LocaleProvider={UkLocaleProvider}>
            <JsonLd data={buildSiteJsonLd("uk")} />
            {children}
        </SiteLayout>
    );
}
