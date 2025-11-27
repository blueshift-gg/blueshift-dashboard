"use client";

import { PathMetadata } from "@/app/utils/path";
import { CourseMetadata } from "@/app/utils/course";
import { ChallengeMetadata } from "@/app/utils/challenges";
import { useTranslations } from "next-intl";
import { usePersistentStore } from "@/stores/store";
import { useState } from "react";
import CourseCard from "../CourseCard/CourseCard";
import ChallengeCard from "../ChallengeCard/ChallengeCard";
import NFTViewer from "../NFTViewer/NFTViewer";

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

export default function PathStepsList({ path, steps, locale }: PathStepsListProps) {
  const t = useTranslations();
  const { courseProgress } = usePersistentStore();
  const [isNFTViewerOpen, setIsNFTViewerOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeMetadata | null>(null);

  // Get current lesson slug for a course
  const getCurrentLessonSlug = (courseSlug: string, course: CourseMetadata): string | undefined => {
    const progress = courseProgress[courseSlug] || 0;
    if (progress === 0 && course.lessons?.length > 0) {
      return course.lessons[0].slug;
    }
    if (progress > 0 && progress < (course.lessons?.length || 0)) {
      return course.lessons[progress]?.slug;
    }
    return course.lessons?.[0]?.slug;
  };

  const renderCard = (step: typeof steps[0]) => {
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
          className="!max-w-full"
        />
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col py-8 max-w-app mx-auto w-full px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {steps.map((step) => (
          <div key={`${step.type}-${step.slug}`}>
            {renderCard(step)}
          </div>
        ))}
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
