export const runtime = "edge";

import MdxLayout from "@/app/mdx-layout";
import HeadingReveal from "@/app/components/HeadingReveal/HeadingReveal";
import { getCourse } from "@/app/utils/mdx";
import { courseColors } from "@/app/utils/course";
import Icon from "@/app/components/Icon/Icon";
import Divider from "@/app/components/Divider/Divider";
import TableOfContents from "@/app/components/TableOfContents/TableOfContents";
import CourseChallengeButton from "@/app/components/CoursesContent/CourseChallengeButton";
import CoursePagination from "@/app/components/CoursesContent/CoursePagination";
import Link from "next/link";

interface LessonPageProps {
  params: Promise<{
    courseName: string;
    lessonName: string;
  }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { courseName, lessonName } = await params;
  const { default: Lesson } = await import(
    `@/app/content/courses/${courseName}/${lessonName}.mdx`
  );
  const courseMetadata = await getCourse(courseName);

  // Get all lessons for the course
  const allLessons = courseMetadata.lessons;

  // Find current lesson index
  const currentLessonIndex = allLessons.findIndex(
    (lesson) => lesson.slug === lessonName,
  );

  // const lessonMetadata = courseMetadata.lessons[currentLessonIndex];

  // Get next lesson slug (if exists)
  const nextLesson = allLessons[currentLessonIndex + 1];
  const nextLessonSlug = nextLesson ? nextLesson.slug : "";

  // Get previous lesson slug (if exists)
  // const previousLesson = allLessons[currentLessonIndex - 1];
  // const previousLessonSlug = previousLesson ? previousLesson.slug : "";

  // Check if this is the last lesson
  const isLastLesson = currentLessonIndex === allLessons.length - 1;

  return (
    <div className="flex flex-col w-full">
      <div
        className="px-4 py-14 max-w-app md:px-8 lg:px-14 mx-auto w-full flex lg:flex-row flex-col lg:items-center gap-y-12 lg:gap-y-0 justify-start lg:justify-between"
        style={{
          background: `linear-gradient(180deg, rgb(${courseColors[courseMetadata.language]},0.05) 0%, transparent 100%)`,
        }}
      >
        <div className="flex flex-col gap-y-2">
          <div className="flex items-center gap-x-2">
            <Icon name={courseMetadata.language} />
            <span
              className="font-medium text-xl font-mono relative top-0.25"
              style={{ color: `rgb(${courseColors[courseMetadata.language]})` }}
            >
              {courseMetadata.language}
            </span>
          </div>
          <span className="sr-only">{courseMetadata.title}</span>
          <HeadingReveal
            text={courseMetadata.title}
            headingLevel="h1"
            className="text-3xl font-semibold"
          />
        </div>
      </div>

      <Divider />

      <div className="flex flex-col gap-y-8 h-full relative px-4 md:px-8 lg:px-14 mx-auto w-full mt-[36px] border-b border-border">
        <div className="grid grid-cols-1 lg:grid-cols-10 xl:grid-cols-13 gap-y-24 lg:gap-y-0 gap-x-0 lg:gap-x-6">
          <CoursePagination
            courseName={courseMetadata.title}
            currentLesson={currentLessonIndex + 1}
            lessons={allLessons.map((lesson) => ({
              title: lesson.title,
              slug: lesson.slug,
            }))}
          />
          <div className="pb-8 pt-[36px] -mt-[36px] order-2 lg:order-1 col-span-1 md:col-span-7 flex flex-col gap-y-8 xl:border-x border-border xl:px-6">
            <MdxLayout>
              <Lesson />
            </MdxLayout>
            {nextLesson && (
              <Link
                href={`/courses/${courseMetadata.title.toLowerCase().replace(/\s+/g, "-")}/${nextLessonSlug}`}
                className="flex justify-between items-center w-full bg-background-card border border-border group py-5 px-5 rounded-xl"
              >
                <div className="flex items-center gap-x-2">
                  <span className="text-mute text-sm">Next Lesson</span>
                  <span className="font-medium text-primary">
                    {nextLesson?.title}
                  </span>
                </div>
                <Icon
                  name="ArrowRight"
                  className="text-mute text-sm group-hover:text-primary group-hover:translate-x-1 transition"
                />
              </Link>
            )}
          </div>
          <TableOfContents />
        </div>
        <CourseChallengeButton
          isCourseReady={isLastLesson}
          courseName={courseMetadata.title.toLowerCase().replace(/\s+/g, "-")}
        />
      </div>
    </div>
  );
}
