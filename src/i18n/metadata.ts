import { getPathname } from "./navigation";
import { routing } from "./routing";

type LocalePathMap = Record<string, string>;

export function getLocalizedPathMap(href: string): LocalePathMap {
  return Object.fromEntries(
    routing.locales.map((locale) => [locale, getPathname({ locale, href })]),
  );
}

export function getLocalizedAlternates(href: string, locale: string) {
  return {
    canonical: getPathname({ locale, href }),
    languages: getLocalizedPathMap(href),
  };
}
