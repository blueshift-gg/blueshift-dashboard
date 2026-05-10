import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import PageHero from "@/app/components/PageHero/PageHero";
import Perks from "@/app/components/Perks/Perks";
import { buildLocalizedMetadata } from "@/i18n/metadata";

interface PerksPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: PerksPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const title = `${t("metadata.title")} | ${t("perks.title")}`;

  return buildLocalizedMetadata({
    href: "/perks",
    locale,
    title,
    description: t("metadata.description"),
  });
}

export default function PerksPage() {
  const t = useTranslations();

  return (
    <div className="flex w-full flex-col gap-y-0 px-3 sm:px-4">
      <PageHero badge={t("perks.subtitle")} title={t("perks.title")} />
      <Perks />
    </div>
  );
}
