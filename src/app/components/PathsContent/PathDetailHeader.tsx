"use client";

import classNames from "classnames";
import { useTranslations } from "next-intl";
import { getPathCompletedSteps, type PathStepWithMetadata } from "@/app/utils/path";
import { usePersistentStore } from "@/stores/store";
import ProgressCircle from "../ProgressCircle/ProgressCircle";

interface PathDetailHeaderProps {
  slug: string;
  steps: PathStepWithMetadata[];
  showBorder?: boolean;
}

export default function PathDetailHeader({
  slug,
  steps,
  showBorder = true,
}: PathDetailHeaderProps) {
  const t = useTranslations();
  const { courseProgress, challengeStatuses } = usePersistentStore();

  const completedSteps = getPathCompletedSteps(steps, courseProgress, challengeStatuses);
  const totalSteps = steps.length;

  return (
    <div
      className={classNames(
        "max-w-app mx-auto w-full relative",
        showBorder && "border-x border-border-light",
      )}
    >
      <div className="absolute bottom-0 left-1/2 h-px w-dvw -translate-x-1/2 bg-border-light"></div>
      <div className="flex flex-col gap-y-3 px-6 py-8 md:px-12 md:py-12">
        {/* Progress indicator */}
        <div className="flex items-center gap-x-2 text-shade-tertiary">
          <ProgressCircle
            percentFilled={totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0}
          />
          <span className="font-mono text-sm uppercase">
            {completedSteps}/{totalSteps} {t("paths.completed")}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-[28px] leading-[120%] font-semibold text-shade-primary sm:text-3xl">
          {t(`paths.${slug}.title`)}
        </h1>

        {/* Description */}
        <p className="max-w-2xl text-base text-shade-secondary">{t(`paths.${slug}.description`)}</p>
      </div>
    </div>
  );
}
