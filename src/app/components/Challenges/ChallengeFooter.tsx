"use client";

import { Button, CrosshairCorners, Icon } from "@blueshift-gg/ui-components";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathContent } from "@/app/hooks/usePathContent";
import type { ChallengeMetadata } from "@/app/utils/challenges";

interface ChallengeFooterProps {
  challengeMetadata: ChallengeMetadata;
  nextPage?: { slug: string } | null;
  challengeSlug: string;
}

export default function ChallengeFooter({
  challengeMetadata,
  nextPage,
  challengeSlug,
}: ChallengeFooterProps) {
  const t = useTranslations();
  const { pathSlug } = usePathContent();

  const getChallengeHref = (pageSlug?: string) =>
    pathSlug
      ? `/paths/${pathSlug}/challenges/${challengeSlug}${pageSlug ? `/${pageSlug}` : ""}`
      : `/challenges/${challengeSlug}${pageSlug ? `/${pageSlug}` : ""}`;

  const getVerifyHref = () =>
    pathSlug
      ? `/paths/${pathSlug}/challenges/${challengeSlug}/verify`
      : `/challenges/${challengeSlug}/verify`;

  return (
    <div className="flex w-[calc(100%+42px)] flex-col lg:w-[calc(100%+50px)]">
      <div className="relative flex flex-col gap-y-6 bg-background">
        <div className="h-px w-full bg-border"></div>
        <div className="h-px w-full bg-border"></div>
        <CrosshairCorners
          corners={["top-left", "top-right"]}
          className="z-10 hidden xl:block"
          animationDelay={0}
          size={8}
          thickness={1}
          spacingY={-24}
          spacingX={0}
        />
      </div>
      <div className="flex w-full flex-col items-center gap-y-10">
        {nextPage ? (
          <div className="flex w-full flex-col gap-y-2">
            <Link
              href={getChallengeHref(nextPage.slug)}
              className="group flex w-full items-center justify-between border-x border-border-light bg-card-solid px-5 py-5"
            >
              <div className="flex items-center gap-x-2">
                <span className="text-mute font-mono text-sm text-shade-tertiary">Next Page</span>
                <span className="font-medium text-shade-primary">
                  {t(`challenges.${challengeMetadata.slug}.pages.${nextPage.slug}.title`)}
                </span>
              </div>
              <Icon
                name="ArrowRight"
                className="text-mute text-sm transition group-hover:translate-x-1 group-hover:text-shade-primary"
              />
            </Link>
          </div>
        ) : (
          <div className="w-full px-0 lg:px-0">
            <div className="relative w-full border-x border-border-light bg-card-solid px-8 py-8">
              <div className="mx-auto max-w-[800px]">
                <div className="flex flex-col items-center justify-between gap-x-12 gap-y-6 md:flex-row md:gap-y-0">
                  <span className="w-auto shrink-0 font-mono text-shade-primary">
                    {t("lessons.take_challenge_cta")}
                  </span>
                  <Link href={getVerifyHref()} className="w-max">
                    <Button
                      variant="primary"
                      size="md"
                      label={t("lessons.take_challenge")}
                      icon={{ name: "Challenge" }}
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative flex flex-col gap-y-6 bg-background">
        <CrosshairCorners
          corners={["bottom-left", "bottom-right"]}
          className="z-10 hidden xl:block"
          animationDelay={0}
          size={8}
          thickness={1}
          spacingY={-24}
          spacingX={0}
        />
        <div className="h-px w-full bg-border"></div>
        <div className="h-px w-full bg-border"></div>
      </div>

      {nextPage && (
        <div className="w-full p-3">
          <div className="relative w-full border border-border-light bg-card-solid px-8 py-8">
            <div className="mx-auto max-w-[800px]">
              <div className="flex flex-col items-center justify-between gap-x-12 gap-y-6 md:flex-row md:gap-y-0">
                <span className="w-auto shrink-0 font-mono text-shade-primary">
                  {t("lessons.skip_lesson_divider_title")}
                </span>
                <Link href={getVerifyHref()} className="w-max">
                  <Button
                    variant="primary"
                    size="md"
                    label={t("lessons.take_challenge")}
                    icon={{ name: "Challenge" }}
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
