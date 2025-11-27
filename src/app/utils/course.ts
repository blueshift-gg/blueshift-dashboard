import {
  languages,
  languageColors,
  difficulty,
  difficultyColors,
  Language,
  Difficulty,
} from "./common";

// Re-export with course-specific names for backward compatibility
export const courseLanguages = languages;
export const courseColors = languageColors;
export const courseDifficulty = difficulty;
export { difficultyColors };

export const courseStatus = {
  Incomplete: "Incomplete",
  Complete: "Complete",
  Challenge_Completed: "Challenge_Completed",
} as const;

type ChallengeSlug = string;

export type CourseMetadata = {
  slug: string;
  language: CourseLanguages;
  color: string;
  difficulty: CourseDifficulty;
  isFeatured: boolean;
  lessons: LessonMetadata[];
  challenge?: ChallengeSlug;
};

export type LessonMetadata = {
  lessonNumber: number;
  slug: string;
};

export type CourseLanguages = keyof typeof courseLanguages;
export type CourseDifficulty = keyof typeof courseDifficulty;

/**
 * Adds a lesson number to each lesson in the course metadata.
 * @param courses
 */
export function withCourseNumber(
  courses: CourseMetadataWithoutLessonNumber[],
): CourseMetadata[] {
  return courses.map((course) => ({
    ...course,
    lessons: course.lessons.map((lesson, index) => ({
      ...lesson,
      lessonNumber: index + 1,
    })),
  }));
}

type CourseMetadataWithoutLessonNumber = Omit<CourseMetadata, "lessons"> & {
  lessons: Omit<LessonMetadata, "lessonNumber">[];
};
