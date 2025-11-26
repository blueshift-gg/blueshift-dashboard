"use client";

import { CrosshairCorners, HeadingReveal } from "@blueshift-gg/ui-components";
import { useTranslations } from "next-intl";

export default function PageHero({
  badge,
  title,
}: {
  badge: string;
  title: string;
}) {
  const t = useTranslations();
  return (
    <div className="max-w-app mx-auto w-full relative border-x border-border-light">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-dvw h-px bg-border-light"></div>
      <div className="flex flex-col gap-y-2 px-6 py-8 md:py-12 md:px-12">
        <div className="relative w-max py-0.5 px-1.5">
          <span className="text-shade-secondary font-medium text-lg leading-none font-mono">
            {badge}
          </span>
          <CrosshairCorners
            size={4}
            spacingY={0}
            spacingX={0}
            animationDelay={0}
          />
        </div>
        <span className="sr-only">{title}</span>
        <HeadingReveal
          text={title}
          headingLevel="h1"
          className="text-[28px] leading-[120%] sm:text-3xl font-semibold -ml-1"
        />
      </div>
    </div>
  );
}
