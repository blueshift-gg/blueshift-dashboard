import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import Challenges from "@/app/components/ChallengeCenterContent/Challenges";
import PageHero from "@/app/components/PageHero/PageHero";
import { URLS } from "@/constants/urls";
import { getPathname } from "@/i18n/navigation";

interface ChallengesPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: ChallengesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const pathname = getPathname({
    locale,
    href: `/challenges`,
  });

  const title = `${t("metadata.title")} | ${t(`header.challenges`)}`;

  return {
    title: title,
    description: t("metadata.description"),
    openGraph: {
      title: title,
      type: "website",
      description: t("metadata.description"),
      siteName: title,
      url: pathname,
      images: [
        {
          url: `${URLS.BLUESHIFT_EDUCATION}/graphics/meta-image.png`,
          width: 1200,
          height: 628,
        },
      ],
    },
  };
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
