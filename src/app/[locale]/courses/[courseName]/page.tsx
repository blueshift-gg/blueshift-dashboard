import { redirect } from "@/i18n/navigation";
import { getCourseLessons } from "@/app/utils/content";

interface CoursePageProps {
  params: Promise<{
    courseName: string;
    locale: string;
  }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseName, locale } = await params;
  const lessons = await getCourseLessons(courseName);

  // Sort lessons by lessonNumber and get the first one
  const firstLesson = lessons.sort(
    (a, b) => a.lessonNumber - b.lessonNumber,
  )[0];

  if (!firstLesson) {
    // Handle case where no lessons are found
    redirect({ href: "/courses", locale });
  }

  // Convert lesson title to URL-friendly slug
  const firstLessonSlug = firstLesson.slug.toLowerCase().replace(/\s+/g, "-");
  redirect({ href: `/courses/${courseName}/${firstLessonSlug}`, locale });
}
