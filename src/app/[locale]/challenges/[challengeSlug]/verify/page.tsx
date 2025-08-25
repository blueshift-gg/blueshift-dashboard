import { getTranslations } from "next-intl/server";
import MdxLayout from "@/app/mdx-layout";
import Divider from "@/app/components/Divider/Divider";
import HeadingReveal from "@/app/components/HeadingReveal/HeadingReveal";
import Icon from "@/app/components/Icon/Icon";
import { challengeColors } from "@/app/utils/challenges";
import ProgramChallengesContent from "@/app/components/Challenges/ProgramChallengesContent";
import ClientChallengesContent from "@/app/components/Challenges/ClientChallengesContent";
import CrosshairCorners from "@/app/components/Graphics/CrosshairCorners";
import { notFound } from "next/navigation";
import { getChallenge } from "@/app/utils/mdx";
import BackToCourseButtonClient from "@/app/components/Challenges/BackToCourseButtonClient";
import ContentFallbackNotice from "@/app/components/ContentFallbackNotice";
import { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";

interface ChallengePageProps {
  params: Promise<{
    challengeSlug: string;
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: ChallengePageProps): Promise<Metadata> {
  const { challengeSlug, locale } = await params;
  const t = await getTranslations({ locale });
  const pathname = getPathname({
    locale,
    href: `/challenges/${challengeSlug}/verify`,
  });

  const ogImage = {
    src: `/graphics/challenge-banners/${challengeSlug}.png`,
    width: 1200,
    height: 630,
  };

  const title = `${t("metadata.title")} | ${t(`challenges.${challengeSlug}.title`)} | ${t(`lessons.take_challenge`)}`;

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
          url: ogImage.src,
          width: ogImage.width,
          height: ogImage.height,
        },
      ],
    },
  };
}

export default async function ChallengePage({ params }: ChallengePageProps) {
  const { challengeSlug, locale } = await params;
  const t = await getTranslations();
  const challengeMetadata = await getChallenge(challengeSlug);

  if (!challengeMetadata) {
    notFound();
  }

  let ChallengeContent;
  let challengeLocale = locale;
  try {
    const challengeModule = await import(
      `@/app/content/challenges/${challengeMetadata.slug}/${locale}/verify.mdx`
    );
    ChallengeContent = challengeModule.default;
  } catch {
    try {
      const challengeModule = await import(
        `@/app/content/challenges/${challengeMetadata.slug}/en/verify.mdx`
      );
      ChallengeContent = challengeModule.default;
      challengeLocale = "en";
    } catch {
      notFound();
    }
  }

  return (
    <div className="flex flex-col w-full">
      <div
        className="w-full"
        style={{
          background: `linear-gradient(180deg, rgb(${challengeColors[challengeMetadata.language]},0.05) 0%, transparent 100%)`,
        }}
      >
        <div className="px-4 py-14 lg:pb-20 max-w-app md:px-8 lg:px-14 mx-auto w-full flex lg:flex-row flex-col lg:items-center gap-y-12 lg:gap-y-0 justify-start lg:justify-between">
          <div className="flex flex-col gap-y-2">
            <div className="flex items-center gap-x-2 relative w-max">
              <CrosshairCorners
                size={5}
                spacingTop={2}
                spacingBottom={2}
                spacingX={6}
                style={{
                  color: `rgb(${challengeColors[challengeMetadata.language]},1)`,
                }}
              />
              <div
                className="w-[24px] h-[24px] rounded-sm flex items-center justify-center"
                style={{
                  backgroundColor: `rgb(${challengeColors[challengeMetadata.language]},0.10)`,
                }}
              >
                <Icon name={challengeMetadata.language} size={16 as 14} />
              </div>
              <span
                className="font-medium text-lg font-mono relative top-0.25"
                style={{
                  color: `rgb(${challengeColors[challengeMetadata.language]})`,
                }}
              >
                {challengeMetadata.language}
              </span>
            </div>
            <span className="sr-only">
              {t(`challenges.${challengeMetadata.slug}.title`)}
            </span>
            <HeadingReveal
              text={t(`challenges.${challengeMetadata.slug}.title`)}
              headingLevel="h1"
              className="text-3xl font-semibold"
            />

            <BackToCourseButtonClient />
          </div>
        </div>
      </div>
      <Divider />

      {challengeMetadata.language === "Typescript" ? (
        <ClientChallengesContent
          currentChallenge={challengeMetadata}
          content={
            <MdxLayout>
              <ContentFallbackNotice
                locale={locale}
                originalLocale={challengeLocale}
              />
              <ChallengeContent />
            </MdxLayout>
          }
        />
      ) : (
        <ProgramChallengesContent
          currentChallenge={challengeMetadata}
          content={
            <MdxLayout>
              <ContentFallbackNotice
                locale={locale}
                originalLocale={challengeLocale}
              />
              <ChallengeContent />
            </MdxLayout>
          }
        />
      )}
    </div>
  );
}
