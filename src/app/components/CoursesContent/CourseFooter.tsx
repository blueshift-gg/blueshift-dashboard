"use client";

import { Badge, Button, CrosshairCorners, Icon } from "@blueshift-gg/ui-components";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { usePathContent } from "@/app/hooks/usePathContent";
import type { ChallengeMetadata } from "@/app/utils/challenges";
import type { CourseMetadata } from "@/app/utils/course";
import { type CourseId, getResearchForCourse } from "@/lib/cross-linking";

interface CourseFooterProps {
  nextLesson: boolean;
  courseMetadata: CourseMetadata;
  nextLessonSlug: string;
  challenge?: ChallengeMetadata;
}

type AnalyticsClient = {
  track: (event: string, properties: Record<string, string>) => void;
};

type AnalyticsWindow = Window & {
  analytics?: AnalyticsClient;
};

export default function CourseFooter({
  nextLesson,
  courseMetadata,
  nextLessonSlug,
  challenge,
}: CourseFooterProps) {
  const t = useTranslations();
  const { pathSlug, steps } = usePathContent();

  const articles = getResearchForCourse(courseMetadata.slug as CourseId);

  // When in a path, find the next course/challenge to navigate to
  const currentPathIndex =
    pathSlug && steps
      ? steps.findIndex((s) => s.type === "course" && s.slug === courseMetadata.slug)
      : -1;
  const nextStep =
    pathSlug && steps && currentPathIndex >= 0 ? steps[currentPathIndex + 1] : undefined;

  const nextPathUnit =
    pathSlug && nextStep
      ? (() => {
          if (nextStep.type === "course" && nextStep.defaultLessonSlug) {
            return {
              href: `/paths/${pathSlug}/courses/${nextStep.slug}/${nextStep.defaultLessonSlug}`,
              label: t("lessons.next_unit"),
            };
          }
          if (nextStep.type === "course") {
            return {
              href: `/paths/${pathSlug}/courses/${nextStep.slug}`,
              label: t("lessons.next_unit"),
            };
          }
          return {
            href: `/paths/${pathSlug}/challenges/${nextStep.slug}?fromCourse=${courseMetadata.slug}`,
            label: t("lessons.next_unit"),
          };
        })()
      : null;

  const isLastPathUnit = !!pathSlug && !!steps && currentPathIndex >= 0 && !nextStep;
  const handleArticleClick = useCallback(
    (articleId: string) => {
      const analytics =
        typeof window !== "undefined" ? (window as AnalyticsWindow).analytics : undefined;

      if (analytics) {
        analytics.track("research_link_clicked", {
          source: "course_conclusion",
          course: courseMetadata.slug,
          article: articleId,
        });
      }
    },
    [courseMetadata.slug],
  );

  const getLessonHref = (lessonSlug: string) =>
    pathSlug
      ? `/paths/${pathSlug}/courses/${courseMetadata.slug}/${lessonSlug}`
      : `/courses/${courseMetadata.slug}/${lessonSlug}`;

  const getChallengeHref = () =>
    pathSlug
      ? `/paths/${pathSlug}/challenges/${challenge?.slug}`
      : `/challenges/${challenge?.slug}`;

  return (
    <div className="-ml-[21px] flex w-[calc(100%+42px)] flex-col lg:-ml-[25px] lg:w-[calc(100%+50px)]">
      <div className="relative flex flex-col gap-y-6 bg-background">
        <div className="h-px w-full bg-border"></div>
        <div className="h-px w-full bg-border"></div>
        <CrosshairCorners
          corners={["top-left", "top-right"]}
          className="z-10 hidden xl:block"
          animationDelay={0}
          size={8}
          thickness={1}
          spacingY={-24}
          spacingX={0}
        />
      </div>
      <div className="flex w-full flex-col items-center gap-y-10">
        {nextLesson && (
          <Link
            href={getLessonHref(nextLessonSlug)}
            className="group flex w-full items-center justify-between border-x border-border-light bg-card-solid px-5 py-5"
          >
            <div className="flex items-center gap-x-2">
              <span className="text-mute font-mono text-sm text-shade-tertiary">Next Lesson</span>
              <span className="font-medium text-shade-primary">
                {t(`courses.${courseMetadata.slug}.lessons.${nextLessonSlug}.title`)}
              </span>
            </div>
            <Icon
              name="ArrowRight"
              className="text-mute text-sm transition group-hover:translate-x-1 group-hover:text-shade-primary"
            />
          </Link>
        )}

        {!nextLesson && challenge && (
          <div className="w-full px-0 lg:px-0">
            <div className="relative w-full border-x border-border-light bg-card-solid px-8 py-8">
              <div className="mx-auto max-w-[800px]">
                <div className="flex flex-col items-center justify-between gap-x-12 gap-y-6 md:flex-row md:gap-y-0">
                  <span className="w-auto flex-shrink-0 font-mono text-shade-primary">
                    {t("lessons.take_challenge_cta")}
                  </span>
                  <Link
                    href={`${getChallengeHref()}?fromCourse=${courseMetadata.slug}`}
                    className="w-max"
                  >
                    <Button
                      variant="primary"
                      size="md"
                      label={t("lessons.take_challenge")}
                      icon={{ name: "Challenge" }}
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
        {!nextLesson && !challenge && (
          <div className="w-full px-0 lg:px-0">
            <div className="relative w-full border-x border-border-light bg-card-solid px-8 py-8">
              <div className="mx-auto max-w-[800px]">
                <div className="flex flex-col items-center justify-between gap-x-12 gap-y-6 md:flex-row md:gap-y-0">
                  <span className="w-auto flex-shrink-0 font-mono text-shade-primary">
                    {isLastPathUnit ? t("lessons.path_completed") : t("lessons.lesson_completed")}
                  </span>
                  <Link
                    href={nextPathUnit?.href ?? (isLastPathUnit ? "/paths" : "/courses")}
                    className="w-max"
                  >
                    <Button
                      variant="primary"
                      size="md"
                      label={
                        nextPathUnit?.label ??
                        (isLastPathUnit
                          ? t("lessons.explore_more_paths")
                          : t("lessons.explore_more_courses"))
                      }
                      iconPosition={nextPathUnit?.href ? "right" : "left"}
                      icon={nextPathUnit?.href ? { name: "ArrowRight" } : { name: "Lessons" }}
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative flex flex-col gap-y-6 bg-background">
        <CrosshairCorners
          corners={["bottom-left", "bottom-right"]}
          className="z-10 hidden xl:block"
          animationDelay={0}
          size={8}
          thickness={1}
          spacingY={-24}
          spacingX={0}
        />
        <div className="h-px w-full bg-border"></div>
        <div className="h-px w-full bg-border"></div>
      </div>

      {articles.length > 0 && !nextLesson && !challenge && (
        <div className="flex flex-col gap-y-6 px-5 py-8 lg:px-8 lg:py-10">
          <div className="flex items-center justify-between">
            <div className="relative hidden w-max px-3 md:block">
              <CrosshairCorners
                className="text-shade-mute"
                animationDelay={0}
                size={6}
                thickness={1}
                spacingX={0}
                variant="bordered"
              />
              <h3 className="font-mono font-medium text-shade-secondary">Want more?</h3>
            </div>
            <Badge label="Research" variant="brand" className="text-[15px]!" />
          </div>
          <div className="mx-auto w-full">
            <div className="mb-6 grid w-full grid-cols-1 gap-4 lg:gap-4">
              {articles.map((article) => (
                <a
                  key={article.id}
                  href={article.url}
                  onClick={() => handleArticleClick(article.id)}
                  className="group relative flex w-full flex-col overflow-hidden border border-border bg-card-solid px-5 py-5 transition-colors hover:border-border-light"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <CrosshairCorners
                    corners={["bottom-right"]}
                    className="z-10 transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1 group-hover:text-brand-primary"
                    animationDelay={0}
                    size={8}
                    thickness={1.5}
                    spacingX={-4}
                    spacingY={-4}
                  />

                  <div className="flex items-center">
                    <div className="flex flex-col items-start gap-2">
                      <h4 className="leading-[130%] font-medium text-shade-primary transition-colors">
                        {article.title}
                      </h4>
                      <p className="text-sm leading-[160%] text-shade-tertiary">
                        {article.description}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
