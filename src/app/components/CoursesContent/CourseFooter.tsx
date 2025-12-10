"use client";

import { ChallengeMetadata } from "@/app/utils/challenges";
import { CourseMetadata } from "@/app/utils/course";
import { Icon, Button } from "@blueshift-gg/ui-components";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathContent } from "@/app/hooks/usePathContent";
interface CourseFooterProps {
  nextLesson: boolean;
  courseMetadata: CourseMetadata;
  nextLessonSlug: string;
  challenge: ChallengeMetadata;
}

export default function CourseFooter({
  nextLesson,
  courseMetadata,
  nextLessonSlug,
  challenge,
}: CourseFooterProps) {
  const t = useTranslations();
  const { pathSlug } = usePathContent();

  const getLessonHref = (lessonSlug: string) =>
    pathSlug
      ? `/paths/${pathSlug}/courses/${courseMetadata.slug}/${lessonSlug}`
      : `/courses/${courseMetadata.slug}/${lessonSlug}`;

  const getChallengeHref = () =>
    pathSlug
      ? `/paths/${pathSlug}/challenges/${challenge.slug}`
      : `/challenges/${challenge.slug}`;
  return (
    <div className=" w-full flex items-center flex-col gap-y-10">
      {nextLesson && (
        <>
          <Link
            href={getLessonHref(nextLessonSlug)}
            className="flex justify-between items-center w-full bg-card-solid border border-border-light group py-5 px-5"
          >
            <div className="flex items-center gap-x-2">
              <span className="text-mute text-sm font-mono text-shade-tertiary">
                Next Lesson
              </span>
              <span className="font-medium text-shade-primary">
                {t(`courses.${courseMetadata.slug}.lessons.${nextLessonSlug}`)}
              </span>
            </div>
            <Icon
              name="ArrowRight"
              className="text-mute text-sm group-hover:text-shade-primary group-hover:translate-x-1 transition"
            />
          </Link>
        </>
      )}

      {!nextLesson && challenge && (
        <div className="w-[calc(100%+32px)] md:w-[calc(100%+64px)] lg:w-[calc(100%+48px)] gap-y-6 md:gap-y-0 flex flex-col md:flex-row justify-between items-center gap-x-12 group -mt-12 pt-24 pb-16 px-8 [background:linear-gradient(180deg,rgba(0,255,255,0)_0%,rgba(0,255,255,0.08)_50%,rgba(0,255,255,0)_100%)]">
          <span className="text-shade-primary w-auto flex-shrink-0 font-mono">
            {t("lessons.take_challenge_cta")}
          </span>
          <Link
            href={`${getChallengeHref()}?fromCourse=${courseMetadata.slug}`}
            className="w-max"
          >
            <Button
              variant="primary"
              size="lg"
              label={t("lessons.take_challenge")}
              icon={{ name: "Challenge" }}
              className="disabled:opacity-40 w-full disabled:cursor-default"
            ></Button>
          </Link>
        </div>
      )}

      {!nextLesson && !challenge && (
        <div className="w-[calc(100%+32px)] md:w-[calc(100%+64px)] lg:w-[calc(100%+48px)] gap-y-6 md:gap-y-0 flex flex-col md:flex-row justify-between items-center gap-x-12 group -mt-12 pt-24 pb-16 px-8 [background:linear-gradient(180deg,rgba(0,255,255,0)_0%,rgba(0,255,255,0.08)_50%,rgba(0,255,255,0)_100%)]">
          <span className="text-shade-primary w-auto flex-shrink-0 font-mono">
            {t("lessons.lesson_completed")}
          </span>
          <Link href={`/courses`} className="w-max">
            <Button
              variant="primary"
              size="lg"
              label={t("lessons.view_other_courses")}
              icon={{ name: "Lessons" }}
              className="disabled:opacity-40 w-full disabled:cursor-default"
            ></Button>
          </Link>
        </div>
      )}
    </div>
  );
}
