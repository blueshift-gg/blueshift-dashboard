import type { MetadataRoute } from "next";
import { challenges } from "@/app/content/challenges/challenges";
import { courses } from "@/app/content/courses/courses";
import { URLS } from "@/constants/urls";
import { getLocalizedPathMap } from "@/i18n/metadata";

const BASE_URL = URLS.BLUESHIFT_EDUCATION;

function toAbsoluteUrl(path: string) {
  return `${BASE_URL}${path}`;
}

function buildLocalizedEntries(href: string, lastModified: Date): MetadataRoute.Sitemap {
  const localizedPaths = getLocalizedPathMap(href);
  const languages = Object.fromEntries(
    Object.entries(localizedPaths).map(([locale, path]) => [locale, toAbsoluteUrl(path)]),
  );

  return Object.values(localizedPaths).map((path) => ({
    url: toAbsoluteUrl(path),
    lastModified,
    alternates: {
      languages,
    },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const entries: MetadataRoute.Sitemap = [];

  entries.push(...buildLocalizedEntries("/", lastModified));
  entries.push(...buildLocalizedEntries("/challenges", lastModified));
  entries.push(...buildLocalizedEntries("/courses", lastModified));

  for (const challenge of challenges) {
    entries.push(...buildLocalizedEntries(`/challenges/${challenge.slug}`, lastModified));

    if (challenge.pages) {
      for (const page of challenge.pages) {
        entries.push(
          ...buildLocalizedEntries(`/challenges/${challenge.slug}/${page.slug}`, lastModified),
        );
      }
    }
  }

  for (const course of courses) {
    if (course.lessons) {
      for (const lesson of course.lessons) {
        entries.push(
          ...buildLocalizedEntries(`/courses/${course.slug}/${lesson.slug}`, lastModified),
        );
      }
    }
  }

  return entries;
}
