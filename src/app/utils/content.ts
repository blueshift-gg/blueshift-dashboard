import { CourseMetadata, LessonMetadata } from "./course";
import { notFound } from "next/navigation";
import { courses } from "@/app/content/courses/courses";
import { challenges } from "@/app/content/challenges/challenges";
import { paths } from "@/app/content/paths/paths";
import { ChallengeMetadata } from "./challenges";
import { PathMetadata } from "./path";

export async function getCourse(courseSlug: string): Promise<CourseMetadata> {
  const course = courses.find((course) => course.slug === courseSlug);

  if (!course) {
    notFound();
  }

  return {
    ...structuredClone(course),
    lessons: course.lessons.map((lesson, index) => ({
      ...structuredClone(lesson),
      lessonNumber: index + 1,
    })),
  };
}

export async function getAllCourses(): Promise<CourseMetadata[]> {
  return structuredClone(courses);
}

export async function getCourseLessons(
  courseSlug: string
): Promise<LessonMetadata[]> {
  const course = await getCourse(courseSlug);

  if (!course) {
    notFound();
  }

  return structuredClone(course.lessons);
}

export async function getChallenge(
  challengeSlug: string | undefined | null
): Promise<ChallengeMetadata | undefined> {
  const challenge = challenges.find(
    (challenge) => challenge.slug === challengeSlug
  );

  return structuredClone(challenge);
}

export async function getAllChallenges(): Promise<ChallengeMetadata[]> {
  return structuredClone(challenges);
}

export async function getPath(pathSlug: string): Promise<PathMetadata> {
  const path = paths.find((path) => path.slug === pathSlug);

  if (!path) {
    notFound();
  }

  return structuredClone(path);
}

export async function getAllPaths(): Promise<PathMetadata[]> {
  const allPaths = structuredClone(paths);

  const enrichedPaths = await Promise.all(
    allPaths.map(async (path) => {
      const stepsWithMetadata = await Promise.all(
        path.steps.map(async (step) => {
          let metadata: CourseMetadata | ChallengeMetadata | undefined;

          if (step.type === "course") {
            try {
              metadata = await getCourse(step.slug);
            } catch {
              metadata = undefined;
            }
          } else {
            metadata = await getChallenge(step.slug);
          }

          return {
            ...step,
            metadata,
          };
        })
      );

      return {
        ...path,
        steps: stepsWithMetadata,
      };
    })
  );

  return enrichedPaths;
}

export async function getPathStepsWithMetadata(pathSlug: string): Promise<{
  path: PathMetadata;
  stepsWithMetadata: Array<{
    type: "course" | "challenge";
    slug: string;
    description?: string;
    metadata: CourseMetadata | ChallengeMetadata | undefined;
  }>;
}> {
  const path = await getPath(pathSlug);

  const stepsWithMetadata = await Promise.all(
    path.steps.map(async (step) => {
      let metadata: CourseMetadata | ChallengeMetadata | undefined;

      if (step.type === "course") {
        try {
          metadata = await getCourse(step.slug);
        } catch {
          metadata = undefined;
        }
      } else {
        metadata = await getChallenge(step.slug);
      }

      return {
        ...step,
        metadata,
      };
    })
  );

  return {
    path,
    stepsWithMetadata,
  };
}
