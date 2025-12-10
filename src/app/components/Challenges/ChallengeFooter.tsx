"use client";

import { ChallengeMetadata } from "@/app/utils/challenges";
import { Icon, Button } from "@blueshift-gg/ui-components";
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
      ? `/paths/${pathSlug}/challenges/${challengeSlug}${
          pageSlug ? `/${pageSlug}` : ""
        }`
      : `/challenges/${challengeSlug}${pageSlug ? `/${pageSlug}` : ""}`;

  const getVerifyHref = () =>
    pathSlug
      ? `/paths/${pathSlug}/challenges/${challengeSlug}/verify`
      : `/challenges/${challengeSlug}/verify`;

  return nextPage ? (
    <>
      <Link
        href={getChallengeHref(nextPage.slug)}
        className="flex justify-between items-center w-full bg-card-solid border border-border group py-5 px-5"
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
      <div className="relative w-full">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 text-xs text-mute font-mono">
            {t("lessons.skip_lesson_divider_title").toUpperCase()}
          </span>
        </div>
      </div>
      <div className="w-[calc(100%+32px)] md:w-[calc(100%+64px)] lg:w-[calc(100%+48px)] gap-y-6 md:gap-y-0 flex flex-col md:flex-row justify-between items-center gap-x-12 group px-8">
        <span className="text-shade-primary w-auto shrink-0 font-mono">
          {t("lessons.take_challenge_cta")}
        </span>
        <Link href={getVerifyHref()} className="w-max">
          <Button
            variant="primary"
            size="lg"
            label={t("lessons.take_challenge")}
            icon={{ name: "Challenge" }}
            className="disabled:opacity-40 w-full disabled:cursor-default"
          ></Button>
        </Link>
      </div>
    </>
  ) : (
    <div className="w-[calc(100%+32px)] md:w-[calc(100%+64px)] lg:w-[calc(100%+48px)] gap-y-6 md:gap-y-0 flex flex-col md:flex-row justify-between items-center gap-x-12 group -mt-12 pt-24 pb-16 px-8 [background:linear-gradient(180deg,rgba(0,255,255,0)_0%,rgba(0,255,255,0.08)_50%,rgba(0,255,255,0)_100%)]">
      <span className="text-shade-primary w-auto flex-shrink-0 font-mono">
        {t("lessons.take_challenge_cta")}
      </span>
      <Link href={getVerifyHref()} className="w-max">
        <Button
          variant="primary"
          size="lg"
          label={t("lessons.take_challenge")}
          icon={{ name: "Challenge" }}
          className="disabled:opacity-40 w-full disabled:cursor-default"
        ></Button>
      </Link>
    </div>
  );
}
