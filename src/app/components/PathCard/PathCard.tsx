"use client";

import { PathDifficulty, PathLanguages } from "@/app/utils/path";
import { difficulty as difficultyMap } from "@/app/utils/common";
import React, { useRef, useState } from "react";
import classNames from "classnames";
import { Link } from "@/i18n/navigation";
import { useDirectionalHover } from "@/app/hooks/useDirectionalHover";
import { Button } from "@blueshift-gg/ui-components";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Icon } from "@blueshift-gg/ui-components";
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
}: PathCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hasHovered, setHasHovered] = useState(false);
  const {
    isHovered,
    direction,
    swooshAngle,
    handleMouseEnter,
    handleMouseLeave,
  } = useDirectionalHover(cardRef);

  const t = useTranslations();

  const badgeDifficulty = difficultyMap[difficulty ?? 1];

  const isCompleted =
    completedStepsCount === totalStepsCount && totalStepsCount > 0;
  const hasProgress = completedStepsCount > 0;

  return (
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
        className
      )}
    >
      {link && (
        <Link href={link} className="absolute inset-0 z-1 w-full h-full"></Link>
      )}
      <div
        className={classNames(
          "flex flex-col gap-y-24 flex-grow justify-between px-4 py-5 pb-6"
        )}
      >
        <div className="flex flex-col gap-y-5">
          <img
            src="/graphics/icons/path-test.svg"
            alt="Path Test"
            className="w-12 h-12"
          />
          <div className="flex flex-col gap-y-2">
            <motion.span
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className={classNames(
                "text-xl font-medium text-shade-primary leading-[140%]"
              )}
            >
              {name}
            </motion.span>
            <span className="flex leading-[160%] flex-wrap items-center gap-x-3  text-shade-tertiary">
              {description}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-y-5">
          {/* Path stats */}
          <div className="w-full h-[28px] bg-background/50 absolute left-0"></div>
          <div className="flex h-[28px] w-full items-center relative z-10 gap-x-4 text-xs text-shade-tertiary font-mono justify-center">
            <div className="flex items-center gap-x-1.5">
              <Icon name="Lessons" size={14} />
              <span>
                {courseCount}{" "}
                {courseCount === 1 ? t("paths.course") : t("paths.courses")}
              </span>
            </div>
            {challengeCount > 0 && (
              <div className="w-1 h-1 rounded-full bg-border-light"></div>
            )}
            {challengeCount > 0 && (
              <div className="flex items-center gap-x-1.5">
                <Icon name="Challenge" size={14} />
                <span>
                  {challengeCount}{" "}
                  {challengeCount === 1
                    ? t("paths.challenge")
                    : t("paths.challenges")}
                </span>
              </div>
            )}
            <div className="w-1 h-1 rounded-full bg-border-light"></div>
            {estimatedHours && (
              <div className="flex items-center gap-x-1.5">
                <Icon name="Clock" size={14} />
                <span>{estimatedHours} hrs</span>
              </div>
            )}
          </div>
          <Link href={link!}>
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
              children={
                hasProgress ? (
                  <div className="flex items-center gap-x-2 order-last ml-auto">
                    <ProgressCircle
                      percentFilled={
                        totalStepsCount > 0
                          ? (completedStepsCount / totalStepsCount) * 100
                          : 0
                      }
                    />
                    <span className="text-sm text-shade-tertiary font-mono">
                      {completedStepsCount}/{totalStepsCount}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-x-2 order-last ml-auto">
                    <span className="text-sm font-medium bg-clip-text text-shade-tertiary">
                      {totalStepsCount} {t("paths.units")}
                    </span>
                  </div>
                )
              }
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
