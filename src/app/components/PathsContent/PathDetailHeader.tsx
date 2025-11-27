"use client";

import { getPathCompletedSteps, PathStep } from "@/app/utils/path";
import { usePersistentStore } from "@/stores/store";
import { useTranslations } from "next-intl";
import { Icon } from "@blueshift-gg/ui-components";

interface PathDetailHeaderProps {
  slug: string;
  steps: PathStep[];
}

export default function PathDetailHeader({ slug, steps }: PathDetailHeaderProps) {
  const t = useTranslations();
  const { courseProgress, challengeStatuses } = usePersistentStore();

  const completedSteps = getPathCompletedSteps(steps, courseProgress, challengeStatuses);
  const totalSteps = steps.length;

  return (
    <div className="max-w-app mx-auto w-full relative border-x border-border-light">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-dvw h-px bg-border-light"></div>
      <div className="flex flex-col gap-y-3 px-6 py-8 md:py-12 md:px-12">
        {/* Progress indicator */}
        <div className="flex items-center gap-x-2 text-shade-secondary">
          <Icon name="Success" size={14} className="text-accent-brand" />
          <span className="text-sm font-mono uppercase tracking-wide">
            {completedSteps}/{totalSteps} {t("paths.completed")}
          </span>
        </div>
        
        {/* Title */}
        <h1 className="text-[28px] leading-[120%] sm:text-3xl font-semibold text-shade-primary">
          {t(`paths.${slug}.title`)}
        </h1>
        
        {/* Description */}
        <p className="text-shade-secondary text-base max-w-2xl">
          {t(`paths.${slug}.description`)}
        </p>
      </div>
    </div>
  );
}
