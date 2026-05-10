import type { ChallengeMetadata } from "./challenges";
import type { CourseLanguages, CourseMetadata } from "./course";
import { getPathCompletedSteps, type PathMetadata } from "./path";

export type RecommendationSignals = {
  preferredLanguages?: CourseLanguages[];
  preferredDifficulties?: number[];
  courseProgress?: Record<string, number>;
  challengeStatuses?: Record<string, "open" | "completed" | "claimed">;
  seed?: number | string;
  limit?: number;
};

type Scored<T> = { item: T; score: number };

const DEFAULT_LIMIT = 3;
const TIE_EPSILON = 0.15;

const WEIGHTS = {
  language: 2, // intent: prioritize user category/language preference
  difficulty: 1.4, // intent: prefer matching or near difficulty
  inProgress: 3, // nudge: resume partially done items
  freshStart: 1.2, // nudge: gentle push to start something new
  featured: 0.8, // editorial: small boost for featured picks
  ease: 0.8, // usability: mild bias to easier content
  duration: 0.6, // time-to-try: prefer shorter when known
  pendingChallenge: 1.5, // completion: finish attached capstone
  status: {
    open: 2.5, // challenges: prefer open
    completed: 0.6, // challenges: allow completed to surface if needed
    claimed: Number.NEGATIVE_INFINITY, // challenges: hide claimed
  },
} as const;

const matchLanguage = (
  language: CourseLanguages,
  preferredLanguages?: CourseLanguages[],
): number => {
  if (!preferredLanguages || preferredLanguages.length === 0) return 0;
  return preferredLanguages.includes(language) ? WEIGHTS.language : 0;
};

const difficultyAffinity = (difficulty: number, preferredDifficulties?: number[]): number => {
  if (!preferredDifficulties || preferredDifficulties.length === 0) return 0;
  // Reward near-matches: max(0, 1 - distance/3) scaled by weight
  const bestMatch = preferredDifficulties.reduce((best, pref) => {
    const affinity = Math.max(0, 1 - Math.abs(difficulty - pref) / 3);
    return Math.max(best, affinity);
  }, 0);
  return bestMatch * WEIGHTS.difficulty;
};

const easeScore = (difficulty: number): number => {
  // Slightly favor easier content without overwhelming preferences
  return Math.max(0.15, 1 - difficulty * 0.2) * WEIGHTS.ease;
};

const fillWithFallback = <T extends { slug: string }>(
  primary: T[],
  candidates: T[],
  limit: number,
): T[] => {
  if (primary.length >= limit) {
    return primary.slice(0, limit);
  }

  const seen = new Set(primary.map((item) => item.slug));
  const extras = candidates.filter((item) => !seen.has(item.slug));
  return [...primary, ...extras].slice(0, limit);
};

const stableHash = (value: string | number): number => {
  // Small FNV-1a style hash for deterministic tie-breaking
  const str = String(value);
  let hash = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
};

const compareWithSeed = <T extends { slug: string }>(
  a: Scored<T>,
  b: Scored<T>,
  seed: number | string | undefined,
): number => {
  if (a.score === b.score) {
    if (seed !== undefined) {
      const seedHash = stableHash(seed);
      const aHash = stableHash(a.item.slug + seedHash);
      const bHash = stableHash(b.item.slug + seedHash);
      if (aHash !== bHash) return bHash - aHash;
    }
    return a.item.slug.localeCompare(b.item.slug);
  }
  const diff = Math.abs(a.score - b.score);
  if (diff < TIE_EPSILON && seed !== undefined) {
    const seedHash = stableHash(seed);
    const aHash = stableHash(a.item.slug + seedHash);
    const bHash = stableHash(b.item.slug + seedHash);
    if (aHash !== bHash) return bHash - aHash;
  }
  return b.score - a.score;
};

export function recommendPaths(
  paths: PathMetadata[],
  signals: RecommendationSignals = {},
): PathMetadata[] {
  const {
    courseProgress = {},
    challengeStatuses = {},
    preferredLanguages = [],
    preferredDifficulties = [],
    seed,
    limit = DEFAULT_LIMIT,
  } = signals;

  const scored = paths.map<Scored<PathMetadata>>((path) => {
    const totalSteps = path.steps.length;
    if (totalSteps <= 0) {
      return { item: path, score: Number.NEGATIVE_INFINITY };
    }

    const completedSteps = getPathCompletedSteps(path.steps, courseProgress, challengeStatuses);
    const completionRatio = completedSteps / totalSteps;
    const isCompleted = completedSteps >= totalSteps;

    if (isCompleted) {
      return { item: path, score: Number.NEGATIVE_INFINITY };
    }

    const inProgressBonus =
      completionRatio > 0 && completionRatio < 1
        ? WEIGHTS.inProgress * (0.8 + completionRatio * 0.2)
        : 0;
    const freshStartBonus = completionRatio === 0 ? WEIGHTS.freshStart : 0;
    const featuredBonus = path.isFeatured ? WEIGHTS.featured : 0;
    const languageBonus = matchLanguage(path.language as CourseLanguages, preferredLanguages);
    const difficultyBonus = difficultyAffinity(path.difficulty, preferredDifficulties);
    const durationBonus = path.estimatedHours
      ? Math.max(0.1, 1 - Math.min(path.estimatedHours, 30) / 45) * WEIGHTS.duration
      : 0.2 * WEIGHTS.duration;

    const score =
      inProgressBonus +
      freshStartBonus +
      featuredBonus +
      languageBonus +
      difficultyBonus +
      easeScore(path.difficulty) +
      durationBonus;

    return { item: path, score };
  });

  const ranked = scored
    .filter((entry) => entry.score > Number.NEGATIVE_INFINITY)
    .sort((a, b) => compareWithSeed(a, b, seed))
    .map((entry) => entry.item);

  return fillWithFallback(ranked.slice(0, limit), ranked.slice(limit), limit);
}

export function recommendCourses(
  courses: CourseMetadata[],
  signals: RecommendationSignals = {},
): CourseMetadata[] {
  const {
    courseProgress = {},
    challengeStatuses = {},
    preferredLanguages = [],
    preferredDifficulties = [],
    seed,
    limit = DEFAULT_LIMIT,
  } = signals;

  const scored = courses.map<Scored<CourseMetadata>>((course) => {
    const totalLessons = course.lessons.length;
    if (totalLessons <= 0) {
      return { item: course, score: Number.NEGATIVE_INFINITY };
    }
    const progress = courseProgress[course.slug] || 0;
    const progressRatio = Math.min(progress / totalLessons, 1);
    const challengeStatus = course.challenge ? challengeStatuses[course.challenge] : undefined;
    const challengeComplete =
      !course.challenge || ["completed", "claimed"].includes(challengeStatus || "open");
    const hasPendingChallenge = Boolean(
      course.challenge && !challengeComplete && progress >= totalLessons,
    );
    const isCompleted = progress >= totalLessons && challengeComplete;

    if (isCompleted) {
      return { item: course, score: Number.NEGATIVE_INFINITY };
    }

    const inProgressBonus =
      progressRatio > 0 && progressRatio < 1
        ? WEIGHTS.inProgress * (0.85 + progressRatio * 0.15)
        : 0;
    const challengeBonus = hasPendingChallenge ? WEIGHTS.pendingChallenge : 0;
    const freshStartBonus = progressRatio === 0 ? WEIGHTS.freshStart : 0;
    const featuredBonus = course.isFeatured ? WEIGHTS.featured : 0;
    const languageBonus = matchLanguage(course.language, preferredLanguages);
    const difficultyBonus = difficultyAffinity(course.difficulty, preferredDifficulties);

    const score =
      inProgressBonus +
      challengeBonus +
      freshStartBonus +
      featuredBonus +
      languageBonus +
      difficultyBonus +
      easeScore(course.difficulty);

    return { item: course, score };
  });

  const ranked = scored
    .filter((entry) => entry.score > Number.NEGATIVE_INFINITY)
    .sort((a, b) => compareWithSeed(a, b, seed))
    .map((entry) => entry.item);

  return fillWithFallback(ranked.slice(0, limit), ranked.slice(limit), limit);
}

export function recommendChallenges(
  challenges: ChallengeMetadata[],
  signals: RecommendationSignals = {},
): ChallengeMetadata[] {
  const {
    challengeStatuses = {},
    preferredLanguages = [],
    preferredDifficulties = [],
    seed,
    limit = DEFAULT_LIMIT,
  } = signals;

  const scored = challenges.map<Scored<ChallengeMetadata>>((challenge) => {
    const status = challengeStatuses[challenge.slug] || "open";
    const statusScore = WEIGHTS.status[status] ?? 0;

    const score =
      statusScore +
      (challenge.isFeatured ? WEIGHTS.featured : 0) +
      matchLanguage(challenge.language as CourseLanguages, preferredLanguages) +
      difficultyAffinity(challenge.difficulty, preferredDifficulties) +
      easeScore(challenge.difficulty);

    return { item: challenge, score };
  });

  const ranked = scored
    .filter((entry) => entry.score > Number.NEGATIVE_INFINITY)
    .sort((a, b) => compareWithSeed(a, b, seed))
    .map((entry) => entry.item);

  return fillWithFallback(ranked.slice(0, limit), ranked.slice(limit), limit);
}
