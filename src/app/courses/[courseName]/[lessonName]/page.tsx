export const runtime = "edge";

interface LessonPageProps {
    params: Promise<{
      courseName: string;
      lessonName: string;
    }>;
  }

export default async function LessonPage({ params }: LessonPageProps) {
    const { courseName, lessonName } = await params;
    const { default: Lesson } = await import(`@/app/content/courses/${courseName}/${lessonName}.mdx`)

  return <Lesson />;
}
