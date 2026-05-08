import type { MetadataRoute } from "next";
import { challenges } from "@/app/content/challenges/challenges";
import { courses } from "@/app/content/courses/courses";
import { URLS } from "@/constants/urls";
import { routing } from "@/i18n/routing";

const BASE_URL = URLS.BLUESHIFT_EDUCATION;

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemapEntries: MetadataRoute.Sitemap = [];

  const getLanguageAlternates = (path: string) => {
    const languages: Record<string, string> = {};
    for (const locale of routing.locales) {
      languages[locale] = `${BASE_URL}/${locale}${path}`;
    }
    return languages;
  };

  for (const locale of routing.locales) {
    sitemapEntries.push(
      // Home
      {
        url: `${BASE_URL}/${locale}`,
        lastModified: new Date(),
        alternates: {
          languages: getLanguageAlternates(""),
        },
      },
      // Challenges main pages
      {
        url: `${BASE_URL}/${locale}/challenges`,
        lastModified: new Date(),
        alternates: {
          languages: getLanguageAlternates("/challenges"),
        },
      },
      // Courses main pages
      {
        url: `${BASE_URL}/${locale}/courses`,
        lastModified: new Date(),
        alternates: {
          languages: getLanguageAlternates("/courses"),
        },
      },
    );

    // Challenges
    for (const challenge of challenges) {
      sitemapEntries.push({
        url: `${BASE_URL}/${locale}/challenges/${challenge.slug}`,
        lastModified: new Date(),
        alternates: {
          languages: getLanguageAlternates(`/challenges/${challenge.slug}`),
        },
      });

      if (challenge.pages) {
        for (const page of challenge.pages) {
          sitemapEntries.push({
            url: `${BASE_URL}/${locale}/challenges/${challenge.slug}/${page.slug}`,
            lastModified: new Date(),
            alternates: {
              languages: getLanguageAlternates(
                `/challenges/${challenge.slug}/${page.slug}`,
              ),
            },
          });
        }
      }
    }

    // Courses
    for (const course of courses) {
      // The following to be uncommented when course have dedicated pages
      //   sitemapEntries.push({
      //     url: `${BASE_URL}/${locale}/courses/${course.slug}`,
      //     lastModified: new Date(),
      //     alternates: {
      //       languages: getLanguageAlternates(`/courses/${course.slug}`),
      //     },
      //   });

      if (course.lessons) {
        for (const lesson of course.lessons) {
          sitemapEntries.push({
            url: `${BASE_URL}/${locale}/courses/${course.slug}/${lesson.slug}`,
            lastModified: new Date(),
            alternates: {
              languages: getLanguageAlternates(
                `/courses/${course.slug}/${lesson.slug}`,
              ),
            },
          });
        }
      }
    }
  }

  return sitemapEntries;
}
