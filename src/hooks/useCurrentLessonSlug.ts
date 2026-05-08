import type { CourseMetadata } from "@/app/utils/course";
import { usePersistentStore } from "@/stores/store";

/**
 * Custom hook to get the current lesson slug based on course progress.
 *
 * @param course - The metadata object for the course.
 * @returns The slug of the current lesson based on progress, or an empty string if no progress or lessons exist.
 */
export function useCurrentLessonSlug(course: CourseMetadata): string {
  const { courseProgress } = usePersistentStore();
  const courseLessons = course.lessons;

  const progress = courseProgress[course.slug];
  if (!progress) {
    return "";
  }

  const currentLesson = courseLessons.find(
    (lesson) => lesson.lessonNumber === progress,
  );

  return currentLesson?.slug || "";
}
