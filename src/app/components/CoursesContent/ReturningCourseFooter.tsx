"use client";

import { Link } from "@/i18n/navigation";
import classNames from "classnames";
import { anticipate, motion } from "motion/react";
import DecryptedText from "../HeadingReveal/DecryptText";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { usePersistentStore } from "@/stores/store";
import Icon from "../Icon/Icon";
import Button from "../Button/Button";
import ProgressCircle from "../ProgressCircle/ProgressCircle";
type ReturningLessonFooterProps = {
  courseName: string;
  completedLessonsCount: number;
  totalLessonCount: number;
  currentLessonSlug: string;
  isChallengeCompleted: boolean;
  hasChallenge?: boolean;
};

export default function ReturningCourseFooter({
  totalLessonCount,
  completedLessonsCount,
  courseName,
  currentLessonSlug,
  isChallengeCompleted,
  hasChallenge,
}: ReturningLessonFooterProps) {
  const t = useTranslations();
  const [isHovering, setIsHovering] = useState(false);
  const { view } = usePersistentStore();

  return (
    <div
      className={classNames(
        "relative z-10 flex flex-col items-start gap-y-6",
        view === "grid" && "w-full"
      )}
    >
      {/* <div
        className={classNames(
          "h-[8px] w-full flex items-center justify-start relative p-px bg-background rounded-full",
          view === "list" && "!hidden"
        )}
      >
        <motion.div
          className="absolute [background:linear-gradient(180deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_100%),#00FFFF] left-[1px] rounded-full"
          initial={{
            width: `0%`,
            height: 6,
          }}
          animate={{
            width: `${(completedLessonsCount / totalLessonCount) * 100}%`,
            height: 6,
          }}
          transition={{ duration: 0.4, ease: anticipate, delay: 0.2 }}
        />
      </div> */}
      {completedLessonsCount !== totalLessonCount ? (
        <div
          className={classNames(
            "flex",
            view === "grid" && "w-full items-center justify-between",
            view === "list" && "flex-col gap-y-2 items-end"
          )}
        >
          <div className="flex items-center gap-x-2">
            <ProgressCircle
              percentFilled={(completedLessonsCount / totalLessonCount) * 100}
            />
            <span className="pt-1 text-sm text-tertiary font-mono">
              {completedLessonsCount}/{totalLessonCount}
            </span>
          </div>
          <Link
            onMouseOver={() => setIsHovering(true)}
            onMouseOut={() => setIsHovering(false)}
            href={`/courses/${courseName}/${currentLessonSlug}`}
            className="text-brand-secondary hover:text-brand-primary transition font-medium"
          >
            <Button
              variant="primary"
              size="md"
              label={t("lessons.continue")}
              icon="ArrowRight"
              iconSide="right"
            />
          </Link>
        </div>
      ) : (
        <div
          className={classNames(
            "flex",
            view === "grid" && "w-full items-center justify-between",
            view === "list" && "flex-col gap-y-2 items-end"
          )}
        >
          <div className="flex items-center gap-x-2">
            <Icon name="SuccessCircle" className="text-success" />
            <span className="pt-1 text-sm text-success font-mono">
              {completedLessonsCount}/{totalLessonCount}
            </span>
          </div>
          {hasChallenge === false || isChallengeCompleted ? (
            <Link
              onMouseOver={() => setIsHovering(true)}
              onMouseOut={() => setIsHovering(false)}
              href={`/courses/${courseName}`}
              className="text-brand-secondary hover:text-brand-primary transition font-medium flex items-center gap-x-2"
            >
              <Button
                variant="primary"
                size="md"
                label={t("lessons.review_course")}
              />
            </Link>
          ) : (
            <Link
              onMouseOver={() => setIsHovering(true)}
              onMouseOut={() => setIsHovering(false)}
              href={`/courses/${courseName}/challenge`}
              className="text-brand-secondary hover:text-brand-primary transition font-medium flex items-center gap-x-2"
            >
              <Button
                variant="primary"
                size="md"
                label={t("lessons.take_challenge")}
                icon="Challenge"
                iconSide="left"
              />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
