"use client";

import { Button, Icon } from "@blueshift-gg/ui-components";
import classNames from "classnames";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import type React from "react";
import { useRef, useState } from "react";
import { useDirectionalHover } from "@/app/hooks/useDirectionalHover";
import { difficulty as difficultyMap } from "@/app/utils/common";
import type { PathDifficulty, PathLanguages } from "@/app/utils/path";
import { Link } from "@/i18n/navigation";
import ProgressCircle from "../ProgressCircle/ProgressCircle";

type PathCardProps = {
  name: string;
  description?: string;
  color: string;
  language: PathLanguages;
  difficulty?: PathDifficulty;
  className?: string;
  link?: string;
  completedStepsCount?: number;
  totalStepsCount?: number;
  pathSlug?: string;
  estimatedHours?: number;
  courseCount?: number;
  challengeCount?: number;
};

export default function PathCard({
  name,
  description,
  color,
  difficulty,
  className,
  link,
  completedStepsCount = 0,
  totalStepsCount = 0,
  estimatedHours,
  courseCount = 0,
  challengeCount = 0,
  pathSlug,
}: PathCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [_hasHovered, setHasHovered] = useState(false);
  const { isHovered, direction, swooshAngle, handleMouseEnter, handleMouseLeave } =
    useDirectionalHover(cardRef);

  const t = useTranslations();

  const _badgeDifficulty = difficultyMap[difficulty ?? 1];

  const isCompleted = completedStepsCount === totalStepsCount && totalStepsCount > 0;
  const hasProgress = completedStepsCount > 0;

  return (
    // This container only tracks pointer hover for decorative motion, while navigation stays on nested links and buttons.
    <div
      ref={cardRef}
      onMouseEnter={(e) => {
        handleMouseEnter(e);
        setHasHovered(true);
      }}
      onMouseLeave={handleMouseLeave}
      style={
        {
          "--pathColor": color,
          "--swoosh-angle": `${swooshAngle}deg`,
          willChange: "opacity",
        } as React.CSSProperties
      }
      className={classNames(
        "transform-gpu group transition-transform animate-card-swoosh duration-300 flex flex-col overflow-hidden p-1 relative bg-card-solid border-border-light border",
        isHovered && `swoosh-${direction}`,
        className,
      )}
    >
      {link && <Link href={link} className="absolute inset-0 z-1 h-full w-full"></Link>}
      <div className={classNames("flex flex-col gap-y-24 grow justify-between px-4 py-5 pb-6")}>
        <div className="flex flex-col gap-y-5">
          <img
            src={`/graphics/icons/${pathSlug || "path-test"}.svg`}
            alt={name}
            className="h-12 w-12"
          />
          <div className="flex flex-col gap-y-2">
            <motion.span
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className={classNames("text-xl font-medium text-shade-primary leading-[140%]")}
            >
              {name}
            </motion.span>
            <span className="flex flex-wrap items-center gap-x-3 leading-[160%] text-shade-tertiary">
              {description}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-y-5">
          {/* Path stats */}
          <div className="absolute left-0 h-[28px] w-full bg-background/50"></div>
          <div className="relative z-10 flex h-[28px] w-full items-center justify-center gap-x-4 font-mono text-xs text-shade-tertiary">
            <div className="flex items-center gap-x-1.5">
              <Icon name="Lessons" size={14} />
              <span className="text-nowrap">
                {courseCount} {courseCount === 1 ? t("paths.course") : t("paths.courses")}
              </span>
            </div>
            {challengeCount > 0 && <div className="h-1 w-1 shrink-0 bg-border-light"></div>}
            {challengeCount > 0 && (
              <div className="flex items-center gap-x-1.5">
                <Icon name="Challenge" size={14} />
                <span className="text-nowrap">
                  {challengeCount}{" "}
                  {challengeCount === 1 ? t("paths.challenge") : t("paths.challenges")}
                </span>
              </div>
            )}
            <div className="h-1 w-1 shrink-0 bg-border-light"></div>
            {estimatedHours && (
              <div className="flex items-center gap-x-1.5">
                <Icon name="Clock" size={14} />
                <span className="text-nowrap">{estimatedHours} hrs</span>
              </div>
            )}
          </div>
          {link ? (
            <Link href={link}>
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                label={
                  isCompleted
                    ? t("paths.review_path")
                    : hasProgress
                      ? t("paths.continue_path")
                      : t("paths.start_path")
                }
              >
                {hasProgress ? (
                  <div className="order-last ml-auto flex items-center gap-x-2">
                    <ProgressCircle
                      percentFilled={
                        totalStepsCount > 0 ? (completedStepsCount / totalStepsCount) * 100 : 0
                      }
                    />
                    <span className="font-mono text-sm text-shade-tertiary">
                      {completedStepsCount}/{totalStepsCount}
                    </span>
                  </div>
                ) : (
                  <div className="order-last ml-auto flex items-center gap-x-2">
                    <span className="bg-clip-text text-sm font-medium text-shade-tertiary">
                      {totalStepsCount} {t("paths.units")}
                    </span>
                  </div>
                )}
              </Button>
            </Link>
          ) : (
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              disabled={true}
              label={
                isCompleted
                  ? t("paths.review_path")
                  : hasProgress
                    ? t("paths.continue_path")
                    : t("paths.start_path")
              }
            >
              {hasProgress ? (
                <div className="order-last ml-auto flex items-center gap-x-2">
                  <ProgressCircle
                    percentFilled={
                      totalStepsCount > 0 ? (completedStepsCount / totalStepsCount) * 100 : 0
                    }
                  />
                  <span className="font-mono text-sm text-shade-tertiary">
                    {completedStepsCount}/{totalStepsCount}
                  </span>
                </div>
              ) : (
                <div className="order-last ml-auto flex items-center gap-x-2">
                  <span className="bg-clip-text text-sm font-medium text-shade-tertiary">
                    {totalStepsCount} {t("paths.units")}
                  </span>
                </div>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
