import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import Challenges from "@/app/components/ChallengeCenterContent/Challenges";
import PageHero from "@/app/components/PageHero/PageHero";
import { buildLocalizedMetadata } from "@/i18n/metadata";

interface ChallengesPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: ChallengesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const title = `${t("metadata.title")} | ${t(`header.challenges`)}`;

  return buildLocalizedMetadata({
    href: "/challenges",
    locale,
    title,
    description: t("metadata.description"),
  });
}

export default function RewardsPage() {
  const t = useTranslations();

  return (
    <div className="flex w-full flex-col gap-y-0 px-3 sm:px-4">
      <PageHero badge={t("ChallengeCenter.subtitle")} title={t("ChallengeCenter.title")} />
      <Challenges />
    </div>
  );
}
