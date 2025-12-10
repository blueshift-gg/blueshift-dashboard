import {
  languages,
  languageColors,
  difficulty,
  Language,
  Difficulty,
} from "./common";
import { CourseDifficulty, CourseMetadata } from "./course";
import { ChallengeMetadata } from "./challenges";

// Re-export with path-specific names for consistency
export const pathLanguages = languages;
export const pathColors = languageColors;
export const pathDifficulty = difficulty;

export type PathStepType = "course" | "challenge";

export type PathStep = {
  /** Type of content: course or challenge */
  type: PathStepType;
  /** Slug reference to the course or challenge */
  slug: string;
  /** Optional description override for this step */
  description?: string;
};

export type PathStepWithMetadata = PathStep & {
  metadata?: CourseMetadata | ChallengeMetadata;
};

export type PathMetadata = {
  /** Unique identifier for the path */
  slug: string;
  /** Primary language/framework focus of the path */
  language: PathLanguages;
  /** Color for UI display (RGB format) */
  color: string;
  /** Difficulty level 1-4 */
  difficulty: PathDifficulty;
  /** Whether to feature this path prominently */
  isFeatured: boolean;
  /** Ordered list of steps (courses and challenges) in this path */
  steps: PathStepWithMetadata[];
  /** Estimated total time to complete in hours */
  estimatedHours?: number;
};

export type PathLanguages = keyof typeof pathLanguages;
export type PathDifficulty = keyof typeof pathDifficulty;

/**
 * Calculate the overall difficulty of a path based on its steps' content.
 * Returns the maximum difficulty found across all steps.
 */
export function calculatePathDifficulty(stepDifficulties: CourseDifficulty[]): PathDifficulty {
  if (stepDifficulties.length === 0) return 1;
  return Math.max(...stepDifficulties) as PathDifficulty;
}

/**
 * Determine if a path has mixed languages.
 */
export function hasMultipleLanguages(langs: Language[]): boolean {
  const uniqueLanguages = new Set(langs.filter(l => l !== "General"));
  return uniqueLanguages.size > 1;
}

/**
 * Calculate the number of completed steps in a path.
 * A course step is considered completed if progress > 0.
 * A challenge step is considered completed if status is "completed" or "claimed".
 */
export function getPathCompletedSteps(
  steps: PathStepWithMetadata[],
  courseProgress: Record<string, number>,
  challengeStatuses: Record<string, string>
): number {
  return steps.filter((step) => {
    if (step.type === "course") {
      const progress = courseProgress[step.slug] || 0;
      const metadata = step.metadata as CourseMetadata | undefined;
      if (metadata?.lessons) {
        return progress >= metadata.lessons.length;
      }
      return false;
    }

    if (step.type === "challenge") {
      const status = challengeStatuses[step.slug];
      return status === "completed" || status === "claimed";
    }

    return false;
  }).length;
}
