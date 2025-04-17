import { CourseMetadata, LessonMetadata } from "./course";
import { notFound } from "next/navigation";
// Import the generated data
import { mdxData } from './mdx-data.js';

export async function getCourse(courseSlug: string): Promise<CourseMetadata> {
  // @ts-expect-error TS7015: Element implicitly has an 'any' type because index expression is not of type 'number'.
  const course = mdxData.courses[courseSlug];
  if (!course) {
    notFound();
  }

  // Type assertion might be needed depending on strictness
  return course.metadata as CourseMetadata;
}

export async function getLesson(courseSlug: string, lessonSlug: string) {
  // @ts-expect-error TS7015: Element implicitly has an 'any' type because index expression is not of type 'number'.
  const lesson = mdxData.lessons[courseSlug]?.[lessonSlug];
  if (!lesson) {
    notFound();
  }

  return {
    // Type assertions might be needed
    frontmatter: lesson.metadata as LessonMetadata,
    content: lesson.content,
  };
}

export async function getAllCourses(): Promise<
  { slug: string; metadata: CourseMetadata }[]
> {
  return Object.entries(mdxData.courses).map(([slug, courseData]) => ({
    slug,
    // Type assertion might be needed
    metadata: courseData.metadata as CourseMetadata,
  }));
}

export async function getCourseLessons(
  courseSlug: string
): Promise<LessonMetadata[]> {
  // @ts-expect-error TS7015: Element implicitly has an 'any' type because index expression is not of type 'number'.
  const course = mdxData.courses[courseSlug];
  if (!course) {
    // Consider returning empty array or throwing a different error if preferred
    notFound();
  }
  // Lessons are pre-sorted in the build script
  // Type assertion might be needed
  return course.lessons as LessonMetadata[];
}
