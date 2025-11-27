"use client";

import { CourseDifficulty, CourseLanguages } from "@/app/utils/course";
import { difficulty as difficultyMap } from "@/app/utils/common";
import React, { useRef, useState } from "react";
import classNames from "classnames";
import { Link } from "@/i18n/navigation";
import { useDirectionalHover } from "@/app/hooks/useDirectionalHover";
import {
  anticipate,
  Badge,
  breeze,
  Button,
  Difficulty,
  Divider,
  glide,
} from "@blueshift-gg/ui-components";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { BRAND_COLOURS } from "@blueshift-gg/ui-components";
import ProgressCircle from "../ProgressCircle/ProgressCircle";
import { Icon } from "@blueshift-gg/ui-components";

type CourseCardProps = {
  name: string;
  color: string;
  points?: number;
  language: CourseLanguages;
  difficulty?: CourseDifficulty;
  className?: string;
  link?: string;
  completedLessonsCount?: number;
  totalLessonCount?: number;
  courseSlug?: string;
  currentLessonSlug?: string;
};

export default function CourseCard({
  name,
  color,
  language,
  difficulty,
  className,
  link,
  completedLessonsCount,
  totalLessonCount,
  courseSlug,
  currentLessonSlug,
}: CourseCardProps) {
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
          "--courseColor": color,
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
      <div className="w-full bg-background/50 aspect-2/1 group-hover/card:scale-[0.99] transition-all duration-100 ease-glide"></div>
      <div
        className={classNames(
          "flex flex-col gap-y-12 flex-grow justify-between px-4 py-5"
        )}
      >
        <div className="flex flex-col min-h-[150px] sm:min-h-[125px]">
          <AnimatePresence>
            {!isHovered && (
              <motion.div
                initial={{
                  opacity: hasHovered ? 0 : 1,
                  height: hasHovered ? 0 : 24,
                  marginBottom: hasHovered ? 0 : 8,
                }}
                animate={{ opacity: 1, height: 24, marginBottom: 8 }}
                exit={{
                  opacity: 0,
                  height: 0,
                  marginBottom: 0,
                  transition: { duration: 0.2, ease: "easeInOut" },
                }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex items-center gap-x-3 overflow-hidden"
              >
                <span
                  style={{
                    color:
                      BRAND_COLOURS[language as keyof typeof BRAND_COLOURS],
                  }}
                  className={classNames("font-mono leading-[100%]")}
                >
                  {language}
                </span>
                <Divider direction="vertical" className="h-[20px]" />
                <Badge
                  size="sm"
                  variant="Beginner"
                  label="Beginner"
                  className="leading-[100%] min-h-[20px]!"
                  crosshair={{ size: 4, corners: ["top-left", "bottom-right"] }}
                  icon={<Difficulty size={12} difficulties={[1]} />}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <motion.span
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className={classNames("text-xl font-medium text-shade-primary")}
          >
            {name}
          </motion.span>
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{
                  opacity: [0, 1, 0.25, 1, 0.5, 1, 0.75, 1],
                  height: "auto",
                  marginTop: 8,
                }}
                transition={{
                  height: { duration: 0.2, ease: "easeInOut" },
                  marginTop: { duration: 0.2, ease: "easeInOut" },
                  opacity: { duration: 0.4, ease: breeze },
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  marginTop: 0,
                  transition: { duration: 0.2, ease: "easeInOut" },
                }}
                className="overflow-hidden"
              >
                <span className="flex leading-[150%] flex-wrap items-center gap-x-3 text-sm text-shade-tertiary">
                  To understand sBPF Assembly and its role in Solana programs,
                  we first need to understand assembly.
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="relative z-20">
          <Button
            variant="secondary"
            size="md"
            className="w-max"
            label={
              completedLessonsCount === 0
                ? t("lessons.start_course")
                : t("lessons.continue_learning")
            }
            children={
              completedLessonsCount === 0 ? (
                <div className="flex items-center gap-x-2 order-last">
                  <Divider direction="vertical" className="!h-[20px]" />
                  <span className="text-sm font-medium bg-clip-text text-transparent bg-xp-gradient">
                    50 XP
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-x-2 order-last">
                  <Divider direction="vertical" className="!h-[20px]" />
                  <ProgressCircle
                    percentFilled={
                      completedLessonsCount && totalLessonCount
                        ? (completedLessonsCount / totalLessonCount) * 100
                        : 0
                    }
                  />
                  <span className="text-sm text-shade-tertiary font-mono">
                    {completedLessonsCount ?? 0}/{totalLessonCount ?? 0}
                  </span>
                </div>
              )
            }
          />
        </div>
      </div>
    </div>
  );
}
