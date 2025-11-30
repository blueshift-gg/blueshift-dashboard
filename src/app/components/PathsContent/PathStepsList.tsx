"use client";

import { PathMetadata } from "@/app/utils/path";
import { CourseMetadata } from "@/app/utils/course";
import { ChallengeMetadata } from "@/app/utils/challenges";
import { useTranslations } from "next-intl";
import { usePersistentStore } from "@/stores/store";
import { useState, Fragment, useEffect } from "react";
import CourseCard from "../CourseCard/CourseCard";
import ChallengeCard from "../ChallengeCard/ChallengeCard";
import NFTViewer from "../NFTViewer/NFTViewer";
import classNames from "classnames";
import { Icon } from "@blueshift-gg/ui-components";
import PathItemDivider from "./PathItemDivider";

type PathStepsListProps = {
  path: PathMetadata;
  steps: Array<{
    type: "course" | "challenge";
    slug: string;
    description?: string;
    metadata: CourseMetadata | ChallengeMetadata | undefined;
  }>;
  locale: string;
};

const chunk = <T,>(arr: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

export default function PathStepsList({
  path,
  steps,
  locale,
}: PathStepsListProps) {
  const t = useTranslations();
  const { courseProgress, challengeStatuses } = usePersistentStore();
  const [isNFTViewerOpen, setIsNFTViewerOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] =
    useState<ChallengeMetadata | null>(null);
  const [itemsPerRow, setItemsPerRow] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setItemsPerRow(3); // xl
      } else if (window.innerWidth >= 768) {
        setItemsPerRow(2); // md - lg
      } else {
        setItemsPerRow(1); // mobile
      }
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Get current lesson slug for a course
  const getCurrentLessonSlug = (
    courseSlug: string,
    course: CourseMetadata
  ): string | undefined => {
    const progress = courseProgress[courseSlug] || 0;
    if (progress === 0 && course.lessons?.length > 0) {
      return course.lessons[0].slug;
    }
    if (progress > 0 && progress < (course.lessons?.length || 0)) {
      return course.lessons[progress]?.slug;
    }
    return course.lessons?.[0]?.slug;
  };

  const isStepComplete = (step: (typeof steps)[0]) => {
    if (step.type === "course") {
      const course = step.metadata as CourseMetadata;
      if (!course) return false;
      const progress = courseProgress[course.slug] || 0;
      return progress >= (course.lessons?.length || 0);
    }

    if (step.type === "challenge") {
      const challenge = step.metadata as ChallengeMetadata;
      if (!challenge) return false;
      const status = challengeStatuses[challenge.slug];
      return status === "completed" || status === "claimed";
    }

    return false;
  };

  const renderCard = (step: (typeof steps)[0], isComplete: boolean) => {
    const metadata = step.metadata;
    if (!metadata) return null;

    if (step.type === "course") {
      const course = metadata as CourseMetadata;
      const totalLessons = course.lessons?.length || 0;
      const completedLessonsCount = courseProgress[course.slug] || 0;
      const currentLessonSlug = getCurrentLessonSlug(course.slug, course);

      let link;
      if (currentLessonSlug && course.slug) {
        link = `/courses/${course.slug}/${currentLessonSlug}`;
      } else if (course.slug) {
        link = `/courses/${course.slug}`;
      }

      return (
        <CourseCard
          name={t(`courses.${step.slug}.title`)}
          language={course.language}
          color={course.color}
          difficulty={course.difficulty}
          link={link}
          completedLessonsCount={completedLessonsCount}
          totalLessonCount={totalLessons}
          courseSlug={course.slug}
          currentLessonSlug={currentLessonSlug}
          className={classNames(
            "w-full aspect-4/5",
            isComplete && "opacity-40"
          )}
        />
      );
    }

    if (step.type === "challenge") {
      const challenge = metadata as ChallengeMetadata;

      return (
        <ChallengeCard
          challenge={challenge}
          setIsNFTViewerOpen={setIsNFTViewerOpen}
          setSelectedChallenge={setSelectedChallenge}
          className={classNames(
            "max-w-none! aspect-4/5 h-full",
            isComplete && "opacity-40"
          )}
        />
      );
    }

    return null;
  };

  // Use state-based chunk size to recalculate layout on resize
  const chunks = chunk(steps, itemsPerRow);
  const totalSteps = steps.length;
  const isMobile = itemsPerRow === 1;

  return (
    <div className="relative w-full p-6 pb-12 max-w-app mx-auto app:border-x app:border-border-light">
      <div className="flex flex-col w-full gap-y-0 md:gap-y-24">
        {chunks.map((rowSteps, rowIndex) => {
          // Only alternate direction on non-mobile
          const isReverseRow = !isMobile && rowIndex % 2 === 1;

          return (
            <div
              key={rowIndex}
              className={classNames(
                "flex flex-col w-full items-center",
                !isMobile && "flex-row", // md+ use row
                isReverseRow && "flex-row-reverse"
              )}
            >
              {rowSteps.map((step, stepIndex) => {
                const absoluteIndex = rowIndex * itemsPerRow + stepIndex;
                const isLastOverall = absoluteIndex === totalSteps - 1;
                const isLastInChunk = stepIndex === rowSteps.length - 1;
                const isComplete = isStepComplete(step);

                // Calculate dynamic width based on itemsPerRow
                // For 3 items: (100% - 2 * 6rem) / 3
                // For 2 items: (100% - 1 * 6rem) / 2
                // Arrow width is 6rem (96px, but w-24 is 6rem)
                // Formula: (100% - (itemsPerRow - 1) * 6rem) / itemsPerRow
                const widthStyle = !isMobile
                  ? {
                      width: `calc((100% - ${(itemsPerRow - 1) * 6}rem) / ${itemsPerRow})`,
                    }
                  : {};

                return (
                  <Fragment key={`${step.type}-${step.slug}`}>
                    <div
                      className={classNames(
                        "flex flex-col items-center shrink-0 relative",
                        isMobile ? "w-full aspect-square" : "aspect-auto"
                      )}
                      style={widthStyle}
                    >
                      <div className="relative w-full flex-1">
                        {renderCard(step, isComplete)}

                        {/* Desktop/Tablet Down Arrow (Only for last in chunk connecting to next row) */}
                        {isLastInChunk && !isLastOverall && !isMobile && (
                          <div className="hidden md:flex absolute -bottom-[76px] left-1/2 -translate-x-1/2 items-center justify-center z-10">
                            <PathItemDivider
                              status={isComplete ? "completed" : "incomplete"}
                              className="rotate-90"
                            />
                          </div>
                        )}
                      </div>

                      {/* Mobile Down Arrow */}
                      {!isLastOverall && isMobile && (
                        <div className="md:hidden w-full flex justify-center py-5">
                          <PathItemDivider
                            status={isComplete ? "completed" : "incomplete"}
                            className="rotate-90"
                          />
                        </div>
                      )}
                    </div>

                    {/* Desktop/Tablet Side Arrow / Spacer - Rendered between items */}
                    {!isLastInChunk && !isMobile && (
                      <PathItemDivider
                        status={isComplete ? "completed" : "incomplete"}
                        className={classNames(
                          "hidden md:flex",
                          isReverseRow && "rotate-180"
                        )}
                      />
                    )}
                  </Fragment>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* NFT Viewer Modal */}
      {selectedChallenge && (
        <NFTViewer
          isOpen={isNFTViewerOpen}
          onClose={() => setIsNFTViewerOpen(false)}
          challengeName={selectedChallenge.slug}
          challengeLanguage={selectedChallenge.language}
          challengeDifficulty={selectedChallenge.difficulty}
        />
      )}
    </div>
  );
}
