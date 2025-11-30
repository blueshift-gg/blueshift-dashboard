import { BRAND_COLOURS } from "@blueshift-gg/ui-components";

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
  Anchor: BRAND_COLOURS.anchor,
  Rust: BRAND_COLOURS.rust,
  Typescript: BRAND_COLOURS.typescript,
  Assembly: BRAND_COLOURS.assembly,
  General: BRAND_COLOURS.general,
} as const;

export const difficulty = {
  1: "Beginner",
  2: "Intermediate",
  3: "Advanced",
  4: "Expert",
} as const;

export const difficultyColors = {
  1: BRAND_COLOURS.beginner,
  2: BRAND_COLOURS.intermediate,
  3: BRAND_COLOURS.advanced,
  4: BRAND_COLOURS.expert,
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
