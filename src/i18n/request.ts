import deepmerge from 'deepmerge';
import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';

export default getRequestConfig(async ({requestLocale}) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const localeCoreMessages = (await import(`../../messages/${locale}/core.json`)).default;
  const defaultCoreMessages = (await import(`../../messages/en/core.json`)).default;
  const coreMessages = deepmerge(defaultCoreMessages, localeCoreMessages);
  
  const localeCoursesMessages = (await import(`../../messages/${locale}/courses.json`)).default;
  const defaultCoursesMessages = (await import(`../../messages/en/courses.json`)).default;
  const coursesMessages = deepmerge(defaultCoursesMessages, localeCoursesMessages);
  
  const localeChallengesMessages = (await import(`../../messages/${locale}/challenges.json`)).default;
  const defaultChallengesMessages = (await import(`../../messages/en/challenges.json`)).default;
  const challengesMessages = deepmerge(defaultChallengesMessages, localeChallengesMessages);


  return {
    locale,
    messages: {
      ...coreMessages,
      ...coursesMessages,
      ...challengesMessages
    }
  };
});