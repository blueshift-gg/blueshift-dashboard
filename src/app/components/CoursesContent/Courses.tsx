import { getAllCourses, getCourseLessons } from "@/app/utils/content";
import CourseList from "./CourseList";
import { Suspense } from "react";

async function CoursesContent() {
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

  return <CourseList initialCourses={courses} courseLessons={courseLessons} />;
}

export default function Courses() {
  return (
    <div className="relative content-wrapper">
      <Suspense fallback={<CourseList isLoading={true} />}>
        <CoursesContent />
      </Suspense>
    </div>
  );
}
