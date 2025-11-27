"use client";

import { Link } from "@/i18n/navigation";
import { Button } from "@blueshift-gg/ui-components";
import { useTranslations } from "next-intl";
import { CourseMetadata } from "@/app/utils/course";
import { useCurrentLessonSlug } from "@/hooks/useCurrentLessonSlug";

interface BackToCourseButtonProps {
  course: CourseMetadata;
}

export default function BackToCourseButton({
  course,
}: BackToCourseButtonProps) {
  const lastLessonSlug = useCurrentLessonSlug(course);
  const t = useTranslations();

  return (
    <Link href={`/courses/${course.slug}/${lastLessonSlug}`} className="!mt-4">
      <Button
        label={t("ChallengePage.back_to_lessons")}
        icon={{ name: "ArrowLeft" }}
        variant="outline"
      />
    </Link>
  );
}
