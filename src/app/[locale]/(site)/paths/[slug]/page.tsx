import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import PathDetailHeader from "@/app/components/PathsContent/PathDetailHeader";
import PathStepsList from "@/app/components/PathsContent/PathStepsList";
import { getPathStepsWithMetadata } from "@/app/utils/content";
import { buildLocalizedMetadata } from "@/i18n/metadata";

interface PathPageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

export async function generateMetadata({ params }: PathPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale });
  const href = `/paths/${slug}`;
  const title = `${t("metadata.title")} | ${t(`paths.${slug}.title`)}`;

  return buildLocalizedMetadata({
    href,
    locale,
    title,
    description: t(`paths.${slug}.description`),
    openGraph: {
      images: [
        {
          url: `/graphics/path-banners/${slug}.png`,
          width: 1200,
          height: 630,
          alt: t(`paths.${slug}.title`),
        },
      ],
    },
  });
}

export default async function PathPage({ params }: PathPageProps) {
  const t = await getTranslations();
  const { slug } = await params;

  let pathData: Awaited<ReturnType<typeof getPathStepsWithMetadata>>;
  try {
    pathData = await getPathStepsWithMetadata(slug);
  } catch {
    notFound();
  }

  const { path, stepsWithMetadata } = pathData;
  const pathTitle = t(`paths.${slug}.title`);

  return (
    <div className="flex w-full flex-col gap-y-0">
      <div className="relative mx-auto w-full max-w-app border-border-light app:border-x">
        <Breadcrumbs items={[{ label: t("header.paths"), href: "/" }, { label: pathTitle }]} />
        <PathDetailHeader slug={slug} steps={stepsWithMetadata} showBorder={false} />
      </div>
      <PathStepsList path={path} steps={stepsWithMetadata} />
    </div>
  );
}
