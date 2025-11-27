/**
 * Common/shared constants and types used across courses, challenges, and paths.
 */

export const languages = {
  Anchor: "Anchor",
  Rust: "Rust",
  Typescript: "TypeScript",
  Assembly: "Assembly",
  General: "General",
} as const;

export const languageColors = {
  Anchor: "221,234,224",
  Rust: "255,173,102",
  Typescript: "105,162,241",
  Assembly: "140,255,102",
  General: "0,255,255",
} as const;

export const difficulty = {
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

export type Language = keyof typeof languages;
export type Difficulty = keyof typeof difficulty;
export type DifficultyLabel = (typeof difficulty)[Difficulty];

export const languageFilterMap: Record<string, Language> = {
  assembly: "Assembly",
  anchor: "Anchor",
  general: "General",
  rust: "Rust",
  typescript: "Typescript",
};

export const reverseLanguageFilterMap = Object.fromEntries(
  Object.entries(languageFilterMap).map(([k, v]) => [v, k])
) as Record<Language, string>;

export const difficultyFilterMap: Record<string, Difficulty> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

export const reverseDifficultyFilterMap = Object.fromEntries(
  Object.entries(difficultyFilterMap).map(([k, v]) => [v, k])
) as Record<number, string>;
