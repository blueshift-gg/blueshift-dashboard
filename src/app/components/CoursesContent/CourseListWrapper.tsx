import { getAllCourses, getCourseLessons } from "@/app/utils/mdx";
import { Suspense } from "react";
import Loading from "../Loading/Loading";
import CourseList from "./CourseList";

export default async function CourseListWrapper() {
  const courses = await getAllCourses();

  // Get lesson metadata for each course
  const courseLessons = await Promise.all(
    courses.map(async (course) => {
      const lessons = await getCourseLessons(course.slug);
      return {
        slug: course.slug,
        totalLessons: lessons.length,
        lessons: lessons.map((lesson) => ({
          number: lesson.lessonNumber,
          slug: lesson.slug.toLowerCase().replace(/\s+/g, "-"),
        })),
      };
    })
  );

  return (
    <Suspense fallback={<Loading />}>
      <CourseList initialCourses={courses} courseLessons={courseLessons} />
    </Suspense>
  );
}
