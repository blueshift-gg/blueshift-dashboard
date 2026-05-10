import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import PageHero from "@/app/components/PageHero/PageHero";
import Paths from "@/app/components/PathsContent/Paths";
import { URLS } from "@/constants/urls";
import { buildLocalizedMetadata } from "@/i18n/metadata";

interface HomePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return buildLocalizedMetadata({
    href: "/",
    locale,
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
  });
}

export default function Home() {
  const t = useTranslations();
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Blueshift",
    url: URLS.BLUESHIFT_EDUCATION,
    logo: `${URLS.BLUESHIFT_EDUCATION}/branding/logo.svg`,
    description:
      "Learn Solana development with hands-on courses, challenges, and on-chain verification. Free education from blockchain basics to advanced program development.",
    foundingDate: "2023",
    knowsAbout: [
      "Solana",
      "Blockchain Development",
      "Anchor Framework",
      "Rust Programming",
      "Web3",
      "Smart Contracts",
      "DeFi",
      "NFTs",
    ],
    teaches: "Solana Blockchain Development",
  };

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
      <div className="flex w-full flex-col gap-y-0 px-3 sm:px-4">
        <PageHero badge={t("paths.subtitle")} title={t("paths.title")} />
        <Paths />
      </div>
    </>
  );
}
