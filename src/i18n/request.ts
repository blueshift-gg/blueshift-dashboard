import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

type MessageTree = Record<string, unknown>;

const isMessageTree = (value: unknown): value is MessageTree =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Locale message files are partial, so overlay them on the English defaults
 * key by key.
 */
const mergeMessages = (base: MessageTree, override: MessageTree): MessageTree =>
  Object.fromEntries(
    Object.entries({ ...base, ...override }).map(([key, value]) => [
      key,
      isMessageTree(value) && isMessageTree(base[key]) ? mergeMessages(base[key], value) : value,
    ]),
  );

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const localeCoreMessages = (await import(`../../messages/${locale}/core.json`)).default;
  const defaultCoreMessages = (await import(`../../messages/en/core.json`)).default;
  const coreMessages = mergeMessages(defaultCoreMessages, localeCoreMessages);

  const localeCoursesMessages = (await import(`../../messages/${locale}/courses.json`)).default;
  const defaultCoursesMessages = (await import(`../../messages/en/courses.json`)).default;
  const coursesMessages = mergeMessages(defaultCoursesMessages, localeCoursesMessages);

  const localeChallengesMessages = (await import(`../../messages/${locale}/challenges.json`))
    .default;
  const defaultChallengesMessages = (await import(`../../messages/en/challenges.json`)).default;
  const challengesMessages = mergeMessages(defaultChallengesMessages, localeChallengesMessages);

  return {
    locale,
    messages: {
      ...coreMessages,
      ...coursesMessages,
      ...challengesMessages,
    },
  };
});
