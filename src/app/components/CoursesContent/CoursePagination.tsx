"use client";

import { useTranslations } from "next-intl";
import { anticipate, motion } from "motion/react";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { usePersistentStore } from "@/stores/store";
import { Link } from "@/i18n/navigation";
import Icon from "../Icon/Icon";
import { CourseMetadata } from "@/app/utils/course";
interface CoursePaginationProps {
  currentLesson: number;
  className?: string;
  course: CourseMetadata;
}

export default function CoursePagination({
  currentLesson,
  className,
  course,
}: CoursePaginationProps) {
  const t = useTranslations();
  const { setCourseProgress, courseStatus } = usePersistentStore();

  const courseSlug = course.slug;
  const lessons = course.lessons;
  const currentLessonIndex = currentLesson - 1;

  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isFixed, setIsFixed] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsFixed(window.scrollY > 250);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setCourseProgress(courseSlug, currentLesson);
  }, [courseSlug, currentLesson, setCourseProgress]);

  return (
    <motion.div
      layoutId="course-pagination"
      className={classNames(
        "font-content gradient-border !fixed xl:!sticky z-50 py-5 xl:pb-8 px-4 col-span-3 h-max left-1/2 xl:left-auto -translate-x-1/2 xl:translate-x-0 bottom-8 xl:bottom-auto xl:top-24 bg-background-card-foreground xl:[background:linear-gradient(180deg,rgba(0,179,179,0.08),rgba(0,179,179,0.02)),#11141A] flex flex-col gap-y-4 rounded-xl  xl:before:[background:linear-gradient(180deg,rgba(0,179,179,0.12),transparent)]",
        className,
      )}
    >
      <div className="flex xl:hidden items-center justify-between min-w-[80dvw] md:min-w-[250px]">
        <button
          onClick={() => {
            router.push(
              `/courses/${courseSlug}/${lessons[currentLesson - 2].slug}`,
            );
          }}
          disabled={currentLesson === 1}
          className={classNames(
            "rounded-full text-tertiary hover:bg-background-primary transition p-1.5 hover:text-brand-primary cursor-pointer disabled:opacity-40 disabled:cursor-default",
          )}
        >
          <Icon name="ArrowLeft" />
        </button>
        <span className="font-medium">
          {t(
            `courses.${courseSlug}.lessons.${lessons[currentLessonIndex].slug}`,
          )}
        </span>
        <button
          onClick={() => {
            router.push(
              `/courses/${courseSlug}/${lessons[currentLesson].slug}`,
            );
          }}
          disabled={currentLesson === lessons.length}
          className={classNames(
            "rounded-full text-tertiary hover:bg-background-primary transition p-1.5 hover:text-brand-primary cursor-pointer disabled:opacity-40 disabled:cursor-default",
          )}
        >
          <Icon name="ArrowRight" />
        </button>
      </div>
      <div className="flex-col hidden xl:flex gap-y-4 pl-0">
        <span className="font-mono text-sm pl-1 text-secondary">
          {t("lessons.lessons")}
        </span>
        <div className="flex flex-col gap-y-3 pl-0">
          {lessons.map((lesson, index) => (
            <Link
              href={`/courses/${courseSlug}/${lesson.slug}`}
              key={lesson.slug}
              className="flex flex-col gap-y-2 group"
            >
              <div className="flex items-center gap-x-4">
                <div
                  className={classNames(
                    "w-[18px] group-last:before:!hidden before:w-[2px] before:bg-mute before:h-[20px] before:content-[''] before:absolute before:left-1/2 before:-translate-x-1/2 before:top-[calc(100%+2px)] h-[18px] relative flex items-center justify-center rounded-full border-2 border-mute",
                    index === currentLesson - 1 && "!border-brand-secondary",
                  )}
                >
                  {index === currentLesson - 1 && (
                    <motion.div
                      layoutId="lesson-pagination"
                      transition={{ duration: 0.1, ease: anticipate }}
                      className={classNames(
                        "w-[6px] h-[6px] rounded-full bg-brand-secondary",
                      )}
                    ></motion.div>
                  )}
                </div>
                <span
                  className={classNames(
                    "text-tertiary/70 hover:text-secondary font-medium truncate transition",
                    index === currentLesson - 1 && "!text-primary",
                  )}
                >
                  {t(`courses.${courseSlug}.lessons.${lesson.slug}`)}
                </span>
              </div>
              {course.challenge && index === lessons.length - 1 && (
                <div className="flex items-center gap-x-2 pl-10">
                  <Icon
                    name={
                      courseStatus[courseSlug] !== "Locked"
                        ? "SuccessCircle"
                        : "Challenge"
                    }
                    size={16 as 14}
                    className={classNames("-ml-2 text-brand-tertiary", {
                      "!text-success": courseStatus[courseSlug] !== "Locked",
                    })}
                  />
                  <span
                    className={classNames(
                      "text-sm font-medium text-brand-tertiary",
                      {
                        "!text-success": courseStatus[courseSlug] !== "Locked",
                      },
                    )}
                  >
                    {courseStatus[courseSlug] !== "Locked"
                      ? t("lessons.challenge_completed")
                      : t("lessons.challenge_incomplete")}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
