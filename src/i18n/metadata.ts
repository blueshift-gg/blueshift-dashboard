import type { Metadata } from "next";
import { URLS } from "@/constants/urls";
import { getPathname } from "./navigation";
import { routing } from "./routing";

type LocalePathMap = Record<string, string>;
type OpenGraphImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

interface LocalizedMetadataOptions {
  href: string;
  locale: string;
  title: string;
  description: string;
  keywords?: Metadata["keywords"];
  openGraph?: {
    title?: string;
    type?: "website" | "article";
    siteName?: string;
    images?: OpenGraphImage[];
  };
}

const DEFAULT_OPEN_GRAPH_IMAGE: OpenGraphImage = {
  url: `${URLS.BLUESHIFT_EDUCATION}/graphics/meta-image.png`,
  width: 1200,
  height: 628,
};

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

export function buildLocalizedMetadata({
  href,
  locale,
  title,
  description,
  keywords,
  openGraph,
}: LocalizedMetadataOptions): Metadata {
  const alternates = getLocalizedAlternates(href, locale);

  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates,
    openGraph: {
      title: openGraph?.title ?? title,
      type: openGraph?.type ?? "website",
      description,
      siteName: openGraph?.siteName ?? title,
      url: alternates.canonical,
      images: openGraph?.images ?? [DEFAULT_OPEN_GRAPH_IMAGE],
    },
  };
}
