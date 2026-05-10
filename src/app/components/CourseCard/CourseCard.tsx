"use client";

import {
  Avatar,
  Badge,
  BRAND_COLOURS,
  Button,
  breeze,
  Difficulty,
  Divider,
} from "@blueshift-gg/ui-components";
import classNames from "classnames";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import type React from "react";
import { useRef, useState } from "react";
import { useDirectionalHover } from "@/app/hooks/useDirectionalHover";
import { difficulty as difficultyMap, type Language, languageColors } from "@/app/utils/common";
import type { CourseDifficulty, CourseLanguages } from "@/app/utils/course";
import { Link } from "@/i18n/navigation";
import AsciiAnimation from "../Ascii/Ascii";
import ProgressCircle from "../ProgressCircle/ProgressCircle";

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
  description?: string;
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
  description,
}: CourseCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hasHovered, setHasHovered] = useState(false);
  const { isHovered, direction, swooshAngle, handleMouseEnter, handleMouseLeave } =
    useDirectionalHover(cardRef);

  const t = useTranslations();

  const _badgeDifficulty = difficultyMap[difficulty ?? 1];

  // Map language to a valid BRAND_COLOURS key (handles "Mobile" -> "general")
  const brandColorKey = (
    language.toLowerCase() in BRAND_COLOURS ? language.toLowerCase() : "general"
  ) as keyof typeof BRAND_COLOURS;

  // Get the language color from languageColors (which properly maps Mobile -> general)
  const langColor = languageColors[language as Language] || BRAND_COLOURS.general;

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
          "--courseColor": color,
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
      <div className="relative flex aspect-2/1 w-full overflow-hidden bg-background/50 p-4 transition-all duration-100 ease-glide group-hover/card:scale-[0.99]">
        {/* <img
          src={`/graphics/course-images/${courseSlug}.webp`}
          className="absolute w-full h-full mix-blend-plus-lighter object-contain inset-0"
        ></img> */}
        <AsciiAnimation textPath={courseSlug || ""} color={brandColorKey} />

        <Avatar
          icon={{ name: language }}
          className="mt-auto"
          thickness={1.5}
          variant={brandColorKey}
          crosshair={{
            variant: "bordered",
            animationDelay: 0,
            animationDuration: 0.01,
          }}
        />
      </div>
      <div className={classNames("flex flex-col gap-y-8 grow justify-between px-4 py-5")}>
        <div className="flex min-h-[125px] flex-col sm:min-h-[100px]">
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
                    color: langColor,
                  }}
                  className={classNames("font-mono leading-[100%]")}
                >
                  {language}
                </span>
                <Divider direction="vertical" className="h-[20px]" />
                <Badge
                  size="sm"
                  variant="beginner"
                  label="Beginner"
                  className="min-h-[20px]! leading-[100%]"
                  crosshair={{
                    size: 4,
                    corners: ["top-left", "bottom-right"],
                    animationDelay: 0,
                    animationDuration: 0.01,
                  }}
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
                <span className="flex flex-wrap items-center gap-x-3 text-sm leading-[150%] text-balance text-shade-tertiary">
                  {description || ""}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="relative z-20">
          {link ? (
            <Link href={link}>
              <Button
                variant="secondary"
                size="lg"
                className="w-max"
                label={
                  completedLessonsCount === 0
                    ? t("lessons.start_course")
                    : completedLessonsCount === totalLessonCount
                      ? t("lessons.review_course")
                      : t("lessons.continue_learning")
                }
              >
                {completedLessonsCount === 0 ? null : (
                  <div className="order-last flex items-center gap-x-2">
                    <Divider direction="vertical" className="h-[20px]!" />
                    <ProgressCircle
                      percentFilled={
                        completedLessonsCount && totalLessonCount
                          ? (completedLessonsCount / totalLessonCount) * 100
                          : 0
                      }
                    />
                    <span className="font-mono text-sm text-shade-tertiary">
                      {completedLessonsCount ?? 0}/{totalLessonCount ?? 0}
                    </span>
                  </div>
                )}
              </Button>
            </Link>
          ) : (
            <Button
              variant="secondary"
              size="lg"
              className="w-max"
              disabled={true}
              label={t("lessons.start_course")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
