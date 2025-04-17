export const runtime = "edge";

import { redirect } from "next/navigation";
import { getCourseLessons } from "@/app/utils/mdx";

interface CoursePageProps {
  params: Promise<{
    courseName: string;
  }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const resolvedParams = await params;
  const lessons = await getCourseLessons(resolvedParams.courseName);

  // Sort lessons by lessonNumber and get the first one
  const firstLesson = lessons.sort(
    (a, b) => a.lessonNumber - b.lessonNumber
  )[0];

  if (!firstLesson) {
    // Handle case where no lessons are found
    redirect("/courses");
  }

  // Convert lesson title to URL-friendly slug
  const firstLessonSlug = firstLesson.title.toLowerCase().replace(/\s+/g, "-");
  redirect(`/courses/${resolvedParams.courseName}/${firstLessonSlug}`);
}