import type { Metadata } from "next";
import SiteLayout from "@/components/layout/SiteLayout";
import { SITE_URL } from "@/constants";
import { UkLocaleProvider } from "@/i18n/UkLocaleProvider";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: "Бухгалтерське бюро TEWU",
    description: "Професійні бухгалтерські послуги, кадри, зарплата та податкові консультації для бізнесу в Польщі. Бухгалтерське бюро TEWU у Щецині.",
};

export default function UkrainianRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <SiteLayout lang="uk" LocaleProvider={UkLocaleProvider}>
            {children}
        </SiteLayout>
    );
}
