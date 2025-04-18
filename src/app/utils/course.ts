export const courseLanguages = {
  Anchor: "Anchor",
  Rust: "Rust",
  Typescript: "Typescript",
} as const;

export const courseColors = {
  Anchor: "221,234,224",
  Rust: "255,173,102",
  Typescript: "105,162,241",
} as const;

export const courseDifficulty = {
  1: "Beginner",
  2: "Intermediate",
  3: "Advanced",
  4: "Expert",
} as const;

export const difficultyColors = {
  1: "#00C7E6",
  2: "#00E66B",
  3: "#E6D700",
  4: "#FF285A",
} as const;

export const courseStatus = {
  Incomplete: "Incomplete",
  Complete: "Complete",
  Challenge_Completed: "Challenge_Completed",
} as const;

export const rewardsStatus = {
  Unclaimed: "Unclaimed",
  Locked: "Locked",
  Claimed: "Claimed",
} as const;

export type CourseMetadata = {
  title: string;
  language: CourseLanguages;
  color: string;
  difficulty: CourseDifficulty;
  isFeatured: boolean;
  status?: RewardsStatus;
  totalLessons: number;
};

export type LessonMetadata = {
  title: string;
  lessonNumber: number;
  slug: string;
};

export type RewardsStatus = keyof typeof rewardsStatus;
export type CourseLanguages = keyof typeof courseLanguages;
export type CourseDifficulty = keyof typeof courseDifficulty;
