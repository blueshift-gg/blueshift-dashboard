import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ChallengePageContainer from "@/app/components/Challenges/ChallengePageContainer";
import { buildLocalizedMetadata } from "@/i18n/metadata";

interface ChallengePageProps {
  params: Promise<{
    challengeSlug: string;
    pageSlug: string;
    locale: string;
  }>;
}

export async function generateMetadata({ params }: ChallengePageProps): Promise<Metadata> {
  const { challengeSlug, pageSlug, locale } = await params;
  const t = await getTranslations({ locale });
  const href = `/challenges/${challengeSlug}/${pageSlug}`;
  const title = `${t("metadata.title")} | ${t(`challenges.${challengeSlug}.title`)} | ${t(`challenges.${challengeSlug}.pages.${pageSlug}.title`)}`;

  return buildLocalizedMetadata({
    href,
    locale,
    title,
    description: t("metadata.description"),
    openGraph: {
      images: [
        {
          url: `/graphics/challenge-banners/${challengeSlug}.png`,
          width: 1200,
          height: 630,
        },
      ],
    },
  });
}

export default async function ChallengePage({ params }: ChallengePageProps) {
  return <ChallengePageContainer params={params} />;
}
