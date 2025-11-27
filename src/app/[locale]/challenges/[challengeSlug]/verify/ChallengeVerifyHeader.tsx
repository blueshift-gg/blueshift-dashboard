"use client";

import {
  HeadingReveal,
  Icon,
  CrosshairCorners,
} from "@blueshift-gg/ui-components";
import { challengeColors, ChallengeMetadata } from "@/app/utils/challenges";
import { useTranslations } from "next-intl";
import BackToCourseButtonClient from "@/app/components/Challenges/BackToCourseButtonClient";

interface ChallengeVerifyHeaderProps {
  challengeMetadata: ChallengeMetadata;
}

export default function ChallengeVerifyHeader({
  challengeMetadata,
}: ChallengeVerifyHeaderProps) {
  const t = useTranslations();

  return (
    <div
      className="w-full"
      style={{
        background: `linear-gradient(180deg, rgb(${challengeColors[challengeMetadata.language]},0.05) 0%, transparent 100%)`,
      }}
    >
      <div className="px-4 py-14 lg:pb-20 max-w-app md:px-8 lg:px-14 mx-auto w-full flex lg:flex-row flex-col lg:items-center gap-y-12 lg:gap-y-0 justify-start lg:justify-between">
        <div className="flex flex-col gap-y-2">
          <div
            style={{
              color: `rgb(${challengeColors[challengeMetadata.language]},1)`,
            }}
            className="flex items-center gap-x-2 relative w-max"
          >
            <CrosshairCorners
              size={6}
              spacingY={2}
              spacingX={6}
              className="text-current"
              animationDelay={0}
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
  );
}
