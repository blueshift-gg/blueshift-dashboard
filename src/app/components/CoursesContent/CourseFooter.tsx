"use client";

import {
  Badge,
  Button,
  CrosshairCorners,
  Icon,
} from "@blueshift-gg/ui-components";
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
      ? steps.findIndex(
          (s) => s.type === "course" && s.slug === courseMetadata.slug,
        )
      : -1;
  const nextStep =
    pathSlug && steps && currentPathIndex >= 0
      ? steps[currentPathIndex + 1]
      : undefined;

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

  const isLastPathUnit =
    !!pathSlug && !!steps && currentPathIndex >= 0 && !nextStep;
  const handleArticleClick = useCallback(
    (articleId: string) => {
      const analytics =
        typeof window !== "undefined"
          ? (window as AnalyticsWindow).analytics
          : undefined;

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
    <div className="flex flex-col w-[calc(100%+42px)] -ml-[21px] lg:w-[calc(100%+50px)] lg:-ml-[25px]">
      <div className="flex flex-col gap-y-6 bg-background relative">
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
      <div className="w-full flex items-center flex-col gap-y-10">
        {nextLesson && (
          <Link
            href={getLessonHref(nextLessonSlug)}
            className="flex justify-between items-center w-full bg-card-solid border-x border-border-light group py-5 px-5"
          >
            <div className="flex items-center gap-x-2">
              <span className="text-mute text-sm font-mono text-shade-tertiary">
                Next Lesson
              </span>
              <span className="font-medium text-shade-primary">
                {t(
                  `courses.${courseMetadata.slug}.lessons.${nextLessonSlug}.title`,
                )}
              </span>
            </div>
            <Icon
              name="ArrowRight"
              className="text-mute text-sm group-hover:text-shade-primary group-hover:translate-x-1 transition"
            />
          </Link>
        )}

        {!nextLesson && challenge && (
          <div className="px-0 lg:px-0 w-full">
            <div className="w-full bg-card-solid border-x border-border-light relative py-8 px-8">
              <div className="max-w-[800px] mx-auto">
                <div className="gap-y-6 md:gap-y-0 flex flex-col md:flex-row justify-between items-center gap-x-12">
                  <span className="text-shade-primary w-auto flex-shrink-0 font-mono">
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
          <div className="px-0 lg:px-0 w-full">
            <div className="w-full bg-card-solid border-x border-border-light relative py-8 px-8">
              <div className="max-w-[800px] mx-auto">
                <div className="gap-y-6 md:gap-y-0 flex flex-col md:flex-row justify-between items-center gap-x-12">
                  <span className="text-shade-primary w-auto flex-shrink-0 font-mono">
                    {isLastPathUnit
                      ? t("lessons.path_completed")
                      : t("lessons.lesson_completed")}
                  </span>
                  <Link
                    href={
                      nextPathUnit?.href ??
                      (isLastPathUnit ? "/paths" : "/courses")
                    }
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
                      icon={
                        nextPathUnit?.href
                          ? { name: "ArrowRight" }
                          : { name: "Lessons" }
                      }
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-y-6 bg-background relative">
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
            <div className="relative w-max px-3 hidden md:block">
              <CrosshairCorners
                className="text-shade-mute"
                animationDelay={0}
                size={6}
                thickness={1}
                spacingX={0}
                variant="bordered"
              />
              <h3 className="font-medium font-mono text-shade-secondary">
                Want more?
              </h3>
            </div>
            <Badge label="Research" variant="brand" className="text-[15px]!" />
          </div>
          <div className="mx-auto w-full">
            <div className="grid gap-4 lg:gap-4 grid-cols-1 mb-6 w-full">
              {articles.map((article) => (
                <a
                  key={article.id}
                  href={article.url}
                  onClick={() => handleArticleClick(article.id)}
                  className="group w-full border relative overflow-hidden border-border bg-card-solid hover:border-border-light transition-colors flex flex-col py-5 px-5"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <CrosshairCorners
                    corners={["bottom-right"]}
                    className="z-10 group-hover:translate-x-1 group-hover:translate-y-1 group-hover:text-brand-primary transition-transform duration-300"
                    animationDelay={0}
                    size={8}
                    thickness={1.5}
                    spacingX={-4}
                    spacingY={-4}
                  />

                  <div className="flex items-center">
                    <div className="flex flex-col items-start gap-2">
                      <h4 className="leading-[130%] text-shade-primary font-medium transition-colors">
                        {article.title}
                      </h4>
                      <p className="text-shade-tertiary leading-[160%] text-sm">
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
