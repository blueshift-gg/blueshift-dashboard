import { getTranslations } from "next-intl/server";
import { getPathStepsWithMetadata } from "@/app/utils/content";
import { notFound } from "next/navigation";
import PathStepsList from "@/app/components/PathsContent/PathStepsList";
import PathDetailHeader from "@/app/components/PathsContent/PathDetailHeader";
import { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";

interface PathPageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: PathPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale });
  const pathname = getPathname({
    locale,
    href: `/paths/${slug}`,
  });

  const title = `${t("metadata.title")} | ${t(`paths.${slug}.title`)}`;

  return {
    title: title,
    description: t(`paths.${slug}.description`),
    openGraph: {
      title: title,
      type: "website",
      description: t(`paths.${slug}.description`),
      siteName: title,
      url: pathname,
    },
  };
}

export default async function PathPage({ params }: PathPageProps) {
  const { slug, locale } = await params;

  let pathData;
  try {
    pathData = await getPathStepsWithMetadata(slug);
  } catch {
    notFound();
  }

  const { path, stepsWithMetadata } = pathData;

  return (
    <div className="flex flex-col w-full gap-y-0 px-3 sm:px-4">
      <PathDetailHeader 
        slug={slug}
        steps={stepsWithMetadata}
      />
      <PathStepsList 
        path={path} 
        steps={stepsWithMetadata} 
        locale={locale}
      />
    </div>
  );
}
