"use client";

import { ChallengeMetadata } from "@/app/utils/challenges";
import { Icon, Button, CrosshairCorners } from "@blueshift-gg/ui-components";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathContent } from "@/app/hooks/usePathContent";

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
      ? `/paths/${pathSlug}/challenges/${challengeSlug}${pageSlug ? `/${pageSlug}` : ""
      }`
      : `/challenges/${challengeSlug}${pageSlug ? `/${pageSlug}` : ""}`;

  const getVerifyHref = () =>
    pathSlug
      ? `/paths/${pathSlug}/challenges/${challengeSlug}/verify`
      : `/challenges/${challengeSlug}/verify`;

  return (
    <div className="flex flex-col w-[calc(100%+42px)] lg:w-[calc(100%+50px)]">
      <div className="flex flex-col gap-y-6 bg-background relative">
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
      <div className="w-full flex items-center flex-col gap-y-10">
        {nextPage ? (
          <div className="flex flex-col gap-y-2 w-full">
            <Link
              href={getChallengeHref(nextPage.slug)}
              className="flex justify-between items-center w-full bg-card-solid border-x border-border-light group py-5 px-5"
            >
              <div className="flex items-center gap-x-2">
                <span className="text-mute text-sm font-mono text-shade-tertiary">
                  Next Page
                </span>
                <span className="font-medium text-shade-primary">
                  {t(
                    `challenges.${challengeMetadata.slug}.pages.${nextPage.slug}.title`
                  )}
                </span>
              </div>
              <Icon
                name="ArrowRight"
                className="text-mute text-sm group-hover:text-shade-primary group-hover:translate-x-1 transition"
              />
            </Link>

          </div>
        ) : (
          <div className="px-0 lg:px-0 w-full">
            <div className="w-full bg-card-solid border-x border-border-light relative py-8 px-8">
              <div className="max-w-[800px] mx-auto">
                <div className="gap-y-6 md:gap-y-0 flex flex-col md:flex-row justify-between items-center gap-x-12">
                  <span className="text-shade-primary w-auto shrink-0 font-mono">
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

      <div className="flex flex-col gap-y-6 bg-background relative">
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
        
        <div className="p-3 w-full">
          <div className="w-full bg-card-solid border border-border-light relative py-8 px-8">
            <div className="max-w-[800px] mx-auto">
              <div className="gap-y-6 md:gap-y-0 flex flex-col md:flex-row justify-between items-center gap-x-12">
                <span className="text-shade-primary w-auto shrink-0 font-mono">
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
